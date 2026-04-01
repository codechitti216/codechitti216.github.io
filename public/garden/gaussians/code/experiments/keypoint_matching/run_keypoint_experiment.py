"""
Keypoint matching experiment: SIFT, ORB, AKAZE on two close views per dataset.
Uses a local venv: ..\\.venv_keymatch (opencv-python + numpy).
"""
from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

# Repo root = parent of experiments/
ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = Path(__file__).resolve().parent / "out"

# Resize large ETH images: max side in pixels (keeps aspect ratio)
MAX_SIDE = 1600
# Lowe ratio test
RATIO_THRESH = 0.75
# Cap drawn matches for readability
MAX_DRAW_MATCHES = 120


@dataclass(frozen=True)
class Pair:
    name: str
    path_a: Path
    path_b: Path


def discover_eth_pair(scene_dir: Path) -> Pair:
    img_dir = scene_dir / "images" / "dslr_images_undistorted"
    files = sorted(img_dir.glob("*.JPG")) + sorted(img_dir.glob("*.jpg"))
    if len(files) < 2:
        raise FileNotFoundError(f"Need >=2 images in {img_dir}")
    return Pair(
        name=scene_dir.name,
        path_a=files[0],
        path_b=files[1],
    )


def rubiks_pair() -> Pair:
    d = ROOT / "datasets" / "rubiks_orbit_v1" / "images"
    # Consecutive azimuth on ring01 (same ring as geometry_lab defaults)
    return Pair(
        name="rubiks_orbit_v1",
        path_a=d / "ring01_az007.png",
        path_b=d / "ring01_az008.png",
    )


def resize_max_side_bgr(img: np.ndarray, max_side: int) -> tuple[np.ndarray, float]:
    h, w = img.shape[:2]
    m = max(h, w)
    if m <= max_side:
        return img, 1.0
    s = max_side / float(m)
    nw, nh = int(round(w * s)), int(round(h * s))
    out = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_AREA)
    return out, s


def detect_and_compute(
    name: str, gray: np.ndarray
) -> tuple[list[cv2.KeyPoint], np.ndarray | None]:
    if name == "SIFT":
        det = cv2.SIFT_create()
        return det.detectAndCompute(gray, None)
    if name == "ORB":
        det = cv2.ORB_create(nfeatures=8000, fastThreshold=7)
        return det.detectAndCompute(gray, None)
    if name == "AKAZE":
        det = cv2.AKAZE_create()
        return det.detectAndCompute(gray, None)
    raise ValueError(name)


def match_descriptors(method: str, des1: np.ndarray, des2: np.ndarray) -> cv2.BFMatcher:
    if method == "SIFT":
        return cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
    return cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)


def ratio_filter(
    method: str, knn_matches: list[list[cv2.DMatch]], ratio: float
) -> list[cv2.DMatch]:
    good: list[cv2.DMatch] = []
    for pair in knn_matches:
        if len(pair) < 2:
            continue
        m, n = pair[0], pair[1]
        if m.distance < ratio * n.distance:
            good.append(m)
    return good


def fundamental_inliers(
    kp1: list[cv2.KeyPoint],
    kp2: list[cv2.KeyPoint],
    good: list[cv2.DMatch],
) -> tuple[int | None, float | None]:
    if len(good) < 8:
        return None, None
    pts1 = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    pts2 = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    F, mask = cv2.findFundamentalMat(
        pts1, pts2, cv2.FM_RANSAC, 3.0, 0.999, maxIters=5000
    )
    if F is None or mask is None:
        return None, None
    inliers = int(mask.sum())
    ratio = inliers / float(len(good))
    return inliers, ratio


def run_one(
    pair: Pair,
    method: str,
    out_prefix: Path,
) -> None:
    bgr1 = cv2.imread(str(pair.path_a), cv2.IMREAD_COLOR)
    bgr2 = cv2.imread(str(pair.path_b), cv2.IMREAD_COLOR)
    if bgr1 is None or bgr2 is None:
        raise FileNotFoundError(f"Could not read images for {pair.name}")

    bgr1, s1 = resize_max_side_bgr(bgr1, MAX_SIDE)
    bgr2, s2 = resize_max_side_bgr(bgr2, MAX_SIDE)
    gray1 = cv2.cvtColor(bgr1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(bgr2, cv2.COLOR_BGR2GRAY)

    kp1, des1 = detect_and_compute(method, gray1)
    kp2, des2 = detect_and_compute(method, gray2)
    if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
        print(
            f"  [{method}] insufficient descriptors "
            f"(n1={0 if des1 is None else len(des1)}, n2={0 if des2 is None else len(des2)})"
        )
        return

    bf = match_descriptors(method, des1, des2)
    knn = bf.knnMatch(des1, des2, k=2)
    raw = sum(1 for p in knn if len(p) >= 1)
    good = ratio_filter(method, knn, RATIO_THRESH)
    fin, frat = fundamental_inliers(kp1, kp2, good)

    # Draw subset sorted by distance
    good_sorted = sorted(good, key=lambda m: m.distance)[:MAX_DRAW_MATCHES]
    vis = cv2.drawMatches(
        bgr1,
        kp1,
        bgr2,
        kp2,
        good_sorted,
        None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS,
    )
    out_path = out_prefix.parent / f"{out_prefix.name}_{method}.png"
    cv2.imwrite(str(out_path), vis)

    line = (
        f"  [{method}] kp=({len(kp1)},{len(kp2)}) "
        f"knn_rows={len(knn)} raw_1nn={raw} good_ratio={len(good)}"
    )
    if fin is not None:
        line += f" F_RANSAC_inliers={fin} ({frat:.2%} of good)"
    print(line)


def main() -> None:
    pairs: list[Pair] = [
        rubiks_pair(),
        discover_eth_pair(ROOT / "pipes_dslr_undistorted" / "pipes"),
        discover_eth_pair(ROOT / "meadow_dslr_undistorted" / "meadow"),
        discover_eth_pair(ROOT / "office_dslr_undistorted" / "office"),
    ]
    methods = ("SIFT", "ORB", "AKAZE")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for pair in pairs:
        print("=" * 72)
        print(f"Dataset: {pair.name}")
        print(f"  A: {pair.path_a.relative_to(ROOT)}")
        print(f"  B: {pair.path_b.relative_to(ROOT)}")
        print(f"  resize: max_side={MAX_SIDE}px (ETH-sized images are downscaled)")
        safe = pair.name.replace(os.sep, "_")
        prefix = OUT_DIR / f"{safe}_pair"

        for m in methods:
            try:
                run_one(pair, m, prefix)
            except cv2.error as e:
                print(f"  [{m}] OpenCV error: {e}")

        print()

    print(f"Wrote visuals under: {OUT_DIR}")


if __name__ == "__main__":
    main()
