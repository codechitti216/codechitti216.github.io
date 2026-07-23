#!/usr/bin/env python
"""Delegate to toy_dataset.build_epipolar_lab (single source of truth)."""
from __future__ import annotations

import sys
from pathlib import Path

_REPO = Path(__file__).resolve().parents[1]
if str(_REPO) not in sys.path:
    sys.path.insert(0, str(_REPO))

from toy_dataset.build_epipolar_lab import main

if __name__ == "__main__":
    raise SystemExit(main())
