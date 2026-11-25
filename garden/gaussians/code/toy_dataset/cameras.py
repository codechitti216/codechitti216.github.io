from __future__ import annotations

import numpy as np


def look_at_world_to_camera_opencv(
    eye_world: np.ndarray,
    target_world: np.ndarray,
    up_world: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """
    OpenCV camera frame: +X right, +Y down, +Z forward (into the scene).

    Returns (R_w2c, t_w2c) with P_c = R_w2c @ P_w + t_w2c (column vectors).
    """
    eye = np.asarray(eye_world, dtype=np.float64).reshape(3)
    target = np.asarray(target_world, dtype=np.float64).reshape(3)
    up = np.asarray(up_world if up_world is not None else [0.0, 1.0, 0.0], dtype=np.float64).reshape(3)

    z_axis = target - eye
    zn = np.linalg.norm(z_axis)
    if zn < 1e-12:
        raise ValueError("eye and target are too close")
    z_axis = z_axis / zn

    x_axis = np.cross(z_axis, up)
    xn = np.linalg.norm(x_axis)
    if xn < 1e-8:
        up = np.array([0.0, 0.0, 1.0], dtype=np.float64)
        x_axis = np.cross(z_axis, up)
        xn = np.linalg.norm(x_axis)
    x_axis = x_axis / xn

    y_axis = np.cross(z_axis, x_axis)

    R_w2c = np.stack([x_axis, y_axis, z_axis], axis=0)
    t_w2c = (-R_w2c @ eye).reshape(3)
    return R_w2c, t_w2c


def intrinsics_from_yfov(width: int, height: int, yfov_deg: float) -> np.ndarray:
    """Pinhole K for OpenCV projection (fx, fy, cx, cy). yfov is full vertical FOV in degrees."""
    fy = (0.5 * height) / np.tan(0.5 * np.deg2rad(float(yfov_deg)))
    fx = fy
    cx = (width - 1) * 0.5
    cy = (height - 1) * 0.5
    K = np.array([[fx, 0.0, cx], [0.0, fy, cy], [0.0, 0.0, 1.0]], dtype=np.float64)
    return K


def project_points_opencv(
    points_world: np.ndarray,
    R_w2c: np.ndarray,
    t_w2c: np.ndarray,
    K: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Project Nx3 world points to pixel coordinates.

    Returns (uv, z_cam) where uv is Nx2 and z_cam is N (positive = in front).
    """
    Pw = np.asarray(points_world, dtype=np.float64).reshape(-1, 3).T
    Pc = (R_w2c @ Pw) + t_w2c.reshape(3, 1)
    z = Pc[2, :]
    eps = 1e-9
    x = Pc[0, :] / (z + eps)
    y = Pc[1, :] / (z + eps)
    fx, fy = float(K[0, 0]), float(K[1, 1])
    cx, cy = float(K[0, 2]), float(K[1, 2])
    u = fx * x + cx
    v = fy * y + cy
    uv = np.stack([u, v], axis=1)
    return uv, z


def world_to_camera_gl_from_opencv(R_w2c: np.ndarray, t_w2c: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Convert OpenCV world->camera rigid transform to an OpenGL-style world->camera map:

        P_gl = S @ P_cv,  S = diag(1, -1, -1)

    Used to feed pyrender (OpenGL camera coordinates).
    """
    S = np.diag([1.0, -1.0, -1.0]).astype(np.float64)
    R_gl = S @ R_w2c
    t_gl = (S @ t_w2c.reshape(3)).reshape(3)
    return R_gl, t_gl


def se3_inverse(R: np.ndarray, t: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    Rt = R.T
    return Rt, (-Rt @ t.reshape(3)).reshape(3)


def camera_to_world_gl(eye_world: np.ndarray, target_world: np.ndarray, up_world: np.ndarray | None = None) -> np.ndarray:
    """
    OpenGL camera convention used by pyrender: camera +X right, +Y up, -Z forward (into scene).

    Returns 4x4 mapping homogeneous camera coordinates -> homogeneous world coordinates.
    """
    eye = np.asarray(eye_world, dtype=np.float64).reshape(3)
    target = np.asarray(target_world, dtype=np.float64).reshape(3)
    up = np.asarray(up_world if up_world is not None else [0.0, 1.0, 0.0], dtype=np.float64).reshape(3)

    forward = target - eye
    fn = np.linalg.norm(forward)
    if fn < 1e-12:
        raise ValueError("eye and target are too close")
    forward = forward / fn

    z_cam_w = -forward
    x_cam_w = np.cross(up, z_cam_w)
    xn = np.linalg.norm(x_cam_w)
    if xn < 1e-8:
        up = np.array([0.0, 0.0, 1.0], dtype=np.float64)
        x_cam_w = np.cross(up, z_cam_w)
        xn = np.linalg.norm(x_cam_w)
    x_cam_w = x_cam_w / xn

    y_cam_w = np.cross(z_cam_w, x_cam_w)

    R_c2w = np.stack([x_cam_w, y_cam_w, z_cam_w], axis=1)
    T = np.eye(4, dtype=np.float64)
    T[:3, :3] = R_c2w
    T[:3, 3] = eye
    return T


def opencv_from_camera_to_world_gl(T_c2w_gl: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Derive OpenCV world->camera (R_w2c, t_w2c) from an OpenGL-style camera-to-world transform.

    Coordinate map: P_gl = S @ P_cv with S = diag(1,-1,-1).
    """
    R_c2w = T_c2w_gl[:3, :3].astype(np.float64)
    eye = T_c2w_gl[:3, 3].astype(np.float64).reshape(3)
    S = np.diag([1.0, -1.0, -1.0])

    R_w2c = S @ R_c2w.T
    t_w2c = (-R_w2c @ eye.reshape(3)).reshape(3)
    return R_w2c, t_w2c


def camera_to_world_from_w2c(R_w2c: np.ndarray, t_w2c: np.ndarray) -> np.ndarray:
    """4x4 matrix mapping homogeneous camera coords -> homogeneous world coords (OpenGL-style columns)."""
    R_c2w, t_c2w = se3_inverse(R_w2c, t_w2c)
    T = np.eye(4, dtype=np.float64)
    T[:3, :3] = R_c2w
    T[:3, 3] = t_c2w
    return T
