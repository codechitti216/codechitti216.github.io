from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

import numpy as np
from PIL import Image

from toy_dataset.cameras import (
    camera_to_world_gl,
    intrinsics_from_yfov,
    opencv_from_camera_to_world_gl,
    project_points_opencv,
)
from toy_dataset.config import OrbitV1, cube_corner_positions, spherical_to_cartesian


def _write_split(path: Path, frame_ids: list[int]) -> None:
    path.write_text("\n".join(str(i) for i in frame_ids) + ("\n" if frame_ids else ""), encoding="utf-8")


def build_splits(n: int) -> dict[str, list[int]]:
    """
    n = total frames in ring-major order: for each elevation, 36 azimuths.

    - interp_azimuth: drop every other azimuth index within each ring (test on held-out angles).
    - holdout_middle_ring: train on top+bottom rings, test middle ring (0 deg).
    - sector: train azimuth in [0, 270), test [270, 360) for each ring.
    """
    rings = 3
    azi = 36
    assert n == rings * azi

    all_ids = list(range(n))

    interp_train: list[int] = []
    interp_test: list[int] = []
    for ring in range(rings):
        base = ring * azi
        for k in range(azi):
            idx = base + k
            if k % 2 == 0:
                interp_train.append(idx)
            else:
                interp_test.append(idx)

    # ring order in OrbitV1: (+45, 0, -45) -> indices 0..35, 36..71, 72..107
    holdout_train = list(range(0, 36)) + list(range(72, 108))
    holdout_test = list(range(36, 72))

    sector_train: list[int] = []
    sector_test: list[int] = []
    for ring in range(rings):
        base = ring * azi
        for k in range(azi):
            idx = base + k
            az = k * 10.0
            if az < 270.0:
                sector_train.append(idx)
            else:
                sector_test.append(idx)

    return {
        "all": all_ids,
        "interp_train": interp_train,
        "interp_test": interp_test,
        "holdout_ring_train": holdout_train,
        "holdout_ring_test": holdout_test,
        "sector_train": sector_train,
        "sector_test": sector_test,
    }


def main() -> None:
    p = argparse.ArgumentParser(description="Generate rubiks_orbit_v1 synthetic multi-view dataset (Python + pyrender).")
    p.add_argument("--out", type=Path, default=Path("datasets") / "rubiks_orbit_v1", help="Output directory")
    p.add_argument("--config-only", action="store_true", help="Write meta + splits + camera JSON skeleton without rendering")
    p.add_argument("--max-frames", type=int, default=0, help="If >0, only render/write the first N frames (debug)")
    args = p.parse_args()

    cfg = OrbitV1()
    mesh = None
    if not args.config_only:
        from toy_dataset.rubiks_mesh import make_rubiks_colored_box

        rng = np.random.default_rng(cfg.seed)
        mesh = make_rubiks_colored_box(half_extent=cfg.cube_half_extent, rng=rng)

    out: Path = args.out
    img_dir = out / "images"
    depth_dir = out / "depth"
    mask_dir = out / "masks"
    split_dir = out / "splits"

    for d in (img_dir, depth_dir, mask_dir, split_dir):
        d.mkdir(parents=True, exist_ok=True)

    K = intrinsics_from_yfov(cfg.image_size[0], cfg.image_size[1], cfg.yfov_deg)
    corners_w = cube_corner_positions(cfg.cube_half_extent)

    frames: list[dict] = []
    frame_idx = 0
    for ring_i, el in enumerate(cfg.elevations_deg):
        for az_i, az in enumerate(cfg.azimuths_deg):
            eye = spherical_to_cartesian(az, el, cfg.orbit_radius)
            T_c2w = camera_to_world_gl(eye_world=eye, target_world=np.zeros(3), up_world=np.array([0.0, 1.0, 0.0]))
            R_w2c, t_w2c = opencv_from_camera_to_world_gl(T_c2w)

            name = f"ring{ring_i:02d}_az{az_i:03d}"
            rel_image = f"images/{name}.png"
            rel_depth = f"depth/{name}.npy"
            rel_mask = f"masks/{name}.png"

            should_render = (not args.config_only) and (args.max_frames == 0 or frame_idx < args.max_frames)
            if should_render:
                from toy_dataset.render_pyrender import render_rgb_depth_mask

                assert mesh is not None
                rgb, depth, mask = render_rgb_depth_mask(
                    mesh=mesh,
                    T_c2w_gl=T_c2w,
                    width=cfg.image_size[0],
                    height=cfg.image_size[1],
                    yfov_deg=cfg.yfov_deg,
                    bg_color=cfg.background_rgb,
                )
                Image.fromarray(rgb).save(out / rel_image)
                np.save(out / rel_depth, depth)
                Image.fromarray(mask).save(out / rel_mask)

            uv, z = project_points_opencv(corners_w, R_w2c, t_w2c, K)
            frames.append(
                {
                    "id": frame_idx,
                    "name": name,
                    "ring": ring_i,
                    "azimuth_index": az_i,
                    "elevation_deg": float(el),
                    "azimuth_deg": float(az),
                    "image": rel_image,
                    "depth": rel_depth,
                    "mask": rel_mask,
                    "opencv": {
                        "K": K.tolist(),
                        "R_w2c": R_w2c.tolist(),
                        "t_w2c": t_w2c.reshape(3).tolist(),
                        "eye_world": eye.reshape(3).tolist(),
                    },
                    "gt": {
                        "cube_corners_uv": uv.tolist(),
                        "cube_corners_z_cam": z.reshape(-1).tolist(),
                    },
                }
            )
            frame_idx += 1

    meta = {
        "dataset": "rubiks_orbit_v1",
        "purpose": "Geometry / novel-view fundamentals (synthetic, calibrated).",
        "conventions": {
            "world_frame": "right-handed, +Y up, cube centered at origin",
            "camera_model": "pinhole, OpenCV projection (x right, y down, z forward)",
            "depth_maps": "pyrender float depth in scene units; 0 = background / invalid",
            "masks": "255 = foreground cube, 0 = background",
        },
        "capture": {
            "elevations_deg": list(cfg.elevations_deg),
            "azimuth_step_deg": 10.0,
            "azimuth_count": len(cfg.azimuths_deg),
            "orbit_radius": cfg.orbit_radius,
            "cube_half_extent": cfg.cube_half_extent,
            "mesh_seed": cfg.seed,
            "image_size_wh": [cfg.image_size[0], cfg.image_size[1]],
            "yfov_deg": cfg.yfov_deg,
            "background_rgb": list(cfg.background_rgb),
        },
        "gt": {
            "cube_corners_world": corners_w.tolist(),
        },
    }

    (out / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (out / "cameras.json").write_text(json.dumps({"frames": frames}, indent=2), encoding="utf-8")

    splits = build_splits(cfg.frame_count)
    for k, v in splits.items():
        _write_split(split_dir / f"{k}.txt", v)

    print(f"Wrote dataset to: {out.resolve()}")
    print(f"Frames: {len(frames)}  (config_only={bool(args.config_only)})")

    if not args.config_only and (out / "images").is_dir() and any((out / "images").iterdir()):
        try:
            from toy_dataset.build_capture_visualization import build_capture_visualization

            viz_path = build_capture_visualization(out)
            print(f"Capture visualization: {viz_path}")
        except Exception as e:
            print(f"Note: capture visualization not built ({e})")


if __name__ == "__main__":
    main()
