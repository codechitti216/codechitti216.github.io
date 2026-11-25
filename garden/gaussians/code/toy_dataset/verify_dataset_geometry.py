from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from toy_dataset.cameras import project_points_opencv


def main() -> None:
    p = argparse.ArgumentParser(description="Check cameras.json corner projections vs stored GT (math sanity).")
    p.add_argument("--dataset", type=Path, default=Path("datasets") / "rubiks_orbit_v1")
    p.add_argument("--tol", type=float, default=1e-3, help="Max allowed L2 pixel error per corner")
    args = p.parse_args()

    root = args.dataset
    meta = json.loads((root / "meta.json").read_text(encoding="utf-8"))
    cams = json.loads((root / "cameras.json").read_text(encoding="utf-8"))

    corners_w = np.array(meta["gt"]["cube_corners_world"], dtype=np.float64)

    worst = 0.0
    worst_id = -1
    for fr in cams["frames"]:
        op = fr["opencv"]
        K = np.array(op["K"], dtype=np.float64)
        R = np.array(op["R_w2c"], dtype=np.float64)
        t = np.array(op["t_w2c"], dtype=np.float64).reshape(3)
        uv_pred, _z = project_points_opencv(corners_w, R, t, K)
        uv_gt = np.array(fr["gt"]["cube_corners_uv"], dtype=np.float64)
        err = np.linalg.norm(uv_pred - uv_gt, axis=1).max()
        if err > worst:
            worst = float(err)
            worst_id = int(fr["id"])

    print(f"Worst max corner error (px): {worst:.6g} (frame id {worst_id})")
    if worst > float(args.tol):
        raise SystemExit(1)
    print("OK")


if __name__ == "__main__":
    main()
