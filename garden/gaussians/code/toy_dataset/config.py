from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

import numpy as np


@dataclass(frozen=True)
class OrbitV1:
    """Frozen capture design: 3 elevation rings × 36 azimuth samples."""

    elevations_deg: Tuple[float, float, float] = (45.0, 0.0, -45.0)
    azimuths_deg: Tuple[float, ...] = tuple(float(i * 10) for i in range(36))
    orbit_radius: float = 3.0
    cube_half_extent: float = 0.5
    image_size: Tuple[int, int] = (512, 512)
    yfov_deg: float = 50.0
    background_rgb: Tuple[float, float, float] = (0.15, 0.15, 0.18)
    seed: int = 0

    @property
    def frame_count(self) -> int:
        return len(self.elevations_deg) * len(self.azimuths_deg)


def cube_corner_positions(half_extent: float = 0.5) -> np.ndarray:
    """Eight corners of an axis-aligned box centered at the origin."""
    h = float(half_extent)
    corners = np.array(
        [
            [-h, -h, -h],
            [+h, -h, -h],
            [+h, +h, -h],
            [-h, +h, -h],
            [-h, -h, +h],
            [+h, -h, +h],
            [+h, +h, +h],
            [-h, +h, +h],
        ],
        dtype=np.float64,
    )
    return corners


def spherical_to_cartesian(azimuth_deg: float, elevation_deg: float, radius: float) -> np.ndarray:
    """
    Camera position on a sphere looking at the origin.

    Convention (right-handed, +Y up):
    - azimuth: angle in the XZ plane, measured from +X toward +Z (degrees).
    - elevation: angle above the XZ plane toward +Y (degrees).
    """
    az = np.deg2rad(azimuth_deg)
    el = np.deg2rad(elevation_deg)
    r = float(radius)
    x = r * np.cos(el) * np.cos(az)
    y = r * np.sin(el)
    z = r * np.cos(el) * np.sin(az)
    return np.array([x, y, z], dtype=np.float64)
