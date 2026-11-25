from __future__ import annotations

import argparse
import base64
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
try:
    import cv2  # type: ignore
except Exception as e:  # pragma: no cover
    raise RuntimeError(
        "OpenCV (`cv2`) failed to import. This is commonly caused by an incompatible NumPy/OpenCV binary combo "
        "(e.g. NumPy 2.x with an OpenCV wheel built against NumPy 1.x).\n\n"
        "Fix (recommended): create a fresh venv and install compatible deps:\n"
        "  python -m venv .venv\n"
        "  .venv\\Scripts\\activate\n"
        "  pip install -U pip\n"
        "  pip install \"numpy<2\" \"opencv-python>=4.8\"\n\n"
        f"Original error: {type(e).__name__}: {e}"
    ) from e


REPO_ROOT = Path(__file__).resolve().parent
OUT_HTML = REPO_ROOT / "multiview_geometry_lab.html"
MAX_IMAGE_SIDE = 800
PLACEHOLDER_MAX_SIDE = 800
RNG = np.random.default_rng(7)


@dataclass
class FrameRecord:
    index: int
    name: str
    image_rel: str
    image_path: Path | None
    K: np.ndarray
    R_w2c: np.ndarray
    t_w2c: np.ndarray

    @property
    def camera_center(self) -> np.ndarray:
        return -self.R_w2c.T @ self.t_w2c.reshape(3)


def b64_data_uri(binary: bytes, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(binary).decode('ascii')}"


def svg_placeholder(title: str, subtitle: str, width: int = 960, height: int = 640) -> str:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<defs>
  <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0%" stop-color="#202633"/>
    <stop offset="100%" stop-color="#0f131b"/>
  </linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<rect x="24" y="24" width="{width-48}" height="{height-48}" rx="18" fill="none" stroke="#3b465c" stroke-width="2"/>
<circle cx="{width//2}" cy="{height//2-40}" r="66" fill="#182033" stroke="#51617f" stroke-width="2"/>
<path d="M {width//2-40} {height//2-60} L {width//2+30} {height//2+10} L {width//2+60} {height//2-20}" fill="none" stroke="#7eb8ff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<text x="50%" y="{height//2+80}" fill="#eef3fb" font-size="36" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif">{title}</text>
<text x="50%" y="{height//2+122}" fill="#95a4bf" font-size="22" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif">{subtitle}</text>
</svg>"""
    return b64_data_uri(svg.encode("utf-8"), "image/svg+xml")


def encode_image_bgr(image: np.ndarray, quality: int = 82) -> str:
    ok, buf = cv2.imencode(".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise RuntimeError("Failed to JPEG-encode image.")
    return b64_data_uri(buf.tobytes(), "image/jpeg")


def resize_image(image: np.ndarray, max_side: int) -> tuple[np.ndarray, float]:
    h, w = image.shape[:2]
    scale = min(1.0, float(max_side) / float(max(h, w)))
    if scale >= 0.999:
        return image, 1.0
    nw = max(1, int(round(w * scale)))
    nh = max(1, int(round(h * scale)))
    return cv2.resize(image, (nw, nh), interpolation=cv2.INTER_AREA), scale


def prepare_image_asset(image_path: Path | None, fallback_title: str, fallback_subtitle: str) -> dict[str, Any]:
    if image_path is None or not image_path.is_file():
        return {
            "available": False,
            "path": None if image_path is None else str(image_path.relative_to(REPO_ROOT).as_posix()) if image_path.exists() else str(image_path.as_posix()),
            "dataUri": svg_placeholder(fallback_title, fallback_subtitle),
            "width": PLACEHOLDER_MAX_SIDE,
            "height": int(round(PLACEHOLDER_MAX_SIDE * 2 / 3)),
            "originalWidth": None,
            "originalHeight": None,
            "scale": None,
        }

    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        return {
            "available": False,
            "path": str(image_path.relative_to(REPO_ROOT).as_posix()),
            "dataUri": svg_placeholder(fallback_title, "Image exists but could not be decoded"),
            "width": PLACEHOLDER_MAX_SIDE,
            "height": int(round(PLACEHOLDER_MAX_SIDE * 2 / 3)),
            "originalWidth": None,
            "originalHeight": None,
            "scale": None,
        }

    h0, w0 = image.shape[:2]
    image_small, scale = resize_image(image, MAX_IMAGE_SIDE)
    h1, w1 = image_small.shape[:2]
    return {
        "available": True,
        "path": str(image_path.relative_to(REPO_ROOT).as_posix()),
        "dataUri": encode_image_bgr(image_small),
        "width": int(w1),
        "height": int(h1),
        "originalWidth": int(w0),
        "originalHeight": int(h0),
        "scale": float(scale),
        "image_bgr": image_small,
    }


def quaternion_to_rotation(qw: float, qx: float, qy: float, qz: float) -> np.ndarray:
    q = np.array([qw, qx, qy, qz], dtype=np.float64)
    n = np.linalg.norm(q)
    if n < 1e-12:
        raise ValueError("Zero quaternion in COLMAP images.txt")
    q /= n
    w, x, y, z = q
    return np.array(
        [
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ],
        dtype=np.float64,
    )


def skew(v: np.ndarray) -> np.ndarray:
    x, y, z = v.reshape(3)
    return np.array([[0.0, -z, y], [z, 0.0, -x], [-y, x, 0.0]], dtype=np.float64)


def camera_center(R_w2c: np.ndarray, t_w2c: np.ndarray) -> np.ndarray:
    return -R_w2c.T @ t_w2c.reshape(3)


def normalize_points_with_K(K: np.ndarray, pts_px: np.ndarray) -> np.ndarray:
    if pts_px.size == 0:
        return np.zeros((0, 2), dtype=np.float64)
    ones = np.ones((pts_px.shape[0], 1), dtype=np.float64)
    x = np.concatenate([pts_px.astype(np.float64), ones], axis=1)
    x = (np.linalg.inv(K) @ x.T).T
    return x[:, :2] / x[:, 2:3]


def hartley_normalization(pts: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    if pts.shape[0] == 0:
        return np.eye(3, dtype=np.float64), pts
    mean = pts.mean(axis=0)
    centered = pts - mean
    rms = np.sqrt(np.mean(np.sum(centered * centered, axis=1)))
    scale = 1.0 if rms < 1e-12 else np.sqrt(2.0) / rms
    T = np.array(
        [
            [scale, 0.0, -scale * mean[0]],
            [0.0, scale, -scale * mean[1]],
            [0.0, 0.0, 1.0],
        ],
        dtype=np.float64,
    )
    pts_h = np.concatenate([pts, np.ones((pts.shape[0], 1), dtype=np.float64)], axis=1)
    pts_n = (T @ pts_h.T).T
    return T, pts_n[:, :2] / pts_n[:, 2:3]


def essential_from_eight_point(pts1_n: np.ndarray, pts2_n: np.ndarray) -> np.ndarray | None:
    if pts1_n.shape[0] < 8:
        return None
    T1, q1 = hartley_normalization(pts1_n)
    T2, q2 = hartley_normalization(pts2_n)
    x1 = q1[:, 0]
    y1 = q1[:, 1]
    x2 = q2[:, 0]
    y2 = q2[:, 1]
    A = np.stack(
        [
            x2 * x1,
            x2 * y1,
            x2,
            y2 * x1,
            y2 * y1,
            y2,
            x1,
            y1,
            np.ones_like(x1),
        ],
        axis=1,
    )
    _, _, vh = np.linalg.svd(A, full_matrices=False)
    E_hat = vh[-1].reshape(3, 3)
    U, S, Vt = np.linalg.svd(E_hat)
    if np.linalg.det(U) < 0:
        U[:, -1] *= -1.0
    if np.linalg.det(Vt) < 0:
        Vt[-1, :] *= -1.0
    s = 0.5 * (S[0] + S[1])
    E_hat = U @ np.diag([s, s, 0.0]) @ Vt
    E = T2.T @ E_hat @ T1
    n = np.linalg.norm(E)
    if n < 1e-12:
        return None
    return E / n


def sampson_errors(E: np.ndarray, pts1_n: np.ndarray, pts2_n: np.ndarray) -> np.ndarray:
    ones = np.ones((pts1_n.shape[0], 1), dtype=np.float64)
    x1 = np.concatenate([pts1_n, ones], axis=1)
    x2 = np.concatenate([pts2_n, ones], axis=1)
    Ex1 = (E @ x1.T).T
    Etx2 = (E.T @ x2.T).T
    numer = np.sum(x2 * Ex1, axis=1) ** 2
    denom = Ex1[:, 0] ** 2 + Ex1[:, 1] ** 2 + Etx2[:, 0] ** 2 + Etx2[:, 1] ** 2 + 1e-12
    return numer / denom


def triangulate_point_linear(P1: np.ndarray, P2: np.ndarray, x1: np.ndarray, x2: np.ndarray) -> np.ndarray | None:
    A = np.stack(
        [
            x1[0] * P1[2] - P1[0],
            x1[1] * P1[2] - P1[1],
            x2[0] * P2[2] - P2[0],
            x2[1] * P2[2] - P2[1],
        ],
        axis=0,
    )
    _, _, vh = np.linalg.svd(A)
    X = vh[-1]
    if abs(X[3]) < 1e-12:
        return None
    return X[:3] / X[3]


def decompose_essential_candidates(E: np.ndarray) -> list[tuple[np.ndarray, np.ndarray]]:
    U, _, Vt = np.linalg.svd(E)
    if np.linalg.det(U) < 0:
        U[:, -1] *= -1.0
    if np.linalg.det(Vt) < 0:
        Vt[-1, :] *= -1.0
    W = np.array([[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]], dtype=np.float64)
    R1 = U @ W @ Vt
    R2 = U @ W.T @ Vt
    if np.linalg.det(R1) < 0:
        R1 *= -1.0
    if np.linalg.det(R2) < 0:
        R2 *= -1.0
    t = U[:, 2]
    return [(R1, t), (R1, -t), (R2, t), (R2, -t)]


def evaluate_pose_candidates(
    E: np.ndarray,
    pts1_n: np.ndarray,
    pts2_n: np.ndarray,
    inlier_mask: np.ndarray,
    sample_cap: int = 96,
) -> dict[str, Any]:
    mask_idx = np.flatnonzero(inlier_mask)
    if mask_idx.size == 0:
        mask_idx = np.arange(min(len(pts1_n), sample_cap))
    if mask_idx.size == 0:
        return {"available": False, "candidates": [], "bestIndex": None}
    if mask_idx.size > sample_cap:
        mask_idx = mask_idx[:sample_cap]

    P1 = np.hstack([np.eye(3), np.zeros((3, 1), dtype=np.float64)])
    payload: list[dict[str, Any]] = []
    best_idx = None
    best_count = -1
    for i, (R, t) in enumerate(decompose_essential_candidates(E)):
        P2 = np.hstack([R, t.reshape(3, 1)])
        pts3d = []
        cheirality = 0
        for idx in mask_idx:
            X = triangulate_point_linear(P1, P2, pts1_n[idx], pts2_n[idx])
            if X is None:
                continue
            z1 = float(X[2])
            X2 = R @ X + t
            z2 = float(X2[2])
            if z1 > 0.0 and z2 > 0.0:
                cheirality += 1
                if len(pts3d) < 48:
                    pts3d.append(X.tolist())
        candidate = {
            "index": i,
            "R": R.tolist(),
            "t": (t / (np.linalg.norm(t) + 1e-12)).tolist(),
            "cameraCenter2": (-R.T @ t.reshape(3)).tolist(),
            "cheiralityCount": int(cheirality),
            "points3D": pts3d,
        }
        payload.append(candidate)
        if cheirality > best_count:
            best_count = cheirality
            best_idx = i
    return {"available": True, "candidates": payload, "bestIndex": best_idx}


def rotation_angle_deg(R_est: np.ndarray, R_ref: np.ndarray) -> float:
    delta = R_est @ R_ref.T
    trace = np.clip((np.trace(delta) - 1.0) * 0.5, -1.0, 1.0)
    return float(np.degrees(np.arccos(trace)))


def translation_angle_deg(t_est: np.ndarray, t_ref: np.ndarray) -> float | None:
    n1 = np.linalg.norm(t_est)
    n2 = np.linalg.norm(t_ref)
    if n1 < 1e-12 or n2 < 1e-12:
        return None
    dot = float(np.clip(np.dot(t_est / n1, t_ref / n2), -1.0, 1.0))
    return float(np.degrees(np.arccos(dot)))


def estimate_eight_point_ransac(
    pts1_n: np.ndarray,
    pts2_n: np.ndarray,
    threshold: float,
    iterations: int = 72,
) -> dict[str, Any]:
    n = pts1_n.shape[0]
    if n < 8:
        return {"available": False}

    best_E = None
    best_mask = np.zeros(n, dtype=bool)
    best_score = -1
    best_error = np.inf
    steps: list[dict[str, Any]] = []

    for _ in range(iterations):
        sample = RNG.choice(n, size=8, replace=False)
        E = essential_from_eight_point(pts1_n[sample], pts2_n[sample])
        if E is None:
            steps.append({"sample": sample.tolist(), "inliers": 0, "bestInliers": int(best_score)})
            continue
        err = sampson_errors(E, pts1_n, pts2_n)
        mask = err < threshold
        score = int(mask.sum())
        mean_err = float(err[mask].mean()) if score > 0 else float(err.mean())
        if score > best_score or (score == best_score and mean_err < best_error):
            best_E = E
            best_mask = mask
            best_score = score
            best_error = mean_err
        steps.append(
            {
                "sample": sample.tolist(),
                "inliers": score,
                "bestInliers": int(best_score),
                "isBest": bool(best_E is E),
            }
        )

    if best_E is None or best_score < 8:
        return {"available": False, "steps": steps, "threshold": threshold}

    E_refined = essential_from_eight_point(pts1_n[best_mask], pts2_n[best_mask])
    if E_refined is not None:
        best_E = E_refined
        err = sampson_errors(best_E, pts1_n, pts2_n)
        best_mask = err < threshold

    return {
        "available": True,
        "E": best_E.tolist(),
        "inliers": best_mask.astype(np.uint8).tolist(),
        "threshold": float(threshold),
        "steps": steps,
    }


def estimate_five_point_opencv(pts1_n: np.ndarray, pts2_n: np.ndarray, threshold: float) -> dict[str, Any]:
    if pts1_n.shape[0] < 5:
        return {"available": False}
    E, mask = cv2.findEssentialMat(
        pts1_n.reshape(-1, 1, 2),
        pts2_n.reshape(-1, 1, 2),
        focal=1.0,
        pp=(0.0, 0.0),
        method=cv2.RANSAC,
        prob=0.999,
        threshold=float(np.sqrt(threshold) * 2.2),
    )
    if E is None or mask is None:
        return {"available": False}
    if E.shape[0] > 3:
        E = E[:3, :]
    inliers = mask.reshape(-1).astype(bool)
    E = E / (np.linalg.norm(E) + 1e-12)
    return {"available": True, "E": E.tolist(), "inliers": inliers.astype(np.uint8).tolist()}


def summarize_algorithm(
    name: str,
    pts1_px: np.ndarray,
    pts2_px: np.ndarray,
    kp1_vis: list[list[float]],
    kp2_vis: list[list[float]],
    pipeline_stats: dict[str, Any],
    geom8: dict[str, Any],
    geom5: dict[str, Any],
    ref_E: np.ndarray,
    K1: np.ndarray,
    K2: np.ndarray,
    R_ref: np.ndarray,
    t_ref: np.ndarray,
) -> dict[str, Any]:
    matches = []
    pts1_n = normalize_points_with_K(K1, pts1_px)
    pts2_n = normalize_points_with_K(K2, pts2_px)
    inliers8 = np.array(geom8.get("inliers", [0] * len(pts1_px)), dtype=bool) if geom8.get("available") else np.zeros(len(pts1_px), dtype=bool)
    inliers5 = np.array(geom5.get("inliers", [0] * len(pts1_px)), dtype=bool) if geom5.get("available") else np.zeros(len(pts1_px), dtype=bool)
    E8 = np.array(geom8["E"], dtype=np.float64) if geom8.get("available") else None
    E5 = np.array(geom5["E"], dtype=np.float64) if geom5.get("available") else None
    err_ref = sampson_errors(ref_E, pts1_n, pts2_n) if len(pts1_n) else np.zeros(0, dtype=np.float64)
    err8 = sampson_errors(E8, pts1_n, pts2_n) if E8 is not None and len(pts1_n) else np.zeros(0, dtype=np.float64)
    err5 = sampson_errors(E5, pts1_n, pts2_n) if E5 is not None and len(pts1_n) else np.zeros(0, dtype=np.float64)

    for i, (p1, p2) in enumerate(zip(pts1_px, pts2_px)):
        matches.append(
            {
                "index": i,
                "p1": [float(p1[0]), float(p1[1])],
                "p2": [float(p2[0]), float(p2[1])],
                "x1n": [float(pts1_n[i, 0]), float(pts1_n[i, 1])],
                "x2n": [float(pts2_n[i, 0]), float(pts2_n[i, 1])],
                "inlier8": bool(inliers8[i]),
                "inlier5": bool(inliers5[i]),
                "errRef": float(err_ref[i]),
                "err8": float(err8[i]) if err8.size else None,
                "err5": float(err5[i]) if err5.size else None,
            }
        )

    pose_payload = {"available": False}
    if geom5.get("available"):
        pose_payload = evaluate_pose_candidates(np.array(geom5["E"], dtype=np.float64), pts1_n, pts2_n, inliers5)
        if pose_payload.get("available") and pose_payload.get("bestIndex") is not None:
            best = pose_payload["candidates"][pose_payload["bestIndex"]]
            best_R = np.array(best["R"], dtype=np.float64)
            best_t = np.array(best["t"], dtype=np.float64)
            pose_payload["bestR"] = best["R"]
            pose_payload["bestT"] = best["t"]
            pose_payload["rotationErrorDeg"] = rotation_angle_deg(best_R, R_ref)
            pose_payload["translationAngleDeg"] = translation_angle_deg(best_t, t_ref)
    elif geom8.get("available"):
        pose_payload = evaluate_pose_candidates(np.array(geom8["E"], dtype=np.float64), pts1_n, pts2_n, inliers8)

    return {
        "available": bool(len(matches) > 0),
        "name": name,
        "keypoints1": kp1_vis,
        "keypoints2": kp2_vis,
        "matches": matches,
        "stats": {
            **pipeline_stats,
            "matchCount": len(matches),
            "inliers8": int(inliers8.sum()),
            "inliers5": int(inliers5.sum()),
        },
        "eightPoint": geom8,
        "fivePoint": geom5,
        "poseRecovery": pose_payload,
    }


def detect_and_match(
    method: str, img1_bgr: np.ndarray, img2_bgr: np.ndarray
) -> tuple[list[list[float]], list[list[float]], np.ndarray, np.ndarray, dict[str, Any]]:
    gray1 = cv2.cvtColor(img1_bgr, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2_bgr, cv2.COLOR_BGR2GRAY)
    if method == "SIFT":
        detector = cv2.SIFT_create(nfeatures=2500)
        norm = cv2.NORM_L2
        ratio = 0.75
    elif method == "ORB":
        detector = cv2.ORB_create(nfeatures=3500, fastThreshold=7)
        norm = cv2.NORM_HAMMING
        ratio = 0.82
    elif method == "AKAZE":
        detector = cv2.AKAZE_create()
        norm = cv2.NORM_HAMMING
        ratio = 0.82
    else:
        raise ValueError(method)

    kp1, des1 = detector.detectAndCompute(gray1, None)
    kp2, des2 = detector.detectAndCompute(gray2, None)
    if des1 is None or des2 is None or len(kp1) == 0 or len(kp2) == 0:
        return (
            [],
            [],
            np.zeros((0, 2), dtype=np.float64),
            np.zeros((0, 2), dtype=np.float64),
            {
                "detected1": int(len(kp1)),
                "detected2": int(len(kp2)),
                "knnPairs": 0,
                "ratioThreshold": float(ratio),
                "ratioAccepted": 0,
                "cap": 900,
            },
        )

    bf = cv2.BFMatcher(norm, crossCheck=False)
    knn = bf.knnMatch(des1, des2, k=2)
    good = []
    for pair in knn:
        if len(pair) < 2:
            continue
        m, n = pair
        if m.distance < ratio * n.distance:
            good.append(m)
    ratio_accepted = len(good)
    good.sort(key=lambda m: m.distance)
    good = good[:900]

    kp1_vis = [
        [float(k.pt[0]), float(k.pt[1]), float(k.response), float(k.size)]
        for k in sorted(kp1, key=lambda q: q.response, reverse=True)[:700]
    ]
    kp2_vis = [
        [float(k.pt[0]), float(k.pt[1]), float(k.response), float(k.size)]
        for k in sorted(kp2, key=lambda q: q.response, reverse=True)[:700]
    ]
    pts1 = np.array([kp1[m.queryIdx].pt for m in good], dtype=np.float64).reshape(-1, 2)
    pts2 = np.array([kp2[m.trainIdx].pt for m in good], dtype=np.float64).reshape(-1, 2)
    return (
        kp1_vis,
        kp2_vis,
        pts1,
        pts2,
        {
            "detected1": int(len(kp1)),
            "detected2": int(len(kp2)),
            "knnPairs": int(len(knn)),
            "ratioThreshold": float(ratio),
            "ratioAccepted": int(ratio_accepted),
            "cap": 900,
        },
    )


def parse_colmap_cameras(path: Path) -> dict[int, dict[str, Any]]:
    cameras: dict[int, dict[str, Any]] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        tokens = line.split()
        cam_id = int(tokens[0])
        model = tokens[1]
        width = int(tokens[2])
        height = int(tokens[3])
        params = [float(x) for x in tokens[4:]]
        if model != "PINHOLE" or len(params) < 4:
            raise ValueError(f"Unsupported COLMAP camera model in {path}: {model}")
        fx, fy, cx, cy = params[:4]
        K = np.array([[fx, 0.0, cx], [0.0, fy, cy], [0.0, 0.0, 1.0]], dtype=np.float64)
        cameras[cam_id] = {"width": width, "height": height, "K": K}
    return cameras


def parse_colmap_images(path: Path, camera_map: dict[int, dict[str, Any]], scene_dir: Path) -> list[FrameRecord]:
    frames: list[FrameRecord] = []
    with path.open("r", encoding="utf-8") as handle:
        while True:
            line = handle.readline()
            if not line:
                break
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            tokens = stripped.split()
            if len(tokens) < 10:
                continue
            image_id = int(tokens[0])
            qw, qx, qy, qz = map(float, tokens[1:5])
            tx, ty, tz = map(float, tokens[5:8])
            camera_id = int(tokens[8])
            name = tokens[9]
            _points_line = handle.readline()
            info = camera_map[camera_id]
            image_path = resolve_image_path(scene_dir, name)
            frames.append(
                FrameRecord(
                    index=image_id,
                    name=Path(name).stem,
                    image_rel=name,
                    image_path=image_path,
                    K=info["K"].copy(),
                    R_w2c=quaternion_to_rotation(qw, qx, qy, qz),
                    t_w2c=np.array([tx, ty, tz], dtype=np.float64),
                )
            )
    frames.sort(key=lambda fr: fr.index)
    return frames


def parse_colmap_points3d(path: Path, sample_cap: int = 500) -> list[list[float]]:
    pts: list[list[float]] = []
    with path.open("r", encoding="utf-8") as handle:
        for raw in handle:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            tokens = line.split()
            if len(tokens) < 7:
                continue
            x, y, z = map(float, tokens[1:4])
            r, g, b = map(int, tokens[4:7])
            pts.append([x, y, z, r / 255.0, g / 255.0, b / 255.0])
    if len(pts) > sample_cap:
        idx = np.linspace(0, len(pts) - 1, sample_cap, dtype=int)
        pts = [pts[i] for i in idx.tolist()]
    return pts


def resolve_image_path(scene_dir: Path, rel_name: str) -> Path | None:
    rel = Path(rel_name)
    candidates = [
        scene_dir / rel,
        scene_dir / "images" / rel,
        scene_dir.parent / rel,
        scene_dir.parent / "images" / rel,
        REPO_ROOT / rel,
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def build_reference_geometry(frame_a: FrameRecord, frame_b: FrameRecord) -> dict[str, Any]:
    R_rel = frame_b.R_w2c @ frame_a.R_w2c.T
    t_rel = frame_b.t_w2c - R_rel @ frame_a.t_w2c
    t_unit = t_rel / (np.linalg.norm(t_rel) + 1e-12)
    E_ref = skew(t_unit) @ R_rel
    return {
        "R": R_rel.tolist(),
        "t": t_unit.tolist(),
        "E": (E_ref / (np.linalg.norm(E_ref) + 1e-12)).tolist(),
        "cameraCenter1": [0.0, 0.0, 0.0],
        "cameraCenter2": (-R_rel.T @ t_unit).tolist(),
    }


def choose_rubik_pair(frames: list[FrameRecord]) -> tuple[FrameRecord, FrameRecord]:
    wanted = {"ring01_az007", "ring01_az008"}
    lookup = {fr.name: fr for fr in frames}
    if wanted.issubset(lookup):
        return lookup["ring01_az007"], lookup["ring01_az008"]
    mid = max(0, len(frames) // 2 - 1)
    return frames[mid], frames[min(mid + 1, len(frames) - 1)]


def choose_eth_pair(frames: list[FrameRecord]) -> tuple[FrameRecord, FrameRecord]:
    if len(frames) < 2:
        raise ValueError("Need at least two frames in ETH scene.")
    return frames[0], frames[1]


def rescale_frame_for_pair(frame: FrameRecord, image_asset: dict[str, Any]) -> dict[str, Any]:
    K = frame.K.copy()
    scale = image_asset.get("scale")
    if scale is not None:
        K[:2, :] *= float(scale)
        K[2, :] = [0.0, 0.0, 1.0]
    C = frame.camera_center
    return {
        "name": frame.name,
        "imageRel": frame.image_rel.replace("\\", "/"),
        "imagePath": image_asset["path"],
        "imageAvailable": image_asset["available"],
        "imageDataUri": image_asset["dataUri"],
        "width": image_asset["width"],
        "height": image_asset["height"],
        "originalWidth": image_asset["originalWidth"],
        "originalHeight": image_asset["originalHeight"],
        "K": K.tolist(),
        "R_w2c": frame.R_w2c.tolist(),
        "t_w2c": frame.t_w2c.tolist(),
        "cameraCenter": C.tolist(),
    }


def scene_bounds(points_xyz: list[np.ndarray]) -> dict[str, Any]:
    if not points_xyz:
        return {
            "center": [0.0, 0.0, 0.0],
            "radius": 1.0,
            "diameter": 2.0,
            "min": [-1.0, -1.0, -1.0],
            "max": [1.0, 1.0, 1.0],
        }
    arr = np.vstack(points_xyz)
    lo = arr.min(axis=0)
    hi = arr.max(axis=0)
    center = 0.5 * (lo + hi)
    radius = float(max(np.linalg.norm(arr - center, axis=1).max(), 1.0))
    return {
        "center": center.tolist(),
        "radius": radius,
        "diameter": float(2.0 * radius),
        "min": lo.tolist(),
        "max": hi.tolist(),
    }


def build_rubik_dataset(dataset_dir: Path) -> dict[str, Any]:
    meta = json.loads((dataset_dir / "meta.json").read_text(encoding="utf-8"))
    cams = json.loads((dataset_dir / "cameras.json").read_text(encoding="utf-8"))
    frames: list[FrameRecord] = []
    semantic_by_name: dict[str, dict[str, Any]] = {}
    for fr in cams["frames"]:
        op = fr["opencv"]
        image_rel = fr["image"].replace("\\", "/")
        image_path = dataset_dir / image_rel
        frames.append(
            FrameRecord(
                index=int(fr["id"]),
                name=fr["name"],
                image_rel=image_rel,
                image_path=image_path if image_path.is_file() else None,
                K=np.array(op["K"], dtype=np.float64),
                R_w2c=np.array(op["R_w2c"], dtype=np.float64),
                t_w2c=np.array(op["t_w2c"], dtype=np.float64),
            )
        )
        semantic_by_name[fr["name"]] = {
            "uv": fr["gt"]["cube_corners_uv"],
            "z": fr["gt"]["cube_corners_z_cam"],
        }
    frames.sort(key=lambda fr: fr.index)
    frame_a, frame_b = choose_rubik_pair(frames)
    asset_a = prepare_image_asset(frame_a.image_path, "Rubik frame unavailable", frame_a.name)
    asset_b = prepare_image_asset(frame_b.image_path, "Rubik frame unavailable", frame_b.name)
    pair_a = rescale_frame_for_pair(frame_a, asset_a)
    pair_b = rescale_frame_for_pair(frame_b, asset_b)

    cube_corners_world = meta["gt"]["cube_corners_world"]
    scale_a = asset_a.get("scale") or 1.0
    scale_b = asset_b.get("scale") or 1.0
    semantic_matches = []
    for i, (uv_a, uv_b, xyz) in enumerate(
        zip(semantic_by_name[frame_a.name]["uv"], semantic_by_name[frame_b.name]["uv"], cube_corners_world)
    ):
        semantic_matches.append(
            {
                "label": f"corner_{i}",
                "p1": [float(uv_a[0] * scale_a), float(uv_a[1] * scale_a)],
                "p2": [float(uv_b[0] * scale_b), float(uv_b[1] * scale_b)],
                "world": xyz,
            }
        )

    image_a = asset_a.get("image_bgr")
    image_b = asset_b.get("image_bgr")
    algorithms: dict[str, Any] = {}
    if image_a is not None and image_b is not None:
        ref = build_reference_geometry(frame_a, frame_b)
        ref_E = np.array(ref["E"], dtype=np.float64)
        K1 = np.array(pair_a["K"], dtype=np.float64)
        K2 = np.array(pair_b["K"], dtype=np.float64)
        R_ref = np.array(ref["R"], dtype=np.float64)
        t_ref = np.array(ref["t"], dtype=np.float64)
        pixel_threshold = 2.0
        mean_f = 0.5 * (K1[0, 0] + K2[0, 0])
        thresh_n = max(((pixel_threshold / max(mean_f, 1e-6)) ** 2) * 20.0, 1e-6)
        for method in ("SIFT", "ORB", "AKAZE"):
            kp1_vis, kp2_vis, pts1_px, pts2_px, pipeline_stats = detect_and_match(method, image_a, image_b)
            pts1_n = normalize_points_with_K(K1, pts1_px)
            pts2_n = normalize_points_with_K(K2, pts2_px)
            geom8 = estimate_eight_point_ransac(pts1_n, pts2_n, threshold=thresh_n)
            geom5 = estimate_five_point_opencv(pts1_n, pts2_n, threshold=thresh_n)
            algorithms[method] = summarize_algorithm(
                method,
                pts1_px,
                pts2_px,
                kp1_vis,
                kp2_vis,
                pipeline_stats,
                geom8,
                geom5,
                ref_E,
                K1,
                K2,
                R_ref,
                t_ref,
            )
    else:
        for method in ("SIFT", "ORB", "AKAZE"):
            algorithms[method] = {
                "available": False,
                "name": method,
                "reason": "One or both Rubik images are missing, so feature extraction was skipped.",
            }

    scene_pts = [np.array(fr.camera_center) for fr in frames] + [np.array(xyz, dtype=np.float64) for xyz in cube_corners_world]
    bounds = scene_bounds(scene_pts)
    return {
        "title": "rubiks_orbit_v1",
        "description": "Synthetic, perfectly calibrated orbit around a textured Rubik-style cube. Ground-truth camera poses and cube-corner correspondences are known exactly.",
        "type": "synthetic",
        "pairLabel": f"{frame_a.name} ↔ {frame_b.name}",
        "reference": build_reference_geometry(frame_a, frame_b),
        "pair": {"image1": pair_a, "image2": pair_b, "semanticMatches": semantic_matches},
        "algorithms": algorithms,
        "scene": {
            "cameraCenters": [fr.camera_center.tolist() for fr in frames],
            "cubeHalf": float(meta["capture"]["cube_half_extent"]),
            "cubeCornersWorld": cube_corners_world,
            "sparsePoints": [],
            "bounds": bounds,
        },
        "notes": {
            "imagesMissing": not (asset_a["available"] and asset_b["available"]),
            "poseSource": "synthetic ground truth",
        },
    }


def build_eth_dataset(scene_root: Path, scene_name: str) -> dict[str, Any]:
    calib = scene_root / "dslr_calibration_undistorted"
    camera_map = parse_colmap_cameras(calib / "cameras.txt")
    frames = parse_colmap_images(calib / "images.txt", camera_map, scene_root)
    points = parse_colmap_points3d(calib / "points3D.txt")
    frame_a, frame_b = choose_eth_pair(frames)

    asset_a = prepare_image_asset(frame_a.image_path, f"{scene_name} image missing", frame_a.name)
    asset_b = prepare_image_asset(frame_b.image_path, f"{scene_name} image missing", frame_b.name)
    pair_a = rescale_frame_for_pair(frame_a, asset_a)
    pair_b = rescale_frame_for_pair(frame_b, asset_b)

    reference = build_reference_geometry(frame_a, frame_b)
    ref_E = np.array(reference["E"], dtype=np.float64)
    K1 = np.array(pair_a["K"], dtype=np.float64)
    K2 = np.array(pair_b["K"], dtype=np.float64)
    R_ref = np.array(reference["R"], dtype=np.float64)
    t_ref = np.array(reference["t"], dtype=np.float64)

    algorithms: dict[str, Any] = {}
    image_a = asset_a.get("image_bgr")
    image_b = asset_b.get("image_bgr")
    if image_a is not None and image_b is not None:
        pixel_threshold = 2.0
        mean_f = 0.5 * (K1[0, 0] + K2[0, 0])
        thresh_n = max(((pixel_threshold / max(mean_f, 1e-6)) ** 2) * 20.0, 1e-6)
        for method in ("SIFT", "ORB", "AKAZE"):
            kp1_vis, kp2_vis, pts1_px, pts2_px, pipeline_stats = detect_and_match(method, image_a, image_b)
            pts1_n = normalize_points_with_K(K1, pts1_px)
            pts2_n = normalize_points_with_K(K2, pts2_px)
            geom8 = estimate_eight_point_ransac(pts1_n, pts2_n, threshold=thresh_n)
            geom5 = estimate_five_point_opencv(pts1_n, pts2_n, threshold=thresh_n)
            algorithms[method] = summarize_algorithm(
                method,
                pts1_px,
                pts2_px,
                kp1_vis,
                kp2_vis,
                pipeline_stats,
                geom8,
                geom5,
                ref_E,
                K1,
                K2,
                R_ref,
                t_ref,
            )
    else:
        for method in ("SIFT", "ORB", "AKAZE"):
            algorithms[method] = {
                "available": False,
                "name": method,
                "reason": f"{scene_name} pair images are missing, so feature extraction was skipped.",
            }

    scene_pts = [np.array(fr.camera_center) for fr in frames]
    scene_pts.extend(np.array(p[:3], dtype=np.float64) for p in points[:200])
    bounds = scene_bounds(scene_pts)
    return {
        "title": scene_name,
        "description": f"ETH-style real scene '{scene_name}' parsed from a COLMAP sparse reconstruction with undistorted DSLR images and estimated camera poses.",
        "type": "real",
        "pairLabel": f"{frame_a.name} ↔ {frame_b.name}",
        "reference": reference,
        "pair": {"image1": pair_a, "image2": pair_b, "semanticMatches": []},
        "algorithms": algorithms,
        "scene": {
            "cameraCenters": [fr.camera_center.tolist() for fr in frames],
            "cubeHalf": None,
            "cubeCornersWorld": [],
            "sparsePoints": points,
            "bounds": bounds,
        },
        "notes": {
            "imagesMissing": not (asset_a["available"] and asset_b["available"]),
            "poseSource": "COLMAP estimated poses",
        },
    }


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Multi-View Geometry Lab</title>
  <style>
    :root {
      --bg: #0f1218;
      --panel: #171b23;
      --panel-2: #1e2430;
      --text: #e8edf6;
      --muted: #94a0b8;
      --accent: #7eb8ff;
      --accent-2: #7ce0b3;
      --warn: #ffb866;
      --line: #2f394a;
      --danger: #ff7d7d;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: Inter, Segoe UI, Arial, sans-serif;
      background: linear-gradient(180deg, #0d1016 0%, #0f1218 100%);
      color: var(--text);
      line-height: 1.6;
    }
    .shell {
      max-width: 1500px;
      margin: 0 auto;
      padding: 22px 20px 56px;
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 {
      font-size: 1.65rem;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 1.1rem;
      margin-bottom: 10px;
      color: #f5f8fe;
    }
    h3 {
      font-size: 0.95rem;
      margin-bottom: 6px;
      color: #dbe3f0;
    }
    p, li {
      color: var(--text);
      font-size: 0.94rem;
    }
    .lede {
      color: #c7d0df;
      max-width: 1100px;
      margin-bottom: 18px;
    }
    .topbar, .section, .card {
      background: rgba(23, 27, 35, 0.96);
      border: 1px solid var(--line);
      border-radius: 16px;
      box-shadow: 0 10px 34px rgba(0, 0, 0, 0.28);
    }
    .topbar {
      position: sticky;
      top: 12px;
      z-index: 10;
      padding: 14px 16px;
      backdrop-filter: blur(12px);
      margin-bottom: 20px;
    }
    .topgrid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      align-items: end;
    }
    label {
      display: block;
      color: var(--muted);
      font-size: 0.75rem;
      margin-bottom: 5px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    select, input[type="range"], button {
      width: 100%;
    }
    select, button {
      border-radius: 10px;
      border: 1px solid #3a465a;
      background: #11151d;
      color: var(--text);
      padding: 10px 12px;
      font: inherit;
    }
    button {
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }
    button:hover { background: #18202b; border-color: #51627d; }
    button.on { background: #20304a; border-color: var(--accent); }
    input[type="range"] {
      accent-color: var(--accent);
    }
    .dataset-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin-top: 12px;
      font-size: 0.88rem;
      color: var(--muted);
    }
    .dataset-meta strong { color: var(--text); }
    .toc {
      margin: 0 0 24px;
      padding: 0;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      list-style: none;
    }
    .toc a {
      color: var(--accent);
      text-decoration: none;
      background: rgba(126, 184, 255, 0.08);
      border: 1px solid rgba(126, 184, 255, 0.18);
      padding: 7px 10px;
      border-radius: 999px;
      font-size: 0.85rem;
    }
    .toc a:hover { background: rgba(126, 184, 255, 0.14); }
    .section {
      padding: 18px;
      margin-bottom: 18px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section.compact { min-height: auto; }
    .section-grid {
      display: grid;
      grid-template-columns: minmax(340px, 1fr) minmax(420px, 1.18fr);
      gap: 18px;
      align-items: stretch;
      flex: 1 1 auto;
      min-height: 0;
    }
    #sec7 .section-grid,
    #sec8 .section-grid {
      grid-template-columns: minmax(460px, 1.45fr) minmax(280px, 0.8fr);
    }
    .stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 0;
    }
    .card {
      padding: 14px;
    }
    .muted { color: var(--muted); }
    .mini {
      font-size: 0.82rem;
      color: var(--muted);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .stat {
      background: #11151d;
      border: 1px solid #263142;
      border-radius: 12px;
      padding: 10px 12px;
    }
    .stat .k {
      color: var(--muted);
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat .v {
      margin-top: 2px;
      color: var(--text);
      font-size: 1rem;
      font-weight: 600;
    }
    .canvas-wrap {
      background: #0c1017;
      border: 1px solid #2a3342;
      border-radius: 14px;
      padding: 12px;
      overflow: hidden;
      min-height: 340px;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #sec8 .canvas-wrap:last-of-type {
      min-height: 220px;
      flex: 0 0 auto;
    }
    .canvas-wrap canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
      height: auto;
      width: auto;
      border-radius: 10px;
      background: #0b0e13;
    }
    .viewer3d {
      position: relative;
      width: 100%;
      min-height: clamp(420px, 58vh, 820px);
      height: 100%;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #2a3342;
      background: #090c12;
      flex: 1 1 auto;
    }
    .viewer3d canvas { display: block; width: 100%; height: 100%; }
    .viewer-overlay {
      position: absolute;
      inset: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
    }
    .viewer-buttons,
    .viewer-legend {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: flex-start;
    }
    .viewer-btn {
      pointer-events: auto;
      border-radius: 0;
      border: none;
      background: transparent;
      color: rgba(238, 243, 251, 0.92);
      padding: 0;
      font-size: 0.78rem;
      text-shadow: 0 2px 8px rgba(0,0,0,0.55);
    }
    .viewer-chip {
      pointer-events: auto;
      color: #dde6f5;
      padding: 0;
      font-size: 0.78rem;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
    }
    .viewer-btn.on {
      color: rgba(126, 184, 255, 0.96);
    }
    .viewer-btn:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .legend-swatch {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      display: inline-block;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
    }
    .inline-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin: 12px 0 10px;
    }
    .readout {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.84rem;
      color: #d7dfec;
      background: #11151d;
      border: 1px solid #263142;
      border-radius: 12px;
      padding: 10px 12px;
      white-space: pre-wrap;
    }
    .callout {
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid #324159;
      background: #121a27;
      color: #d5def0;
      font-size: 0.9rem;
    }
    .pill-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .pill {
      padding: 4px 9px;
      border-radius: 999px;
      border: 1px solid #30405c;
      background: #101724;
      color: #d4deef;
      font-size: 0.78rem;
    }
    .candidate-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .candidate {
      border: 1px solid #33425a;
      border-radius: 12px;
      background: #10151e;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 0.88rem;
    }
    .candidate.on {
      border-color: var(--accent);
      background: #162236;
    }
    .matrix {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      margin-top: 8px;
    }
    .matrix div {
      border: 1px solid #2e394a;
      background: #10151d;
      border-radius: 10px;
      padding: 7px 8px;
      text-align: center;
      font-size: 0.82rem;
    }
    .compact-grid {
      display: grid;
      grid-template-columns: minmax(320px, 0.95fr) minmax(340px, 1.05fr);
      gap: 18px;
      align-items: start;
    }
    .footer-note {
      color: var(--muted);
      font-size: 0.86rem;
      margin-top: 16px;
    }
    .toggle-row {
      display: flex;
      align-items: end;
    }
    @media (max-width: 980px) {
      .section-grid {
        grid-template-columns: 1fr;
      }
      .compact-grid {
        grid-template-columns: 1fr;
      }
      .viewer3d {
        min-height: 360px;
      }
      .section {
        min-height: auto;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <h1>Interactive Multi-View Geometry Lab</h1>
    <p class="lede">
      This single page is both a guided lesson and an experiment console. Start from pixels, then move toward rays,
      scale ambiguity, epipolar geometry, feature matching, the essential matrix, minimal solvers, RANSAC, and
      relative pose recovery. Every section uses the same two-view data, but the visuals adapt when you switch datasets.
    </p>

    <div class="topbar">
      <div class="topgrid">
        <div>
          <label for="datasetSel">Dataset</label>
          <select id="datasetSel"></select>
        </div>
        <div>
          <label for="algoSel">Keypoint Method</label>
          <select id="algoSel">
            <option value="SIFT">SIFT</option>
            <option value="ORB">ORB</option>
            <option value="AKAZE">AKAZE</option>
          </select>
        </div>
        <div>
          <label for="estimatorSel">Geometry Model For Visuals</label>
          <select id="estimatorSel">
            <option value="reference">Reference pose-derived E</option>
            <option value="fivePoint">5-point + RANSAC</option>
            <option value="eightPoint">8-point + RANSAC</option>
          </select>
        </div>
        <div>
          <label for="matchLimit">Displayed Matches</label>
          <input id="matchLimit" type="range" min="12" max="180" step="1" value="60" />
        </div>
        <div class="toggle-row">
          <div>
            <label for="debugScaleBtn">Debug Scale</label>
            <button id="debugScaleBtn" type="button">Debug scale: off</button>
          </div>
        </div>
      </div>
      <div class="dataset-meta" id="datasetMeta"></div>
    </div>

    <ul class="toc">
      <li><a href="#sec1">1. Pixel to Ray</a></li>
      <li><a href="#sec2">2. Scale Ambiguity</a></li>
      <li><a href="#sec3">3. Two-View Geometry</a></li>
      <li><a href="#sec4">4. Epipolar Geometry</a></li>
      <li><a href="#sec5">5. Keypoint Matching</a></li>
      <li><a href="#sec6">6. Essential Matrix</a></li>
      <li><a href="#sec7">7. 8-Point vs 5-Point</a></li>
      <li><a href="#sec8">8. RANSAC</a></li>
      <li><a href="#sec9">9. Pose Recovery</a></li>
    </ul>

    <section class="section" id="sec1">
      <h2>1. Pixel to Ray</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            A single pixel does not identify a unique 3D point. It defines a <strong>ray</strong> that leaves the optical center
            and passes through one location on the image plane. Every 3D point on that ray projects back to the same pixel.
          </p>
          <div class="inline-controls">
            <div>
              <label for="rayDepth">Move 3D point along selected ray</label>
              <input id="rayDepth" type="range" min="0.4" max="8.0" step="0.01" value="2.4" />
            </div>
          </div>
          <div class="canvas-wrap"><canvas id="pixelCanvas"></canvas></div>
          <div class="callout" id="pixelNarrative"></div>
          <div class="readout" id="pixelReadout"></div>
        </div>
        <div class="stack">
          <div class="viewer3d" id="pixelViewer"></div>
          <div class="mini">Click the image to choose a pixel. The 3D viewer shows the corresponding ray in world space.</div>
        </div>
      </div>
    </section>

    <section class="section" id="sec2">
      <h2>2. Scale Ambiguity</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            Relative pose from two views is only known up to a common scale. If you scale both the scene depth and the
            camera translation by the same factor, the image measurements stay unchanged. Monocular geometry recovers shape
            and motion <strong>up to scale</strong>, not absolute meters.
          </p>
          <div class="inline-controls">
            <div>
              <label for="scaleSlider">Global scale factor</label>
              <input id="scaleSlider" type="range" min="0.3" max="3.0" step="0.01" value="1.0" />
            </div>
          </div>
          <div class="callout" id="scaleNarrative"></div>
          <div class="readout" id="scaleReadout"></div>
        </div>
        <div class="stack">
          <div class="viewer3d" id="scaleViewer"></div>
          <div class="mini">Camera 1 stays fixed. Camera 2 and the triangulated point are scaled together, preserving both projections.</div>
        </div>
      </div>
    </section>

    <section class="section" id="sec3">
      <h2>3. Two-View Geometry</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            A match gives one ray in camera 1 and another ray in camera 2. In real data those rays usually do not intersect
            exactly because of localization noise, descriptor ambiguity, calibration error, and model mismatch. Instead,
            they are often <strong>skew lines</strong> that pass near each other.
          </p>
          <div class="canvas-wrap"><canvas id="twoViewCanvas"></canvas></div>
          <div class="readout" id="twoViewReadout"></div>
        </div>
        <div class="stack">
          <div class="viewer3d" id="twoViewViewer"></div>
          <div class="mini">The yellow segment shows the shortest connection between the two rays for the currently selected correspondence.</div>
        </div>
      </div>
    </section>

    <section class="section" id="sec4">
      <h2>4. Epipolar Geometry</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            Once the relative pose is known, a point in image 1 maps to a whole <strong>epipolar line</strong> in image 2.
            The correspondence cannot be anywhere else. This is what the constraint
            <strong>x₂ᵀ E x₁ = 0</strong> means geometrically.
          </p>
          <div class="canvas-wrap"><canvas id="epiCanvas"></canvas></div>
          <div class="callout" id="epiNarrative"></div>
          <div class="readout" id="epiReadout"></div>
        </div>
        <div class="stack">
          <div class="viewer3d" id="epiViewer"></div>
          <div class="mini">Move in image A to sweep a ray and its epipolar plane. Hold a modifier key to zoom in 3D; otherwise the mouse wheel scrolls the page.</div>
        </div>
      </div>
    </section>

    <section class="section" id="sec5">
      <h2>5. Keypoint Detection, Description, and Matching</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            Detection chooses repeatable image locations. Description converts each local patch into a vector or bitstring.
            Matching compares descriptors across views. Change the method at the top and compare how many correspondences and
            inliers survive geometric verification.
          </p>
          <div class="inline-controls">
            <div>
              <label for="showInliersOnly">Pipeline stage</label>
              <select id="showInliersOnly">
                <option value="keypoints">1. Raw keypoints</option>
                <option value="ratio">2. Ratio-test matches</option>
                <option value="fivePoint">3. 5-point inliers</option>
                <option value="eightPoint">4. 8-point inliers</option>
              </select>
            </div>
          </div>
          <div class="canvas-wrap"><canvas id="matchCanvas"></canvas></div>
          <div class="stats" id="matchStats"></div>
          <div class="readout" id="matchReadout"></div>
        </div>
        <div class="stack">
          <div class="callout" id="matchNarrative"></div>
          <div class="pill-row" id="semanticPills"></div>
        </div>
      </div>
    </section>

    <section class="section compact" id="sec6">
      <h2>6. Essential Matrix</h2>
      <div class="compact-grid">
        <div class="stack">
          <p>
            In normalized camera coordinates, the essential matrix packages relative rotation and translation direction.
            It maps a point in one view to the epipolar line in the other. A good correspondence makes the scalar
            <strong>x₂ᵀ E x₁</strong> close to zero.
          </p>
          <div class="canvas-wrap"><canvas id="essentialCanvas"></canvas></div>
          <div class="card">
            <h3>Current 3×3 Matrix</h3>
            <div class="matrix" id="matrixGrid"></div>
          </div>
          <div class="readout" id="essentialReadout"></div>
        </div>
        <div class="stack">
          <div class="callout" id="essentialNarrative"></div>
        </div>
      </div>
    </section>

    <section class="section" id="sec7">
      <h2>7. 8-Point vs 5-Point</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            The 8-point algorithm is linear and easy to understand, but it needs more correspondences and usually benefits
            from normalization plus RANSAC. The 5-point algorithm is minimal for calibrated views and is often used inside
            RANSAC because it can hypothesize a model from fewer matches.
          </p>
          <div class="inline-controls">
            <div><button id="sample8Btn">Resample 8 correspondences</button></div>
            <div><button id="sample5Btn">Resample 5 correspondences</button></div>
          </div>
          <div class="canvas-wrap"><canvas id="sampleCanvas"></canvas></div>
          <div class="stats" id="sampleStats"></div>
          <div class="readout" id="sampleReadout"></div>
        </div>
        <div class="stack">
          <div class="callout" id="sampleNarrative"></div>
        </div>
      </div>
    </section>

    <section class="section" id="sec8">
      <h2>8. RANSAC</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            RANSAC repeatedly samples a minimal subset, estimates a model, then counts how many matches agree with it.
            Most hypotheses are weak. A few are good. The best one usually comes from a sample containing mostly inliers.
          </p>
          <div class="inline-controls">
            <div><button id="ransacPlayBtn">Play / Pause</button></div>
            <div><button id="ransacLoopBtn">Loop: off</button></div>
            <div>
              <label for="ransacIter">Iteration</label>
              <input id="ransacIter" type="range" min="0" max="1" step="1" value="0" />
            </div>
          </div>
          <div class="canvas-wrap"><canvas id="ransacCanvas"></canvas></div>
          <div class="canvas-wrap"><canvas id="ransacChart"></canvas></div>
          <div class="readout" id="ransacReadout"></div>
        </div>
        <div class="stack">
          <div class="callout" id="ransacNarrative"></div>
        </div>
      </div>
    </section>

    <section class="section" id="sec9">
      <h2>9. Pose Recovery</h2>
      <div class="section-grid">
        <div class="stack">
          <p>
            Decomposing an essential matrix gives four pose candidates. Only one places the reconstructed points in front
            of both cameras. That cheirality test chooses the physically valid relative pose.
          </p>
          <div class="candidate-grid" id="candidateGrid"></div>
          <div class="readout" id="poseReadout"></div>
        </div>
        <div class="stack">
          <div class="viewer3d" id="poseViewer"></div>
          <div class="mini">The selected candidate is rendered in a canonical coordinate system where camera 1 is at the origin.</div>
        </div>
      </div>
    </section>

    <p class="footer-note">
      Three.js is loaded from jsDelivr. Everything else, including the dataset payload, image thumbnails, and precomputed
      geometry, is embedded directly in this HTML file.
    </p>
  </div>

  <script type="application/json" id="payload">__PAYLOAD__</script>
  <script type="importmap">
  { "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }}
  </script>
  <script type="module">
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

  const DATA = JSON.parse(document.getElementById('payload').textContent);
  const datasetKeys = Object.keys(DATA.datasets);
  const datasetSel = document.getElementById('datasetSel');
  const algoSel = document.getElementById('algoSel');
  const estimatorSel = document.getElementById('estimatorSel');
  const matchLimit = document.getElementById('matchLimit');
  const showInliersOnly = document.getElementById('showInliersOnly');
  const datasetMeta = document.getElementById('datasetMeta');
  const pixelCanvas = document.getElementById('pixelCanvas');
  const twoViewCanvas = document.getElementById('twoViewCanvas');
  const epiCanvas = document.getElementById('epiCanvas');
  const matchCanvas = document.getElementById('matchCanvas');
  const essentialCanvas = document.getElementById('essentialCanvas');
  const sampleCanvas = document.getElementById('sampleCanvas');
  const ransacCanvas = document.getElementById('ransacCanvas');
  const ransacChart = document.getElementById('ransacChart');
  const pixelReadout = document.getElementById('pixelReadout');
  const pixelNarrative = document.getElementById('pixelNarrative');
  const scaleReadout = document.getElementById('scaleReadout');
  const scaleNarrative = document.getElementById('scaleNarrative');
  const twoViewReadout = document.getElementById('twoViewReadout');
  const epiReadout = document.getElementById('epiReadout');
  const epiNarrative = document.getElementById('epiNarrative');
  const matchStats = document.getElementById('matchStats');
  const matchReadout = document.getElementById('matchReadout');
  const matchNarrative = document.getElementById('matchNarrative');
  const semanticPills = document.getElementById('semanticPills');
  const matrixGrid = document.getElementById('matrixGrid');
  const essentialReadout = document.getElementById('essentialReadout');
  const essentialNarrative = document.getElementById('essentialNarrative');
  const sampleReadout = document.getElementById('sampleReadout');
  const sampleStats = document.getElementById('sampleStats');
  const sampleNarrative = document.getElementById('sampleNarrative');
  const ransacReadout = document.getElementById('ransacReadout');
  const ransacNarrative = document.getElementById('ransacNarrative');
  const candidateGrid = document.getElementById('candidateGrid');
  const poseReadout = document.getElementById('poseReadout');
  const rayDepth = document.getElementById('rayDepth');
  const scaleSlider = document.getElementById('scaleSlider');
  const ransacIter = document.getElementById('ransacIter');
  const ransacPlayBtn = document.getElementById('ransacPlayBtn');
  const ransacLoopBtn = document.getElementById('ransacLoopBtn');
  const sample8Btn = document.getElementById('sample8Btn');
  const sample5Btn = document.getElementById('sample5Btn');
  const debugScaleBtn = document.getElementById('debugScaleBtn');

  function fmt(v, digits = 3) {
    if (v == null || Number.isNaN(v)) return 'n/a';
    return Number(v).toFixed(digits);
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function vecNorm(v) { return Math.hypot(...v); }
  function vecScale(v, s) { return v.map(x => x * s); }
  function vecAdd(a, b) { return a.map((x, i) => x + b[i]); }
  function vecSub(a, b) { return a.map((x, i) => x - b[i]); }
  function vecDot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
  function vecCross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }
  function vecUnit(v) {
    const n = vecNorm(v) || 1;
    return v.map(x => x / n);
  }
  function matVec(M, v) {
    return [
      M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
      M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
      M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
    ];
  }
  function matT(M) {
    return [
      [M[0][0], M[1][0], M[2][0]],
      [M[0][1], M[1][1], M[2][1]],
      [M[0][2], M[1][2], M[2][2]],
    ];
  }
  function matMul(A, B) {
    const out = Array.from({ length: 3 }, () => [0, 0, 0]);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        out[r][c] = A[r][0] * B[0][c] + A[r][1] * B[1][c] + A[r][2] * B[2][c];
      }
    }
    return out;
  }
  function invK(K) {
    const fx = K[0][0], fy = K[1][1], cx = K[0][2], cy = K[1][2];
    return [
      [1 / fx, 0, -cx / fx],
      [0, 1 / fy, -cy / fy],
      [0, 0, 1],
    ];
  }
  function projectPoint(K, p) {
    const z = Math.abs(p[2]) < 1e-9 ? 1e-9 : p[2];
    return [K[0][0] * (p[0] / z) + K[0][2], K[1][1] * (p[1] / z) + K[1][2]];
  }
  function cameraCenterFromPose(R, t) {
    const Rt = matT(R);
    const v = matVec(Rt, t);
    return [-v[0], -v[1], -v[2]];
  }
  function rayDirWorld(frame, uv) {
    const K = frame.K;
    const dc = [(uv[0] - K[0][2]) / K[0][0], (uv[1] - K[1][2]) / K[1][1], 1];
    const dw = matVec(matT(frame.R_w2c), dc);
    return vecUnit(dw);
  }
  function imageLineEndpoints(line, width, height) {
    const [a, b, c] = line;
    const pts = [];
    const add = (x, y) => {
      if (x >= 0 && x <= width && y >= 0 && y <= height) pts.push([x, y]);
    };
    if (Math.abs(b) > 1e-9) {
      add(0, -c / b);
      add(width, -(a * width + c) / b);
    }
    if (Math.abs(a) > 1e-9) {
      add(-c / a, 0);
      add(-(b * height + c) / a, height);
    }
    if (pts.length < 2) return null;
    const uniq = [];
    for (const p of pts) {
      if (!uniq.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6)) uniq.push(p);
    }
    return uniq.length >= 2 ? [uniq[0], uniq[1]] : null;
  }
  const viewerList = [];
  function fitDistanceForRadius(radius, fovDeg = 48) {
    const halfFov = THREE.MathUtils.degToRad(fovDeg * 0.5);
    return Math.max((radius / Math.tan(halfFov)) * 1.12, radius * 2.2);
  }
  function resetViewerView(viewer) {
    if (!viewer.defaultView) return;
    const { position, target } = viewer.defaultView;
    viewer.camera.position.set(position[0], position[1], position[2]);
    viewer.controls.target.set(target[0], target[1], target[2]);
    viewer.controls.update();
  }
  function configureViewerBounds(viewer, bounds, options = {}) {
    const radius = Math.max(options.radius ?? bounds.radius ?? 1, 1e-4);
    const target = [...(options.target ?? bounds.center ?? [0, 0, 0])];
    const azimuth = options.azimuth ?? (Math.PI * 0.25);
    const elevation = options.elevation ?? 0.62;
    const distance = options.distance ?? fitDistanceForRadius(radius, viewer.camera.fov);
    const planar = Math.cos(elevation) * distance;
    const position = [
      target[0] + Math.cos(azimuth) * planar,
      target[1] + Math.sin(elevation) * distance,
      target[2] + Math.sin(azimuth) * planar,
    ];
    viewer.camera.near = Math.max(radius * 0.02, 0.005);
    viewer.camera.far = Math.max(radius * 40, 60);
    viewer.camera.updateProjectionMatrix();
    viewer.controls.minDistance = Math.max(options.minDistance ?? radius * 0.9, 0.06);
    viewer.controls.maxDistance = Math.max(options.maxDistance ?? radius * 4.0, viewer.controls.minDistance + 0.25);
    viewer.controls.minPolarAngle = options.minPolarAngle ?? 0.18;
    viewer.controls.maxPolarAngle = options.maxPolarAngle ?? (Math.PI - 0.18);
    viewer.defaultView = { position, target };
    if (viewer.focusKey !== options.focusKey) {
      viewer.focusKey = options.focusKey ?? null;
      resetViewerView(viewer);
    }
  }
  function setViewerOverlay(viewer, config = {}) {
    const legend = Array.isArray(config.legend) ? config.legend : [];
    viewer.legend.innerHTML = legend.map((item) => `
      <span class="viewer-chip legend-item">
        <span class="legend-swatch" style="background:${item.color}"></span>${item.label}
      </span>
    `).join('');
    if (config.contextToggle) {
      viewer.contextBtn.style.display = '';
      viewer.contextBtn.textContent = config.contextToggle.label;
      viewer.contextBtn.classList.toggle('on', !!config.contextToggle.active);
      viewer.contextBtn.onclick = config.contextToggle.onClick;
    } else {
      viewer.contextBtn.style.display = 'none';
      viewer.contextBtn.onclick = null;
    }
  }
  function shouldAllowWheelZoom(ev) {
    return !!(ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey);
  }
  function makeViewer(hostId) {
    const host = document.getElementById(hostId);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x090c12, 1);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.01, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.zoomSpeed = 0.72;
    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(5, 9, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88bbff, 0.4);
    fill.position.set(-6, 4, -4);
    scene.add(fill);
    const root = new THREE.Group();
    scene.add(root);
    const overlay = document.createElement('div');
    overlay.className = 'viewer-overlay';
    const buttons = document.createElement('div');
    buttons.className = 'viewer-buttons';
    const legend = document.createElement('div');
    legend.className = 'viewer-legend';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'viewer-btn';
    resetBtn.textContent = 'Reset View';
    const contextBtn = document.createElement('button');
    contextBtn.type = 'button';
    contextBtn.className = 'viewer-btn';
    contextBtn.style.display = 'none';
    buttons.append(resetBtn, contextBtn);
    overlay.append(buttons, legend);
    host.appendChild(overlay);
    const resize = () => {
      const w = host.clientWidth || 300;
      const h = host.clientHeight || 300;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const viewer = {
      host,
      renderer,
      scene,
      camera,
      controls,
      root,
      resize,
      focusKey: null,
      defaultView: null,
      isVisible: true,
      legend,
      contextBtn,
      resetBtn,
    };
    resetBtn.onclick = () => resetViewerView(viewer);
    renderer.domElement.addEventListener('wheel', (ev) => {
      controls.enableZoom = shouldAllowWheelZoom(ev);
      if (!controls.enableZoom) ev.stopImmediatePropagation();
      queueMicrotask(() => { controls.enableZoom = true; });
    }, { capture: true });
    new ResizeObserver(resize).observe(host);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        viewer.isVisible = entries[0] ? entries[0].isIntersecting : true;
      }, { threshold: 0.02 }).observe(host);
    }
    resize();
    viewerList.push(viewer);
    return viewer;
  }

  const viewers = {
    pixel: makeViewer('pixelViewer'),
    scale: makeViewer('scaleViewer'),
    twoView: makeViewer('twoViewViewer'),
    epi: makeViewer('epiViewer'),
    pose: makeViewer('poseViewer'),
  };

  function disposeThreeObject(obj) {
    if (obj.geometry) obj.geometry.dispose();
    const materials = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    for (const material of materials) {
      if (material.map) material.map.dispose();
      material.dispose();
    }
  }
  function clearGroup(group) {
    while (group.children.length) {
      const child = group.children[0];
      child.traverse((obj) => disposeThreeObject(obj));
      group.remove(child);
    }
  }
  function sceneScaleInfo(ds) {
    const b = ds.scene.bounds || {};
    return {
      center: b.center || [0, 0, 0],
      radius: Math.max(b.radius || 1, 1e-6),
      diameter: b.diameter || 2 * Math.max(b.radius || 1, 1e-6),
      min: b.min || [-1, -1, -1],
      max: b.max || [1, 1, 1],
    };
  }
  function normalizeScenePoint(ds, p) {
    const info = sceneScaleInfo(ds);
    return [
      (p[0] - info.center[0]) / info.radius,
      (p[1] - info.center[1]) / info.radius,
      (p[2] - info.center[2]) / info.radius,
    ];
  }
  function normalizeSceneBounds(ds) {
    const info = sceneScaleInfo(ds);
    return {
      min: normalizeScenePoint(ds, info.min),
      max: normalizeScenePoint(ds, info.max),
      center: [0, 0, 0],
      radius: 1.0,
      diameter: info.diameter / info.radius,
    };
  }
  function canonicalBounds(points) {
    if (!points.length) {
      return { center: [0, 0, 0], radius: 1, min: [-1, -1, -1], max: [1, 1, 1], diameter: 2 };
    }
    const lo = [Infinity, Infinity, Infinity];
    const hi = [-Infinity, -Infinity, -Infinity];
    for (const p of points) {
      for (let i = 0; i < 3; i++) {
        lo[i] = Math.min(lo[i], p[i]);
        hi[i] = Math.max(hi[i], p[i]);
      }
    }
    const center = lo.map((x, i) => 0.5 * (x + hi[i]));
    let radius = 1;
    for (const p of points) {
      radius = Math.max(radius, vecNorm(vecSub(p, center)));
    }
    return { center, radius, min: lo, max: hi, diameter: 2 * radius };
  }
  function normalizePointWithBounds(bounds, p) {
    const r = Math.max(bounds.radius || 1, 1e-6);
    return [
      (p[0] - bounds.center[0]) / r,
      (p[1] - bounds.center[1]) / r,
      (p[2] - bounds.center[2]) / r,
    ];
  }
  function transformedBounds(points, pointTransform = (p) => p) {
    return canonicalBounds(points.map(pointTransform));
  }
  function addLabelSprite(group, text, p, pointTransform = (q) => q, scale = 0.18) {
    const q = pointTransform(p);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    // Transparent background: text-only label (no box).
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eef3fb';
    ctx.font = '600 30px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.position.set(q[0], q[1], q[2]);
    sprite.scale.set(scale * 1.9, scale * 0.72, 1);
    group.add(sprite);
  }
  function addMetricReference(group, size) {
    const grid = new THREE.GridHelper(size, 8, 0x36506d, 0x253240);
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    group.add(grid);
    const axes = new THREE.AxesHelper(Math.max(size * 0.28, 0.35));
    axes.position.y = 0.001;
    group.add(axes);
  }
  function imagePlanePointWorld(frame, uv, depth) {
    const Xc = [
      depth * (uv[0] - frame.K[0][2]) / frame.K[0][0],
      depth * (uv[1] - frame.K[1][2]) / frame.K[1][1],
      depth,
    ];
    return vecAdd(frame.cameraCenter, matVec(matT(frame.R_w2c), Xc));
  }
  function currentEpipolarPixel(ds, match) {
    return state.hoverPixel || state.lockedPixel || (match ? match.p1 : [ds.pair.image1.width * 0.5, ds.pair.image1.height * 0.5]);
  }
  function addDebugHelpers(group, bounds) {
    if (!state.debugScale) return;
    const min = bounds.min || [-1, -1, -1];
    const max = bounds.max || [1, 1, 1];
    const box = new THREE.Box3(
      new THREE.Vector3(min[0], min[1], min[2]),
      new THREE.Vector3(max[0], max[1], max[2]),
    );
    group.add(new THREE.Box3Helper(box, 0xff4fd8));
    group.add(new THREE.AxesHelper(Math.max(0.9, bounds.diameter || 2)));
  }
  function addSceneContext(group, ds, alpha = 1) {
    const bounds = normalizeSceneBounds(ds);
    if (Array.isArray(ds.scene.cubeCornersWorld) && ds.scene.cubeCornersWorld.length === 8) {
      const h = (ds.scene.cubeHalf || 0.5) / sceneScaleInfo(ds).radius;
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * h, 2 * h, 2 * h)),
        new THREE.LineBasicMaterial({ color: 0xbfd2ff, transparent: true, opacity: 0.8 * alpha }),
      );
      group.add(box);
      const pts = ds.scene.cubeCornersWorld.map(p => normalizeScenePoint(ds, p)).map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.PointsMaterial({ size: 4.5, color: 0xffcc66, sizeAttenuation: false });
      group.add(new THREE.Points(geom, mat));
    }
    if (Array.isArray(ds.scene.sparsePoints) && ds.scene.sparsePoints.length) {
      const pos = [];
      const col = [];
      for (const p of ds.scene.sparsePoints) {
        const q = normalizeScenePoint(ds, p);
        pos.push(q[0], q[1], q[2]);
        col.push(p[3], p[4], p[5]);
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      group.add(new THREE.Points(geom, new THREE.PointsMaterial({ size: 2.8, vertexColors: true, transparent: true, opacity: 0.65 * alpha, sizeAttenuation: false })));
    }
    if (Array.isArray(ds.scene.cameraCenters)) {
      const pos = [];
      for (const p of ds.scene.cameraCenters) {
        const q = normalizeScenePoint(ds, p);
        pos.push(q[0], q[1], q[2]);
      }
      if (pos.length) {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        group.add(new THREE.Points(geom, new THREE.PointsMaterial({ size: 4.0, color: 0x8893a7, transparent: true, opacity: 0.75 * alpha, sizeAttenuation: false })));
      }
    }
    addDebugHelpers(group, bounds);
  }
  function addCameraFrustum(group, frame, color, depthScale = 0.32, pointTransform = (p) => p, markerRadius = 0.012) {
    const C = frame.cameraCenter;
    const depth = depthScale;
    const K = frame.K;
    const W = frame.width;
    const H = frame.height;
    const cornersPx = [[0, 0], [W, 0], [W, H], [0, H]];
    const Rt = matT(frame.R_w2c);
    const pts = cornersPx.map(([u, v]) => {
      const Xc = [depth * (u - K[0][2]) / K[0][0], depth * (v - K[1][2]) / K[1][1], depth];
      const Xw = pointTransform(vecAdd(C, matVec(Rt, Xc)));
      return new THREE.Vector3(Xw[0], Xw[1], Xw[2]);
    });
    const Cn = pointTransform(C);
    const center = new THREE.Vector3(Cn[0], Cn[1], Cn[2]);
    const linePts = [];
    for (const p of pts) linePts.push(center, p);
    const rays = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(linePts),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }),
    );
    const frameLoop = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color }),
    );
    group.add(rays);
    group.add(frameLoop);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(markerRadius, 16, 16),
      new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 }),
    );
    marker.position.copy(center);
    group.add(marker);
  }
  function addPolyline(group, pts, color, opacity = 1, pointTransform = (p) => p) {
    const geom = new THREE.BufferGeometry().setFromPoints(pts.map(pointTransform).map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
    group.add(line);
  }
  function addPointSphere(group, p, color, radius, pointTransform = (q) => q) {
    const q = pointTransform(p);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 18, 18),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.03 }),
    );
    mesh.position.set(q[0], q[1], q[2]);
    group.add(mesh);
  }
  function addPointCloud(group, pts, color, size, pointTransform = (p) => p) {
    if (!pts || !pts.length) return;
    const pos = [];
    for (const p of pts) {
      const q = pointTransform(p);
      pos.push(q[0], q[1], q[2]);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size, color, sizeAttenuation: false, transparent: true, opacity: 0.95 });
    group.add(new THREE.Points(geom, mat));
  }
  function pairCanvasLayout(ds, options = {}) {
    const A = ds.pair.image1;
    const B = ds.pair.image2;
    const gap = options.gap ?? 18;
    const mode = options.mode ?? 'vertical';
    const natural = mode === 'horizontal'
      ? {
          ax: 0,
          ay: 0,
          bx: A.width + gap,
          by: 0,
          width: A.width + gap + B.width,
          height: Math.max(A.height, B.height),
        }
      : {
          ax: 0,
          ay: 0,
          bx: 0,
          by: A.height + gap,
          width: Math.max(A.width, B.width),
          height: A.height + gap + B.height,
        };
    const maxWidth = Math.max(options.maxWidth ?? natural.width, 260);
    const scale = Math.min(1, maxWidth / natural.width);
    return {
      ...natural,
      gap: gap * scale,
      ax: natural.ax * scale,
      ay: natural.ay * scale,
      bx: natural.bx * scale,
      by: natural.by * scale,
      width: natural.width * scale,
      height: natural.height * scale,
      aWidth: A.width * scale,
      aHeight: A.height * scale,
      bWidth: B.width * scale,
      bHeight: B.height * scale,
      scale,
      mode,
      naturalWidth: natural.width,
      naturalHeight: natural.height,
    };
  }
  function layoutPoint(layout, which, p) {
    const ox = which === 'A' ? layout.ax : layout.bx;
    const oy = which === 'A' ? layout.ay : layout.by;
    return [ox + p[0] * layout.scale, oy + p[1] * layout.scale];
  }
  function pointInsideLayoutImage(layout, which, x, y) {
    const ox = which === 'A' ? layout.ax : layout.bx;
    const oy = which === 'A' ? layout.ay : layout.by;
    const w = which === 'A' ? layout.aWidth : layout.bWidth;
    const h = which === 'A' ? layout.aHeight : layout.bHeight;
    return x >= ox && x <= ox + w && y >= oy && y <= oy + h;
  }
  function layoutToImagePoint(layout, which, x, y) {
    const ox = which === 'A' ? layout.ax : layout.bx;
    const oy = which === 'A' ? layout.ay : layout.by;
    return [(x - ox) / layout.scale, (y - oy) / layout.scale];
  }
  function setCanvasSize(canvas, width, height) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  const imageCache = new Map();
  async function loadImages() {
    const promises = [];
    for (const key of datasetKeys) {
      const ds = DATA.datasets[key];
      for (const which of ['image1', 'image2']) {
        const src = ds.pair[which].imageDataUri;
        promises.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache.set(`${key}:${which}`, img);
            resolve();
          };
          img.src = src;
        }));
      }
    }
    await Promise.all(promises);
  }

  const state = {
    datasetKey: datasetKeys[0],
    algorithmKey: 'SIFT',
    estimatorKey: 'reference',
    selectedMatchIndex: 0,
    lockedPixel: null,
    hoverPixel: null,
    scale: 1.0,
    rayDepth: 2.4,
    sample8: [],
    sample5: [],
    ransacStep: 0,
    candidateIndex: 0,
    ransacPlaying: false,
    ransacLoop: false,
    lastRansacAdvance: 0,
    debugScale: false,
    viewerContext: {
      pixel: true,
      twoView: false,
      epi: true,
      pose: false,
    },
  };
  function maybeLogDebug(label, payload) {
    if (state.debugScale) console.log(`[scale-debug] ${label}`, payload);
  }

  for (const key of datasetKeys) {
    const o = document.createElement('option');
    o.value = key;
    o.textContent = DATA.datasets[key].title;
    datasetSel.appendChild(o);
  }

  function currentDataset() { return DATA.datasets[state.datasetKey]; }
  function currentAlgorithmData() {
    const ds = currentDataset();
    const algo = ds.algorithms[state.algorithmKey];
    return algo && algo.available ? algo : null;
  }
  function currentEstimatorPayload() {
    const ds = currentDataset();
    const algo = currentAlgorithmData();
    if (state.estimatorKey === 'reference' || !algo) return { E: ds.reference.E, name: 'reference', inliers: null };
    if (state.estimatorKey === 'eightPoint' && algo.eightPoint && algo.eightPoint.available) return { E: algo.eightPoint.E, name: '8-point + RANSAC', inliers: algo.eightPoint.inliers };
    if (state.estimatorKey === 'fivePoint' && algo.fivePoint && algo.fivePoint.available) return { E: algo.fivePoint.E, name: '5-point + RANSAC', inliers: algo.fivePoint.inliers };
    return { E: ds.reference.E, name: 'reference', inliers: null };
  }
  function ensureSelectedMatch() {
    const algo = currentAlgorithmData();
    if (!algo || !algo.matches.length) {
      state.selectedMatchIndex = 0;
      return null;
    }
    if (state.selectedMatchIndex >= algo.matches.length) state.selectedMatchIndex = 0;
    let chosen = algo.matches[state.selectedMatchIndex];
    if (state.estimatorKey === 'fivePoint') {
      const idx = algo.matches.findIndex(m => m.inlier5);
      if (idx >= 0) state.selectedMatchIndex = idx;
    } else if (state.estimatorKey === 'eightPoint') {
      const idx = algo.matches.findIndex(m => m.inlier8);
      if (idx >= 0) state.selectedMatchIndex = idx;
    }
    chosen = algo.matches[state.selectedMatchIndex];
    return chosen;
  }
  function currentMatchListForDisplay() {
    const algo = currentAlgorithmData();
    if (!algo) return [];
    let matches = algo.matches.slice();
    if (showInliersOnly.value === 'keypoints') return [];
    if (showInliersOnly.value === 'ratio') return matches.slice(0, Number(matchLimit.value));
    if (showInliersOnly.value === 'fivePoint') matches = matches.filter(m => m.inlier5);
    if (showInliersOnly.value === 'eightPoint') matches = matches.filter(m => m.inlier8);
    return matches.slice(0, Number(matchLimit.value));
  }
  function currentMatchStageLabel() {
    return ({
      keypoints: 'raw keypoints',
      ratio: 'ratio-test matches',
      fivePoint: '5-point inliers',
      eightPoint: '8-point inliers',
    })[showInliersOnly.value] || 'ratio-test matches';
  }
  function resampleSubsets() {
    const algo = currentAlgorithmData();
    if (!algo || !algo.matches.length) {
      state.sample8 = [];
      state.sample5 = [];
      return;
    }
    const pool = algo.matches.map(m => m.index);
    const inliers = algo.matches.filter(m => m.inlier5 || m.inlier8).map(m => m.index);
    const source = inliers.length >= 8 ? inliers : pool;
    function pick(k) {
      const src = source.slice();
      if (src.length <= k) return src.slice();
      const out = [];
      while (out.length < k && src.length) {
        out.push(src.splice(Math.floor(Math.random() * src.length), 1)[0]);
      }
      return out;
    }
    state.sample8 = pick(8);
    state.sample5 = pick(5);
  }

  function syncMeta() {
    const ds = currentDataset();
    datasetMeta.innerHTML = '';
    const algo = currentAlgorithmData();
    const entries = [
      ['Dataset', ds.title],
      ['Scene type', ds.type],
      ['Pair', ds.pairLabel],
      ['Pose source', ds.notes.poseSource],
      ['Algorithm', state.algorithmKey],
      ['Match count', algo ? algo.stats.matchCount : 'unavailable'],
    ];
    for (const [k, v] of entries) {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${k}:</strong> ${v}`;
      datasetMeta.appendChild(div);
    }
  }

  function setOrbitCamera(viewer, ds, focusKey) {
    configureViewerBounds(viewer, normalizeSceneBounds(ds), { focusKey, target: [0, 0, 0], radius: 1 });
  }
  function setCanonicalCamera(viewer, bounds, focusKey) {
    const radius = Math.max(bounds.radius || 1, 1);
    configureViewerBounds(viewer, bounds, { focusKey, target: [0, 0, 0.1 * radius], radius });
  }

  function drawPixelSection() {
    const ds = currentDataset();
    const img = imageCache.get(`${state.datasetKey}:image1`);
    const ctx = setCanvasSize(pixelCanvas, ds.pair.image1.width, ds.pair.image1.height);
    ctx.drawImage(img, 0, 0, ds.pair.image1.width, ds.pair.image1.height);
    const match = ensureSelectedMatch();
    let uv = state.lockedPixel;
    if (!uv) uv = match ? match.p1 : [ds.pair.image1.width * 0.5, ds.pair.image1.height * 0.5];
    ctx.strokeStyle = '#7eb8ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(uv[0], uv[1], 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(uv[0] - 11, uv[1]);
    ctx.lineTo(uv[0] + 11, uv[1]);
    ctx.moveTo(uv[0], uv[1] - 11);
    ctx.lineTo(uv[0], uv[1] + 11);
    ctx.stroke();

    const frame = ds.pair.image1;
    const dir = rayDirWorld(frame, uv);
    const depth = Number(rayDepth.value);
    const C = frame.cameraCenter;
    const point = vecAdd(C, vecScale(dir, depth));
    pixelNarrative.textContent = `Selected pixel (${fmt(uv[0], 1)}, ${fmt(uv[1], 1)}) maps to one world-space ray. Moving the yellow point from depth ${fmt(depth, 2)} along that ray does not change its image coordinate in view A.`;
    pixelReadout.textContent =
`camera center C = [${fmt(C[0])}, ${fmt(C[1])}, ${fmt(C[2])}]
ray direction d = [${fmt(dir[0])}, ${fmt(dir[1])}, ${fmt(dir[2])}]
point on ray X(lambda) = C + lambda d
current lambda = ${fmt(depth, 3)}
current point = [${fmt(point[0])}, ${fmt(point[1])}, ${fmt(point[2])}]`;

    const viewer = viewers.pixel;
    clearGroup(viewer.root);
    if (state.viewerContext.pixel) addSceneContext(viewer.root, ds, 0.75);
    addCameraFrustum(viewer.root, ds.pair.image1, 0x7eb8ff, 0.22, (p) => normalizeScenePoint(ds, p), 0.013);
    addPolyline(viewer.root, [C, point], 0x7eb8ff, 1, (p) => normalizeScenePoint(ds, p));
    addPointSphere(viewer.root, point, 0xffd166, 0.018, (p) => normalizeScenePoint(ds, p));
    addLabelSprite(viewer.root, 'Camera 1', vecAdd(C, [0, 0.12 * sceneScaleInfo(ds).radius, 0]), (p) => normalizeScenePoint(ds, p), 0.21);
    addLabelSprite(viewer.root, 'Ray 1', vecAdd(C, vecScale(dir, depth * 0.45)), (p) => normalizeScenePoint(ds, p), 0.18);
    addLabelSprite(viewer.root, 'Sample point', vecAdd(point, [0, 0.1 * sceneScaleInfo(ds).radius, 0]), (p) => normalizeScenePoint(ds, p), 0.18);
    setViewerOverlay(viewer, {
      legend: [
        { color: '#7eb8ff', label: 'camera + ray' },
        { color: '#ffd166', label: 'selected 3D point' },
        { color: '#8893a7', label: 'scene context' },
      ],
      contextToggle: {
        label: `Scene context: ${state.viewerContext.pixel ? 'on' : 'off'}`,
        active: state.viewerContext.pixel,
        onClick: () => { state.viewerContext.pixel = !state.viewerContext.pixel; redraw(); },
      },
    });
    setOrbitCamera(viewer, ds, `${state.datasetKey}:pixel`);
    maybeLogDebug('pixel', { dataset: state.datasetKey, scene: sceneScaleInfo(ds), point, depth });
  }

  function drawScaleSection() {
    const ds = currentDataset();
    const match = ensureSelectedMatch();
    if (!match) {
      scaleNarrative.textContent = 'Scale ambiguity needs at least one matched correspondence.';
      scaleReadout.textContent = 'No correspondence is currently available.';
      return;
    }
    const ref = ds.reference;
    const R = ref.R;
    const t = ref.t;
    const x1 = [...match.x1n, 1];
    const x2 = [...match.x2n, 1];
    const d1 = vecUnit(x1);
    const d2 = vecUnit(matVec(matT(R), x2));
    const C1 = [0, 0, 0];
    const C2 = [- (R[0][0] * t[0] + R[1][0] * t[1] + R[2][0] * t[2]), - (R[0][1] * t[0] + R[1][1] * t[1] + R[2][1] * t[2]), - (R[0][2] * t[0] + R[1][2] * t[1] + R[2][2] * t[2])];
    const w0 = vecSub(C1, C2);
    const a = vecDot(d1, d1);
    const b = vecDot(d1, d2);
    const c = vecDot(d2, d2);
    const d = vecDot(d1, w0);
    const e = vecDot(d2, w0);
    const denom = a * c - b * b || 1e-9;
    const s = (b * e - c * d) / denom;
    const tri = vecAdd(C1, vecScale(d1, s));
    const scale = Number(scaleSlider.value);
    const C2s = vecScale(C2, scale);
    const tris = vecScale(tri, scale);
    const X1 = tris;
    const X2 = vecAdd(matVec(R, tris), vecScale(t, scale));
    const u1 = projectPoint([[1,0,0],[0,1,0],[0,0,1]], X1);
    const u2 = projectPoint([[1,0,0],[0,1,0],[0,0,1]], X2);
    scaleNarrative.textContent = `The baseline and the 3D point are both multiplied by ${fmt(scale, 2)}. Their normalized image projections remain unchanged, so the two-view geometry cannot determine absolute scale by itself.`;
    scaleReadout.textContent =
`canonical translation direction = [${fmt(t[0])}, ${fmt(t[1])}, ${fmt(t[2])}]
scale factor = ${fmt(scale, 3)}
scaled camera-2 center = [${fmt(C2s[0])}, ${fmt(C2s[1])}, ${fmt(C2s[2])}]
scaled point = [${fmt(tris[0])}, ${fmt(tris[1])}, ${fmt(tris[2])}]
projection in view 1 = [${fmt(u1[0])}, ${fmt(u1[1])}]
projection in view 2 = [${fmt(u2[0])}, ${fmt(u2[1])}]`;

    const viewer = viewers.scale;
    clearGroup(viewer.root);
    const maxScale = Number(scaleSlider.max || 3.0);
    const metricBounds = canonicalBounds([C1, vecScale(C2, maxScale), vecScale(tri, maxScale)]);
    const frustumDepth = Math.max(0.12 * scale, 0.08);
    addMetricReference(viewer.root, Math.max(metricBounds.radius * 2.2, 1.5));
    addDebugHelpers(viewer.root, metricBounds);
    addCameraFrustum(viewer.root, { ...ds.pair.image1, cameraCenter: C1, R_w2c: [[1,0,0],[0,1,0],[0,0,1]], t_w2c: [0,0,0] }, 0x7eb8ff, frustumDepth, (p) => p, 0.02);
    addCameraFrustum(viewer.root, { ...ds.pair.image2, cameraCenter: C2s, R_w2c: R, t_w2c: vecScale(t, scale) }, 0x7ce0b3, frustumDepth, (p) => p, 0.02);
    addPolyline(viewer.root, [C1, tris], 0x7eb8ff, 1);
    addPolyline(viewer.root, [C2s, tris], 0x7ce0b3, 1);
    addPointSphere(viewer.root, tris, 0xffd166, 0.028);
    addLabelSprite(viewer.root, 'Camera 1', vecAdd(C1, [0, 0.18, 0]), (p) => p, 0.22);
    addLabelSprite(viewer.root, 'Camera 2', vecAdd(C2s, [0, 0.18, 0]), (p) => p, 0.22);
    addLabelSprite(viewer.root, 'Scaled point', vecAdd(tris, [0, 0.18, 0]), (p) => p, 0.2);
    setViewerOverlay(viewer, {
      legend: [
        { color: '#7eb8ff', label: 'camera 1 + ray 1' },
        { color: '#7ce0b3', label: 'camera 2 + ray 2' },
        { color: '#ffd166', label: 'triangulated point' },
        { color: '#6e89a8', label: 'metric grid / scale reference' },
      ],
    });
    configureViewerBounds(viewer, metricBounds, {
      focusKey: `${state.datasetKey}:scale`,
      target: [0, Math.max(metricBounds.radius * 0.18, 0.08), 0],
      radius: metricBounds.radius,
      minDistance: metricBounds.radius * 1.0,
      maxDistance: metricBounds.radius * 4.8,
    });
    maybeLogDebug('scale', { dataset: state.datasetKey, scale, metricBounds, camera2: C2s, point: tris });
  }

  function drawPairBase(canvas, ds, labelA, labelB, options = {}) {
    const maxWidth = Math.max((canvas.parentElement?.clientWidth || ds.pair.image1.width) - 24, 260);
    const layout = pairCanvasLayout(ds, { mode: options.mode ?? 'vertical', maxWidth, gap: options.gap ?? 18 });
    const ctx = setCanvasSize(canvas, layout.width, layout.height);
    canvas._layout = layout;
    ctx.clearRect(0, 0, layout.width, layout.height);
    const imgA = imageCache.get(`${state.datasetKey}:image1`);
    const imgB = imageCache.get(`${state.datasetKey}:image2`);
    ctx.drawImage(imgA, layout.ax, layout.ay, layout.aWidth, layout.aHeight);
    ctx.drawImage(imgB, layout.bx, layout.by, layout.bWidth, layout.bHeight);
    ctx.fillStyle = 'rgba(8, 11, 16, 0.72)';
    ctx.fillRect(layout.ax, layout.ay, 160, 28);
    ctx.fillRect(layout.bx, layout.by, 160, 28);
    ctx.fillStyle = '#eef3fb';
    ctx.font = '600 13px Segoe UI';
    ctx.fillText(labelA, layout.ax + 10, layout.ay + 18);
    ctx.fillText(labelB, layout.bx + 10, layout.by + 18);
    return { ctx, layout };
  }

  function drawTwoViewSection() {
    const ds = currentDataset();
    const match = ensureSelectedMatch();
    const { ctx, layout } = drawPairBase(twoViewCanvas, ds, 'View A', 'View B');
    if (!match) {
      twoViewReadout.textContent = 'No matched correspondence is available for the current algorithm.';
      return;
    }
    const p1 = layoutPoint(layout, 'A', match.p1);
    const p2 = layoutPoint(layout, 'B', match.p2);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    for (const p of [[p1[0], p1[1]], p2]) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const frameA = ds.pair.image1;
    const frameB = ds.pair.image2;
    const C1 = frameA.cameraCenter;
    const C2 = frameB.cameraCenter;
    const d1 = rayDirWorld(frameA, match.p1);
    const d2 = rayDirWorld(frameB, match.p2);
    const w0 = vecSub(C1, C2);
    const a = vecDot(d1, d1);
    const b = vecDot(d1, d2);
    const c = vecDot(d2, d2);
    const d = vecDot(d1, w0);
    const e = vecDot(d2, w0);
    const denom = a * c - b * b || 1e-9;
    const s = (b * e - c * d) / denom;
    const t = (a * e - b * d) / denom;
    const X1 = vecAdd(C1, vecScale(d1, s));
    const X2 = vecAdd(C2, vecScale(d2, t));
    const mid = vecScale(vecAdd(X1, X2), 0.5);
    const gap = vecNorm(vecSub(X1, X2));
    twoViewReadout.textContent =
`match index = ${match.index}
ray A origin = [${fmt(C1[0])}, ${fmt(C1[1])}, ${fmt(C1[2])}]
ray B origin = [${fmt(C2[0])}, ${fmt(C2[1])}, ${fmt(C2[2])}]
closest point on ray A = [${fmt(X1[0])}, ${fmt(X1[1])}, ${fmt(X1[2])}]
closest point on ray B = [${fmt(X2[0])}, ${fmt(X2[1])}, ${fmt(X2[2])}]
ray-ray gap = ${fmt(gap, 4)}
interpretation = the two rays are skew, so the yellow segment is the shortest disagreement between them`;

    const viewer = viewers.twoView;
    clearGroup(viewer.root);
    if (state.viewerContext.twoView) addSceneContext(viewer.root, ds, 0.45);
    addCameraFrustum(viewer.root, frameA, 0x7eb8ff, 0.2, (p) => normalizeScenePoint(ds, p), 0.012);
    addCameraFrustum(viewer.root, frameB, 0x7ce0b3, 0.2, (p) => normalizeScenePoint(ds, p), 0.012);
    addPolyline(viewer.root, [C1, X1], 0x7eb8ff, 1, (p) => normalizeScenePoint(ds, p));
    addPolyline(viewer.root, [C2, X2], 0x7ce0b3, 1, (p) => normalizeScenePoint(ds, p));
    addPolyline(viewer.root, [X1, X2], 0xffd166, 1, (p) => normalizeScenePoint(ds, p));
    addPointSphere(viewer.root, mid, 0xff9f43, 0.015, (p) => normalizeScenePoint(ds, p));
    addLabelSprite(viewer.root, 'Camera 1', vecAdd(C1, [0, 0.12 * sceneScaleInfo(ds).radius, 0]), (p) => normalizeScenePoint(ds, p), 0.2);
    addLabelSprite(viewer.root, 'Camera 2', vecAdd(C2, [0, 0.12 * sceneScaleInfo(ds).radius, 0]), (p) => normalizeScenePoint(ds, p), 0.2);
    addLabelSprite(viewer.root, 'Ray 1', vecAdd(C1, vecScale(d1, Math.max(s * 0.45, 0.2))), (p) => normalizeScenePoint(ds, p), 0.18);
    addLabelSprite(viewer.root, 'Ray 2', vecAdd(C2, vecScale(d2, Math.max(t * 0.45, 0.2))), (p) => normalizeScenePoint(ds, p), 0.18);
    addLabelSprite(viewer.root, 'Closest gap', mid, (p) => normalizeScenePoint(ds, p), 0.18);
    setViewerOverlay(viewer, {
      legend: [
        { color: '#7eb8ff', label: 'camera 1 / ray 1' },
        { color: '#7ce0b3', label: 'camera 2 / ray 2' },
        { color: '#ffd166', label: 'shortest gap' },
        { color: '#ff9f43', label: 'closest midpoint' },
      ],
      contextToggle: {
        label: `Scene context: ${state.viewerContext.twoView ? 'on' : 'off'}`,
        active: state.viewerContext.twoView,
        onClick: () => { state.viewerContext.twoView = !state.viewerContext.twoView; redraw(); },
      },
    });
    setOrbitCamera(viewer, ds, `${state.datasetKey}:twoView`);
  }

  function fundamentalFromCurrentEstimator(ds) {
    const est = currentEstimatorPayload();
    const E = est.E;
    const K1inv = invK(ds.pair.image1.K);
    const K2invT = matT(invK(ds.pair.image2.K));
    return matMul(K2invT, matMul(E, K1inv));
  }
  function lineFromPoint(F, uv) {
    return matVec(F, [uv[0], uv[1], 1]);
  }

  function drawEpipolarSection() {
    const ds = currentDataset();
    const { ctx, layout } = drawPairBase(epiCanvas, ds, 'Move here in A', 'Epipolar line in B');
    const algo = currentAlgorithmData();
    const match = ensureSelectedMatch();
    const uv = currentEpipolarPixel(ds, match);
    const F = fundamentalFromCurrentEstimator(ds);
    const line = lineFromPoint(F, uv);
    const seg = imageLineEndpoints(line, ds.pair.image2.width, ds.pair.image2.height);
    const uvDraw = layoutPoint(layout, 'A', uv);
    ctx.strokeStyle = '#7eb8ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(uvDraw[0], uvDraw[1], 6, 0, Math.PI * 2);
    ctx.stroke();
    if (seg) {
      const s0 = layoutPoint(layout, 'B', seg[0]);
      const s1 = layoutPoint(layout, 'B', seg[1]);
      ctx.strokeStyle = '#7ce0b3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s0[0], s0[1]);
      ctx.lineTo(s1[0], s1[1]);
      ctx.stroke();
    }
    let nearest = null;
    if (algo) {
      let best = 1e12;
      for (const m of algo.matches) {
        const dx = m.p1[0] - uv[0];
        const dy = m.p1[1] - uv[1];
        const d = dx * dx + dy * dy;
        if (d < best) { best = d; nearest = m; }
      }
    }
    if (nearest) {
      const np1 = layoutPoint(layout, 'A', nearest.p1);
      const np2 = layoutPoint(layout, 'B', nearest.p2);
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(np1[0], np1[1], 4.5, 0, Math.PI * 2);
      ctx.arc(np2[0], np2[1], 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    epiNarrative.textContent = `The blue viewing ray from camera 1 and the baseline between cameras span one epipolar plane. That plane slices camera 2's image plane into the green epipolar line, so a valid correspondence can only lie on that line.`;
    epiReadout.textContent =
`point in image A = [${fmt(uv[0], 1)}, ${fmt(uv[1], 1)}]
epipolar line in image B = ${fmt(line[0], 5)} x + ${fmt(line[1], 5)} y + ${fmt(line[2], 5)} = 0
selected model = ${currentEstimatorPayload().name}`;

    const viewer = viewers.epi;
    clearGroup(viewer.root);
    const frameA = ds.pair.image1;
    const frameB = ds.pair.image2;
    const C1 = frameA.cameraCenter;
    const C2 = frameB.cameraCenter;
    const ray1 = rayDirWorld(frameA, uv);
    const rayEnd = vecAdd(C1, vecScale(ray1, sceneScaleInfo(ds).radius * 0.9));
    if (state.viewerContext.epi) addSceneContext(viewer.root, ds, 0.35);
    addCameraFrustum(viewer.root, frameA, 0x7eb8ff, 0.2, (p) => normalizeScenePoint(ds, p), 0.012);
    addCameraFrustum(viewer.root, frameB, 0x7ce0b3, 0.2, (p) => normalizeScenePoint(ds, p), 0.012);
    addPolyline(viewer.root, [C1, C2], 0xff7d7d, 0.95, (p) => normalizeScenePoint(ds, p));
    addPolyline(viewer.root, [C1, rayEnd], 0x7eb8ff, 1, (p) => normalizeScenePoint(ds, p));
    const planeU = vecUnit(vecSub(C2, C1));
    const planeNormal = vecUnit(vecCross(planeU, ray1));
    const planeV = vecUnit(vecCross(planeNormal, planeU));
    const planeCenter = vecAdd(C1, vecAdd(vecScale(planeU, vecNorm(vecSub(C2, C1)) * 0.45), vecScale(ray1, sceneScaleInfo(ds).radius * 0.28)));
    const planeW = Math.max(vecNorm(vecSub(C2, C1)) * 0.75, 0.18);
    const planeH = Math.max(sceneScaleInfo(ds).radius * 0.9, 0.28);
    const corners = [
      vecAdd(planeCenter, vecAdd(vecScale(planeU, -planeW), vecScale(planeV, -planeH))),
      vecAdd(planeCenter, vecAdd(vecScale(planeU, planeW), vecScale(planeV, -planeH))),
      vecAdd(planeCenter, vecAdd(vecScale(planeU, planeW), vecScale(planeV, planeH))),
      vecAdd(planeCenter, vecAdd(vecScale(planeU, -planeW), vecScale(planeV, planeH))),
    ].map((p) => normalizeScenePoint(ds, p));
    const planeGeom = new THREE.BufferGeometry();
    planeGeom.setAttribute('position', new THREE.Float32BufferAttribute([
      corners[0][0], corners[0][1], corners[0][2],
      corners[1][0], corners[1][1], corners[1][2],
      corners[2][0], corners[2][1], corners[2][2],
      corners[0][0], corners[0][1], corners[0][2],
      corners[2][0], corners[2][1], corners[2][2],
      corners[3][0], corners[3][1], corners[3][2],
    ], 3));
    viewer.root.add(new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({ color: 0x8f6bff, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })));
    if (seg) {
      const planeDepth = 0.2;
      const l0 = imagePlanePointWorld(frameB, seg[0], planeDepth);
      const l1 = imagePlanePointWorld(frameB, seg[1], planeDepth);
      addPolyline(viewer.root, [l0, l1], 0x7ce0b3, 1, (p) => normalizeScenePoint(ds, p));
    }
    addLabelSprite(viewer.root, 'Camera 1', vecAdd(C1, [0, 0.12 * sceneScaleInfo(ds).radius, 0]), (p) => normalizeScenePoint(ds, p), 0.2);
    addLabelSprite(viewer.root, 'Camera 2', vecAdd(C2, [0, 0.12 * sceneScaleInfo(ds).radius, 0]), (p) => normalizeScenePoint(ds, p), 0.2);
    addLabelSprite(viewer.root, 'Baseline', vecScale(vecAdd(C1, C2), 0.5), (p) => normalizeScenePoint(ds, p), 0.18);
    addLabelSprite(viewer.root, 'Epipolar plane', planeCenter, (p) => normalizeScenePoint(ds, p), 0.19);
    setViewerOverlay(viewer, {
      legend: [
        { color: '#7eb8ff', label: 'selected ray from view A' },
        { color: '#ff7d7d', label: 'camera baseline' },
        { color: '#8f6bff', label: 'epipolar plane' },
        { color: '#7ce0b3', label: 'induced line in view B' },
      ],
      contextToggle: {
        label: `Scene context: ${state.viewerContext.epi ? 'on' : 'off'}`,
        active: state.viewerContext.epi,
        onClick: () => { state.viewerContext.epi = !state.viewerContext.epi; redraw(); },
      },
    });
    setOrbitCamera(viewer, ds, `${state.datasetKey}:epi`);
  }

  function drawMatchSection() {
    const ds = currentDataset();
    const algo = currentAlgorithmData();
    const { ctx, layout } = drawPairBase(matchCanvas, ds, `${state.algorithmKey}: View A`, `${state.algorithmKey}: View B`);
    semanticPills.innerHTML = '';
    if (ds.pair.semanticMatches.length) {
      for (const sm of ds.pair.semanticMatches) {
        const span = document.createElement('span');
        span.className = 'pill';
        span.textContent = sm.label;
        semanticPills.appendChild(span);
      }
    }
    if (!algo) {
      matchNarrative.textContent = `No ${state.algorithmKey} matches are available for this dataset pair.`;
      matchStats.innerHTML = '';
      matchReadout.textContent = 'Matching was skipped because the necessary images were unavailable.';
      return;
    }
    const stage = showInliersOnly.value;
    const list = currentMatchListForDisplay();
    const selected = ensureSelectedMatch();
    for (const kp of algo.keypoints1.slice(0, 240)) {
      const q = layoutPoint(layout, 'A', kp);
      ctx.fillStyle = 'rgba(126, 184, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(q[0], q[1], 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const kp of algo.keypoints2.slice(0, 240)) {
      const q = layoutPoint(layout, 'B', kp);
      ctx.fillStyle = 'rgba(124, 224, 179, 0.22)';
      ctx.beginPath();
      ctx.arc(q[0], q[1], 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (stage !== 'keypoints') {
      for (const m of list) {
        const p1 = layoutPoint(layout, 'A', m.p1);
        const p2 = layoutPoint(layout, 'B', m.p2);
        const col = m.inlier5 ? 'rgba(124, 224, 179, 0.65)' : m.inlier8 ? 'rgba(126, 184, 255, 0.65)' : 'rgba(255, 125, 125, 0.38)';
        ctx.strokeStyle = col;
        ctx.lineWidth = selected && m.index === selected.index ? 2.2 : 1.0;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
    }
    if (selected) {
      const p1 = layoutPoint(layout, 'A', selected.p1);
      const p2 = layoutPoint(layout, 'B', selected.p2);
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(p1[0], p1[1], 5, 0, Math.PI * 2);
      ctx.arc(p2[0], p2[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }
    matchStats.innerHTML = '';
    const stats = [
      ['Detected A', algo.stats.detected1],
      ['Detected B', algo.stats.detected2],
      ['KNN pairs', algo.stats.knnPairs],
      ['Ratio kept', algo.stats.ratioAccepted],
      ['Capped matches', algo.stats.matchCount],
      ['5-point inliers', algo.stats.inliers5],
      ['8-point inliers', algo.stats.inliers8],
    ];
    for (const [k, v] of stats) {
      const div = document.createElement('div');
      div.className = 'stat';
      div.innerHTML = `<div class="k">${k}</div><div class="v">${v}</div>`;
      matchStats.appendChild(div);
    }
    matchNarrative.textContent = `${state.algorithmKey} now exposes the full pipeline: detect keypoints, build KNN descriptor pairs, keep matches that pass Lowe's ratio test (${fmt(algo.stats.ratioThreshold, 2)}), then verify them geometrically with 5-point or 8-point RANSAC. The canvas is currently showing ${currentMatchStageLabel()}.`;
    if (selected) {
      matchReadout.textContent =
`selected match index = ${selected.index}
current stage = ${currentMatchStageLabel()}
p1 = [${fmt(selected.p1[0], 1)}, ${fmt(selected.p1[1], 1)}]
p2 = [${fmt(selected.p2[0], 1)}, ${fmt(selected.p2[1], 1)}]
5-point inlier = ${selected.inlier5}
8-point inlier = ${selected.inlier8}
reference residual = ${fmt(selected.errRef, 6)}
5-point residual = ${selected.err5 == null ? 'n/a' : fmt(selected.err5, 6)}
8-point residual = ${selected.err8 == null ? 'n/a' : fmt(selected.err8, 6)}`;
    }
  }

  function drawEssentialSection() {
    const ds = currentDataset();
    const est = currentEstimatorPayload();
    const E = est.E;
    const F = fundamentalFromCurrentEstimator(ds);
    matrixGrid.innerHTML = '';
    for (const row of E) {
      for (const value of row) {
        const d = document.createElement('div');
        d.textContent = fmt(value, 4);
        matrixGrid.appendChild(d);
      }
    }
    const match = ensureSelectedMatch();
    if (!match) {
      essentialNarrative.textContent = 'An essential matrix becomes meaningful once there is at least one correspondence to test against it.';
      essentialReadout.textContent = 'No match available.';
      return;
    }
    const uv = currentEpipolarPixel(ds, match);
    const { ctx, layout } = drawPairBase(essentialCanvas, ds, 'x1 in view A', 'l2 = F x1 in view B');
    const linePx = lineFromPoint(F, uv);
    const seg = imageLineEndpoints(linePx, ds.pair.image2.width, ds.pair.image2.height);
    const uvDraw = layoutPoint(layout, 'A', uv);
    ctx.strokeStyle = '#7eb8ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(uvDraw[0], uvDraw[1], 6, 0, Math.PI * 2);
    ctx.stroke();
    if (seg) {
      const s0 = layoutPoint(layout, 'B', seg[0]);
      const s1 = layoutPoint(layout, 'B', seg[1]);
      ctx.strokeStyle = '#7ce0b3';
      ctx.beginPath();
      ctx.moveTo(s0[0], s0[1]);
      ctx.lineTo(s1[0], s1[1]);
      ctx.stroke();
    }
    const matchP2 = layoutPoint(layout, 'B', match.p2);
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(matchP2[0], matchP2[1], 4.5, 0, Math.PI * 2);
    ctx.fill();
    const x1 = [...match.x1n, 1];
    const x2 = [...match.x2n, 1];
    const Ex1 = matVec(E, x1);
    const scalar = x2[0] * Ex1[0] + x2[1] * Ex1[1] + x2[2] * Ex1[2];
    essentialNarrative.textContent = `This section uses the ${est.name} matrix as an interaction surface: choose a point in view A, map it to the line l₂ = F x₁ in view B, and compare the selected correspondence's residual x₂ᵀ E x₁ against zero.`;
    essentialReadout.textContent =
`x1 normalized = [${fmt(x1[0], 4)}, ${fmt(x1[1], 4)}, 1]
x2 normalized = [${fmt(x2[0], 4)}, ${fmt(x2[1], 4)}, 1]
E x1 = [${fmt(Ex1[0], 5)}, ${fmt(Ex1[1], 5)}, ${fmt(Ex1[2], 5)}]
x2^T E x1 = ${fmt(scalar, 8)}`;
  }

  function drawSampleSection() {
    const ds = currentDataset();
    const algo = currentAlgorithmData();
    const { ctx, layout } = drawPairBase(sampleCanvas, ds, '8-point sample', '5-point sample');
    if (!algo) {
      sampleStats.innerHTML = '';
      sampleNarrative.textContent = 'Solver comparison needs an available set of feature matches.';
      sampleReadout.textContent = 'Sampling needs an available set of feature matches.';
      return;
    }
    const mapByIdx = new Map(algo.matches.map(m => [m.index, m]));
    for (const idx of state.sample8) {
      const m = mapByIdx.get(idx);
      if (!m) continue;
      const p1 = layoutPoint(layout, 'A', m.p1);
      const p2 = layoutPoint(layout, 'B', m.p2);
      ctx.strokeStyle = 'rgba(126, 184, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }
    for (const idx of state.sample5) {
      const m = mapByIdx.get(idx);
      if (!m) continue;
      const p1 = layoutPoint(layout, 'A', m.p1);
      const p2 = layoutPoint(layout, 'B', m.p2);
      ctx.fillStyle = 'rgba(124, 224, 179, 0.95)';
      ctx.beginPath();
      ctx.arc(p1[0], p1[1], 4.2, 0, Math.PI * 2);
      ctx.arc(p2[0], p2[1], 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
    sampleStats.innerHTML = '';
    const sampleCards = [
      ['8-point', '8 correspondences'],
      ['Unknowns', '9 matrix entries, solved linearly then rank-2 enforced'],
      ['5-point', '5 correspondences'],
      ['Output', 'one or more E candidates, later filtered by cheirality'],
    ];
    for (const [k, v] of sampleCards) {
      const div = document.createElement('div');
      div.className = 'stat';
      div.innerHTML = `<div class="k">${k}</div><div class="v">${v}</div>`;
      sampleStats.appendChild(div);
    }
    sampleNarrative.textContent = 'Blue links show the 8-point sample that supports a linear least-squares estimate of E. Green dots show the 5-point minimal sample: it needs fewer correspondences, but the solver is algebraically harder and can return multiple candidate essential matrices before pose disambiguation.';
    sampleReadout.textContent =
`8-point sample indices = [${state.sample8.join(', ')}]
5-point sample indices = [${state.sample5.join(', ')}]
8-point idea = assemble A e = 0, solve linearly, then project back to rank 2.
5-point idea = impose calibrated essential-matrix constraints on only 5 matches, then test candidate solutions in RANSAC.`;
  }

  function drawRansacSection() {
    const algo = currentAlgorithmData();
    if (!algo || !algo.eightPoint || !algo.eightPoint.available || !algo.eightPoint.steps.length) {
      ransacNarrative.textContent = 'RANSAC playback is available when the 8-point pipeline produced a valid hypothesis trace.';
      ransacReadout.textContent = 'No 8-point RANSAC trace available.';
      const ctx0 = setCanvasSize(ransacCanvas, 320, 240);
      ctx0.clearRect(0, 0, 320, 240);
      const ctx1 = setCanvasSize(ransacChart, 320, 180);
      ctx1.clearRect(0, 0, 320, 180);
      return;
    }
    const steps = algo.eightPoint.steps;
    ransacIter.max = String(Math.max(0, steps.length - 1));
    const step = steps[state.ransacStep] || steps[0];
    const ds = currentDataset();
    const { ctx, layout } = drawPairBase(ransacCanvas, ds, 'Current random sample', 'Current random sample');
    for (const m of algo.matches.slice(0, Number(matchLimit.value))) {
      const p1 = layoutPoint(layout, 'A', m.p1);
      const p2 = layoutPoint(layout, 'B', m.p2);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }
    const picked = new Set(step.sample || []);
    const matchMap = new Map(algo.matches.map(m => [m.index, m]));
    for (const idx of picked) {
      const m = matchMap.get(idx);
      if (!m) continue;
      const p1 = layoutPoint(layout, 'A', m.p1);
      const p2 = layoutPoint(layout, 'B', m.p2);
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }
    const chartWidth = Math.max((ransacChart.parentElement?.clientWidth || 640) - 24, 320);
    const chartHeight = 180;
    const chart = setCanvasSize(ransacChart, chartWidth, chartHeight);
    chart.clearRect(0, 0, chartWidth, chartHeight);
    chart.fillStyle = '#0c1017';
    chart.fillRect(0, 0, chartWidth, chartHeight);
    const maxScore = Math.max(...steps.map(s => s.bestInliers || 0), 1);
    const barW = chartWidth / Math.max(steps.length, 1);
    steps.forEach((s, i) => {
      const h = (s.inliers || 0) / maxScore * 130;
      chart.fillStyle = i === state.ransacStep ? '#ffd166' : (s.isBest ? '#7ce0b3' : '#5e7fb0');
      chart.fillRect(i * barW, chartHeight - 20 - h, Math.max(1, barW - 1), h);
    });
    chart.fillStyle = '#a7b4cb';
    chart.font = '12px Segoe UI';
    chart.fillText('Inlier count per RANSAC iteration', 10, 18);
    ransacNarrative.textContent = `Each bar is one random 8-point hypothesis. Yellow marks the current iteration, green marks best-so-far improvements, and playback now stops at the last hypothesis unless loop mode is enabled.`;
    ransacReadout.textContent =
`iteration = ${state.ransacStep}
sample indices = [${(step.sample || []).join(', ')}]
current inliers = ${step.inliers}
best inliers so far = ${step.bestInliers}
8-point threshold = ${fmt(algo.eightPoint.threshold, 8)}
loop mode = ${state.ransacLoop ? 'on' : 'off'}`;
  }

  function drawPoseSection() {
    const algo = currentAlgorithmData();
    candidateGrid.innerHTML = '';
    if (!algo || !algo.poseRecovery || !algo.poseRecovery.available) {
      poseReadout.textContent = 'Pose recovery is not available for the current algorithm and dataset.';
      const viewer = viewers.pose;
      clearGroup(viewer.root);
      setViewerOverlay(viewer, {
        legend: [
          { color: '#7eb8ff', label: 'camera 1' },
          { color: '#7ce0b3', label: 'candidate camera 2' },
          { color: '#ffd166', label: 'triangulated points' },
        ],
      });
      setCanonicalCamera(viewer, { radius: 1.4, center: [0, 0, 0] }, `${state.datasetKey}:pose-empty`);
      return;
    }
    const payload = algo.poseRecovery;
    const bestIndex = payload.bestIndex ?? 0;
    if (state.candidateIndex >= payload.candidates.length) state.candidateIndex = bestIndex;
    payload.candidates.forEach((cand, i) => {
      const div = document.createElement('button');
      div.className = `candidate${state.candidateIndex === i ? ' on' : ''}`;
      div.innerHTML = `<strong>Candidate ${i + 1}</strong><br/><span class="mini">cheirality: ${cand.cheiralityCount}</span>`;
      div.onclick = () => { state.candidateIndex = i; redraw(); };
      candidateGrid.appendChild(div);
    });
    const cand = payload.candidates[state.candidateIndex];
    poseReadout.textContent =
`selected candidate = ${state.candidateIndex + 1}
cheirality count = ${cand.cheiralityCount}
best candidate = ${bestIndex + 1}
rotation error vs reference = ${payload.rotationErrorDeg == null ? 'n/a' : fmt(payload.rotationErrorDeg, 3) + ' deg'}
translation angle vs reference = ${payload.translationAngleDeg == null ? 'n/a' : fmt(payload.translationAngleDeg, 3) + ' deg'}
t direction = [${fmt(cand.t[0])}, ${fmt(cand.t[1])}, ${fmt(cand.t[2])}]`;
    const viewer = viewers.pose;
    clearGroup(viewer.root);
    const posePts = [[0, 0, 0], cand.cameraCenter2, ...(cand.points3D || [])];
    const pb = canonicalBounds(posePts);
    addDebugHelpers(viewer.root, {
      min: normalizePointWithBounds(pb, pb.min),
      max: normalizePointWithBounds(pb, pb.max),
      radius: 1,
      diameter: pb.diameter / pb.radius,
    });
    if (state.viewerContext.pose) addMetricReference(viewer.root, 2.2);
    addCameraFrustum(viewer.root, { ...currentDataset().pair.image1, cameraCenter: [0, 0, 0], R_w2c: [[1,0,0],[0,1,0],[0,0,1]], t_w2c: [0,0,0] }, 0x7eb8ff, 0.14, (p) => normalizePointWithBounds(pb, p), 0.011);
    addCameraFrustum(viewer.root, { ...currentDataset().pair.image2, cameraCenter: cand.cameraCenter2, R_w2c: cand.R, t_w2c: cand.t }, state.candidateIndex === bestIndex ? 0x7ce0b3 : 0xffb866, 0.14, (p) => normalizePointWithBounds(pb, p), 0.011);
    addPointCloud(viewer.root, cand.points3D || [], 0xffd166, 3.5, (p) => normalizePointWithBounds(pb, p));
    addLabelSprite(viewer.root, 'Camera 1', [0, 0.15 * pb.radius, 0], (p) => normalizePointWithBounds(pb, p), 0.2);
    addLabelSprite(viewer.root, 'Camera 2', vecAdd(cand.cameraCenter2, [0, 0.15 * pb.radius, 0]), (p) => normalizePointWithBounds(pb, p), 0.2);
    addLabelSprite(viewer.root, 'Recovered points', vecScale(vecAdd([0, 0, 0], cand.cameraCenter2), 0.5), (p) => normalizePointWithBounds(pb, p), 0.18);
    setViewerOverlay(viewer, {
      legend: [
        { color: '#7eb8ff', label: 'camera 1' },
        { color: state.candidateIndex === bestIndex ? '#7ce0b3' : '#ffb866', label: 'candidate camera 2' },
        { color: '#ffd166', label: 'triangulated points' },
      ],
      contextToggle: {
        label: `Scene context: ${state.viewerContext.pose ? 'on' : 'off'}`,
        active: state.viewerContext.pose,
        onClick: () => { state.viewerContext.pose = !state.viewerContext.pose; redraw(); },
      },
    });
    setCanonicalCamera(viewer, { radius: 1, center: [0, 0, 0] }, `${state.datasetKey}:pose`);
    maybeLogDebug('pose', { dataset: state.datasetKey, candidate: state.candidateIndex, poseBounds: pb, cheirality: cand.cheiralityCount });
  }

  function redraw() {
    debugScaleBtn.textContent = `Debug scale: ${state.debugScale ? 'on' : 'off'}`;
    debugScaleBtn.classList.toggle('on', state.debugScale);
    ransacPlayBtn.textContent = state.ransacPlaying ? 'Pause' : 'Play';
    ransacLoopBtn.textContent = `Loop: ${state.ransacLoop ? 'on' : 'off'}`;
    ransacLoopBtn.classList.toggle('on', state.ransacLoop);
    syncMeta();
    drawPixelSection();
    drawScaleSection();
    drawTwoViewSection();
    drawEpipolarSection();
    drawMatchSection();
    drawEssentialSection();
    drawSampleSection();
    drawRansacSection();
    drawPoseSection();
  }

  datasetSel.addEventListener('change', () => {
    state.datasetKey = datasetSel.value;
    state.lockedPixel = null;
    state.hoverPixel = null;
    state.selectedMatchIndex = 0;
    state.ransacStep = 0;
    state.candidateIndex = 0;
    resampleSubsets();
    redraw();
  });
  algoSel.addEventListener('change', () => {
    state.algorithmKey = algoSel.value;
    state.selectedMatchIndex = 0;
    state.candidateIndex = 0;
    resampleSubsets();
    redraw();
  });
  estimatorSel.addEventListener('change', () => {
    state.estimatorKey = estimatorSel.value;
    redraw();
  });
  matchLimit.addEventListener('input', redraw);
  showInliersOnly.addEventListener('change', redraw);
  rayDepth.addEventListener('input', redraw);
  scaleSlider.addEventListener('input', redraw);
  ransacIter.addEventListener('input', () => {
    state.ransacStep = Number(ransacIter.value);
    redraw();
  });
  sample8Btn.addEventListener('click', () => { resampleSubsets(); redraw(); });
  sample5Btn.addEventListener('click', () => { resampleSubsets(); redraw(); });
  debugScaleBtn.addEventListener('click', () => {
    state.debugScale = !state.debugScale;
    redraw();
  });
  ransacPlayBtn.addEventListener('click', () => {
    state.ransacPlaying = !state.ransacPlaying;
    if (state.ransacPlaying) state.lastRansacAdvance = performance.now();
  });
  ransacLoopBtn.addEventListener('click', () => {
    state.ransacLoop = !state.ransacLoop;
    ransacLoopBtn.textContent = `Loop: ${state.ransacLoop ? 'on' : 'off'}`;
    ransacLoopBtn.classList.toggle('on', state.ransacLoop);
  });
  matchCanvas.addEventListener('click', (ev) => {
    const ds = currentDataset();
    const algo = currentAlgorithmData();
    if (!algo) return;
    const rect = matchCanvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (matchCanvas.width / rect.width) / (window.devicePixelRatio || 1);
    const y = (ev.clientY - rect.top) * (matchCanvas.height / rect.height) / (window.devicePixelRatio || 1);
    const layout = matchCanvas._layout || pairCanvasLayout(ds);
    let best = { idx: 0, d: 1e12 };
    for (const m of algo.matches) {
      const pts = [layoutPoint(layout, 'A', m.p1), layoutPoint(layout, 'B', m.p2)];
      for (const p of pts) {
        const d = (p[0] - x) ** 2 + (p[1] - y) ** 2;
        if (d < best.d) best = { idx: m.index, d };
      }
    }
    state.selectedMatchIndex = best.idx;
    redraw();
  });
  pixelCanvas.addEventListener('click', (ev) => {
    const rect = pixelCanvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (pixelCanvas.width / rect.width) / (window.devicePixelRatio || 1);
    const y = (ev.clientY - rect.top) * (pixelCanvas.height / rect.height) / (window.devicePixelRatio || 1);
    state.lockedPixel = [x, y];
    redraw();
  });
  epiCanvas.addEventListener('mousemove', (ev) => {
    const rect = epiCanvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (epiCanvas.width / rect.width) / (window.devicePixelRatio || 1);
    const y = (ev.clientY - rect.top) * (epiCanvas.height / rect.height) / (window.devicePixelRatio || 1);
    const layout = epiCanvas._layout;
    if (layout && pointInsideLayoutImage(layout, 'A', x, y)) {
      state.hoverPixel = layoutToImagePoint(layout, 'A', x, y);
      drawEpipolarSection();
    }
  });
  epiCanvas.addEventListener('mouseleave', () => {
    state.hoverPixel = null;
    drawEpipolarSection();
  });
  epiCanvas.addEventListener('click', (ev) => {
    const rect = epiCanvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (epiCanvas.width / rect.width) / (window.devicePixelRatio || 1);
    const y = (ev.clientY - rect.top) * (epiCanvas.height / rect.height) / (window.devicePixelRatio || 1);
    const layout = epiCanvas._layout;
    if (layout && pointInsideLayoutImage(layout, 'A', x, y)) {
      state.lockedPixel = layoutToImagePoint(layout, 'A', x, y);
      redraw();
    }
  });

  function animate(now) {
    if (state.ransacPlaying) {
      const algo = currentAlgorithmData();
      if (algo && algo.eightPoint && algo.eightPoint.available && algo.eightPoint.steps.length && now - state.lastRansacAdvance >= 280) {
        const lastStep = algo.eightPoint.steps.length - 1;
        if (state.ransacStep >= lastStep) {
          if (state.ransacLoop) {
            state.ransacStep = 0;
          } else {
            state.ransacPlaying = false;
          }
        } else {
          state.ransacStep += 1;
        }
        state.lastRansacAdvance = now;
        ransacIter.value = String(state.ransacStep);
        drawRansacSection();
      }
    }
    for (const viewer of viewerList) {
      if (!viewer.isVisible) continue;
      viewer.controls.update();
      viewer.renderer.render(viewer.scene, viewer.camera);
    }
    requestAnimationFrame(animate);
  }

  await loadImages();
  resampleSubsets();
  redraw();
  requestAnimationFrame(animate);
  </script>
</body>
</html>
"""


def build_payload() -> dict[str, Any]:
    payload = {
        "generatedBy": "build_multiview_geometry_lab.py",
        "datasets": {
            "rubiks_orbit_v1": build_rubik_dataset(REPO_ROOT / "datasets" / "rubiks_orbit_v1"),
            "meadow": build_eth_dataset(REPO_ROOT / "meadow_dslr_undistorted" / "meadow", "meadow"),
            "office": build_eth_dataset(REPO_ROOT / "office_dslr_undistorted" / "office", "office"),
            "pipes": build_eth_dataset(REPO_ROOT / "pipes_dslr_undistorted" / "pipes", "pipes"),
        },
    }
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a self-contained multi-view geometry HTML lab.")
    parser.add_argument("--out", type=Path, default=OUT_HTML, help="Output HTML path")
    args = parser.parse_args()

    payload = build_payload()
    html = HTML_TEMPLATE.replace("__PAYLOAD__", json.dumps(payload, separators=(",", ":")))
    out_path = args.out.resolve()
    out_path.write_text(html, encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
