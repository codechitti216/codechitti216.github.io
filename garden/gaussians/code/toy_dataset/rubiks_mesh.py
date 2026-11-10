from __future__ import annotations

import numpy as np
import trimesh
from PIL import Image, ImageDraw


def _face_grid_texture(
    base_rgb: np.ndarray,
    tex_size: int = 384,
    groove_px: int = 5,
) -> Image.Image:
    """
    Square texture with a 3×3 sticker grid and dark grooves (Rubik-style).

    All nine stickers use the same RGB (solved-cube look). Black lines are the only variation.
    """
    if tex_size % 3 != 0:
        tex_size = (tex_size // 3) * 3
    cell = tex_size // 3
    groove = max(2, int(groove_px))
    img = Image.new("RGB", (tex_size, tex_size), (12, 12, 14))
    draw = ImageDraw.Draw(img)
    rgb = tuple(int(x) for x in np.clip(base_rgb.astype(np.int32), 0, 255))

    margin = groove // 2 + 1
    for r in range(3):
        for c in range(3):
            x0, y0 = c * cell, r * cell
            x1, y1 = x0 + cell, y0 + cell
            draw.rectangle(
                [x0 + margin, y0 + margin, x1 - margin - 1, y1 - margin - 1],
                fill=rgb,
            )

    # Emphasize grid lines (covers any slight gaps; matches molded plastic seams).
    lw = max(2, groove - 1)
    for i in (1, 2):
        x = i * cell
        y = i * cell
        draw.rectangle([x - lw // 2, 0, x + lw // 2, tex_size - 1], fill=(0, 0, 0))
        draw.rectangle([0, y - lw // 2, tex_size - 1, y + lw // 2], fill=(0, 0, 0))

    # Outer frame (edge of the face / cubie gap).
    frame = max(2, groove)
    draw.rectangle([0, 0, tex_size - 1, frame - 1], fill=(0, 0, 0))
    draw.rectangle([0, tex_size - frame, tex_size - 1, tex_size - 1], fill=(0, 0, 0))
    draw.rectangle([0, 0, frame - 1, tex_size - 1], fill=(0, 0, 0))
    draw.rectangle([tex_size - frame, 0, tex_size - 1, tex_size - 1], fill=(0, 0, 0))

    return img


def make_rubiks_colored_box(half_extent: float = 0.5, rng: np.random.Generator | None = None) -> trimesh.Trimesh:
    """
    Axis-aligned cube centered at origin with a 3×3 sticker grid on each face.

    Uses one horizontal texture atlas (6 faces) so pyrender gets a single textured mesh.
    """
    _ = rng  # reserved for future dataset variants (keeps call signature stable)
    h = float(half_extent)
    tex_size = 384

    # Order: -X, +X, -Y, +Y, -Z, +Z (matches prior Rubik-inspired palette).
    bases = np.array(
        [
            [200, 40, 40],
            [240, 120, 40],
            [240, 240, 240],
            [240, 220, 40],
            [40, 80, 220],
            [40, 160, 80],
        ],
        dtype=np.uint8,
    )

    tiles = [_face_grid_texture(bases[k], tex_size=tex_size) for k in range(6)]
    atlas_w = tex_size * 6
    atlas = Image.new("RGB", (atlas_w, tex_size))
    for k, tile in enumerate(tiles):
        atlas.paste(tile, (k * tex_size, 0))

    # Four vertices per face: CCW when viewed from **outside** (outward normal).
    # Wrong winding → back-face culling hides whole faces in pyrender/OpenGL.
    faces_xyz = [
        # -X red (normal -X)
        np.array(
            [[-h, -h, -h], [-h, -h, h], [-h, h, h], [-h, h, -h]],
            dtype=np.float64,
        ),
        # +X orange
        np.array(
            [[h, -h, -h], [h, h, -h], [h, h, h], [h, -h, h]],
            dtype=np.float64,
        ),
        # -Y white (bottom, normal -Y)
        np.array(
            [[-h, -h, h], [-h, -h, -h], [h, -h, -h], [h, -h, h]],
            dtype=np.float64,
        ),
        # +Y yellow (top)
        np.array(
            [[-h, h, -h], [-h, h, h], [h, h, h], [h, h, -h]],
            dtype=np.float64,
        ),
        # -Z blue
        np.array(
            [[h, -h, -h], [-h, -h, -h], [-h, h, -h], [h, h, -h]],
            dtype=np.float64,
        ),
        # +Z green
        np.array(
            [[-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]],
            dtype=np.float64,
        ),
    ]

    vertices: list[list[float]] = []
    faces: list[list[int]] = []
    uvs: list[list[float]] = []

    for k, xyz in enumerate(faces_xyz):
        base = len(vertices)
        for row in xyz:
            vertices.append(row.tolist())
        faces.extend([[base + 0, base + 1, base + 2], [base + 0, base + 2, base + 3]])
        u0 = k / 6.0
        u1 = (k + 1) / 6.0
        # v=0 at bottom for OpenGL-style sampling (PIL has y down; trimesh/pyrender align with this ordering).
        uvs.extend([[u0, 1.0], [u1, 1.0], [u1, 0.0], [u0, 0.0]])

    v = np.asarray(vertices, dtype=np.float64)
    f = np.asarray(faces, dtype=np.int64)
    uv = np.asarray(uvs, dtype=np.float64)

    visual = trimesh.visual.texture.TextureVisuals(uv=uv, image=atlas)
    mesh = trimesh.Trimesh(vertices=v, faces=f, visual=visual, process=False, validate=False)
    return mesh


def mesh_pose_gl(mesh: trimesh.Trimesh) -> np.ndarray:
    """4x4 node pose for pyrender: mesh vertices are assumed in world coordinates -> identity."""
    return np.eye(4, dtype=np.float64)
