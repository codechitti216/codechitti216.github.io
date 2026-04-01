from __future__ import annotations

import numpy as np
import pyrender
import trimesh


def render_rgb_depth_mask(
    mesh: trimesh.Trimesh,
    T_c2w_gl: np.ndarray,
    width: int,
    height: int,
    yfov_deg: float,
    bg_color: tuple[float, float, float] = (0.15, 0.15, 0.18),
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Returns:
      rgb: uint8 HxWx3
      depth: float32 HxW (scene units; 0 where background)
      mask: uint8 HxW {0,255} foreground
    """
    # High ambient + mild key light keeps each face color closer to the texture (less gradient).
    scene = pyrender.Scene(bg_color=(*bg_color, 0.0), ambient_light=(0.82, 0.82, 0.85))

    py_mesh = pyrender.Mesh.from_trimesh(mesh, smooth=False)
    scene.add(py_mesh, pose=np.eye(4))

    camera = pyrender.PerspectiveCamera(yfov=np.deg2rad(float(yfov_deg)))
    cam_node = scene.add(camera, pose=T_c2w_gl)

    light = pyrender.DirectionalLight(color=np.ones(3), intensity=1.25)
    scene.add(light, pose=np.eye(4))

    r = pyrender.OffscreenRenderer(viewport_width=int(width), viewport_height=int(height))
    try:
        color, depth = r.render(scene)
    finally:
        r.delete()

    mask = np.isfinite(depth) & (depth > 0.0)
    mask_u8 = (mask.astype(np.uint8)) * 255

    depth_out = depth.astype(np.float32)
    depth_out[~np.isfinite(depth_out)] = 0.0

    _ = cam_node
    return color[:, :, :3].astype(np.uint8), depth_out, mask_u8
