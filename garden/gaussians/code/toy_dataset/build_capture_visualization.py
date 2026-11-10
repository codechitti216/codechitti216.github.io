from __future__ import annotations

import argparse
import base64
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))


def frustum_corners_world(
    R_w2c: list[list[float]],
    t_w2c: list[float],
    K: list[list[float]],
    width: int,
    height: int,
    z_near: float,
    z_far: float,
) -> list[list[float]]:
    """Eight world points: four near plane, four far plane (OpenCV cam, world +Y up)."""
    R = np.asarray(R_w2c, dtype=np.float64)
    t = np.asarray(t_w2c, dtype=np.float64).reshape(3)
    Rt = R.T
    fx = float(K[0][0])
    fy = float(K[1][1])
    cx = float(K[0][2])
    cy = float(K[1][2])
    w, h = int(width), int(height)
    uv = [(0, 0), (w - 1, 0), (w - 1, h - 1), (0, h - 1)]

    def cam_to_world(Pc: np.ndarray) -> list[float]:
        return (Rt @ (Pc - t)).tolist()

    out: list[list[float]] = []
    for z in (z_near, z_far):
        for u, v in uv:
            Pc = np.array([(u - cx) / fx * z, (v - cy) / fy * z, z], dtype=np.float64)
            out.append(cam_to_world(Pc))
    return out


def _rubik_cube_payload(cube_half: float, seed: int = 0) -> dict:
    """Same textured cube as the dataset generator (seed must match OrbitV1.seed)."""
    from toy_dataset.rubiks_mesh import make_rubiks_colored_box

    rng = np.random.default_rng(seed)
    mesh = make_rubiks_colored_box(half_extent=float(cube_half), rng=rng)
    pil = mesh.visual.material.image
    buf = io.BytesIO()
    pil.save(buf, format="PNG", optimize=True)
    b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
    return {
        "atlasPng": f"data:image/png;base64,{b64}",
        "positions": np.asarray(mesh.vertices, dtype=np.float64).reshape(-1).tolist(),
        "uvs": np.asarray(mesh.visual.uv, dtype=np.float64).reshape(-1).tolist(),
        "indices": np.asarray(mesh.faces, dtype=np.int32).reshape(-1).tolist(),
    }


def _thumb_data_uri(image_path: Path, size: int = 144, quality: int = 82) -> str:
    im = Image.open(image_path).convert("RGB")
    im.thumbnail((size, size), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=quality, optimize=True)
    b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>rubiks_orbit_v1 — capture</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; background: #1a1d24;
      font-family: system-ui, sans-serif; color: #ddd; }
    #wrap { width: 100%; height: 100%; position: relative; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; left: 10px; top: 10px; padding: 10px 12px;
      background: rgba(0,0,0,0.55); border-radius: 8px; font-size: 13px; line-height: 1.5;
      pointer-events: none; max-width: 90vw;
    }
    #hud strong { color: #fff; }
    #leg { margin-top: 8px; font-size: 12px; color: #7a8494; line-height: 1.45; }
    #tip {
      position: absolute; right: 10px; top: 10px; width: 200px; padding: 8px;
      background: rgba(0,0,0,0.7); border-radius: 8px; display: none;
    }
    #tip.on { display: block; }
    #tip img { width: 100%; border-radius: 4px; display: block; }
    #tip .n { font-weight: 600; margin-top: 6px; font-size: 13px; }
    #tip .m { font-size: 11px; color: #999; margin-top: 2px; }
    #siblingLinks {
      position: absolute; left: 10px; bottom: 10px; padding: 8px 10px;
      background: rgba(0,0,0,0.55); border-radius: 8px; font-size: 12px;
      pointer-events: auto; z-index: 2;
    }
    #siblingLinks a { color: #7eb8ff; text-decoration: none; margin: 0 6px; }
    #siblingLinks a:hover { text-decoration: underline; }
    #siblingLinks span { color: #5c6570; margin-right: 8px; }
  </style>
</head>
<body>
  <div id="wrap">
    <canvas id="c"></canvas>
    <div id="hud">
      <strong>rubiks_orbit_v1</strong><br/>
      Scene cube + pinhole frusta · <span style="color:#c8ced9">●</span> tiny marks = optical center (pinhole). Drag · zoom · hover mark or frustum for that view.<br/>
      <span style="font-size:11px;color:#5c6570">Three.js loads from jsDelivr (internet once).</span>
      <div id="leg"></div>
    </div>
    <div id="tip">
      <img id="ti" alt="" />
      <div class="n" id="tn"></div>
      <div class="m" id="tm"></div>
    </div>
    <div id="siblingLinks" aria-label="Dataset tools">
      <span>Also:</span>
      <a href="geometry_lab.html">geometry_lab</a>
      <a href="epipolar_lab.html">epipolar</a>
    </div>
  </div>
  <script type="application/json" id="viz-data">__PAYLOAD__</script>
  <script type="importmap">
  { "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }}
  </script>
  <script type="module">
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

  const D = JSON.parse(document.getElementById('viz-data').textContent);
  const leg = document.getElementById('leg');
  if (D.summary) leg.textContent = D.summary;

  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x1a1d24, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  cam.position.set(8.5, 6.5, 10.5);

  const ctrl = new OrbitControls(cam, canvas);
  ctrl.enableDamping = true;
  ctrl.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(6, 12, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xaaccff, 0.35);
  fill.position.set(-8, 4, -6);
  scene.add(fill);

  if (D.rubik) {
    const tex = new THREE.TextureLoader().load(D.rubik.atlasPng);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());

    const cg = new THREE.BufferGeometry();
    cg.setAttribute('position', new THREE.Float32BufferAttribute(D.rubik.positions, 3));
    cg.setAttribute('uv', new THREE.Float32BufferAttribute(D.rubik.uvs, 2));
    cg.setIndex(D.rubik.indices);
    cg.computeVertexNormals();

    const rubik = new THREE.Mesh(
      cg,
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.42,
        metalness: 0.06,
      }),
    );
    rubik.frustumCulled = false;
    scene.add(rubik);
  } else {
    const h = D.cubeHalf;
    const boxE = new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * h, 2 * h, 2 * h));
    const boxL = new THREE.LineSegments(boxE, new THREE.LineBasicMaterial({ color: 0xffffff }));
    boxL.frustumCulled = false;
    scene.add(boxL);
  }

  function frustumGeo(c) {
    const pos = new Float32Array(24);
    for (let i = 0; i < 8; i++) {
      pos[i * 3] = c[i][0]; pos[i * 3 + 1] = c[i][1]; pos[i * 3 + 2] = c[i][2];
    }
    const idx = new Uint16Array([
      0,1,2, 0,2,3, 4,6,5, 4,7,6,
      0,4,5, 0,5,1, 1,5,6, 1,6,2, 2,6,7, 2,7,3, 3,7,4, 3,4,0
    ]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  }

  const pick = [];
  const frustumColor = 0x8e97a8;
  const markerColor = 0xc8ced9;
  const markerRadius = 0.072;
  if (!Array.isArray(D.frames) || D.frames.length === 0) {
    leg.textContent = (D.summary || '') + ' — no frame data.';
  }
  D.frames.forEach((fr) => {
    const g = frustumGeo(fr.frustum);
    const shell = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      color: frustumColor,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
    }));
    shell.frustumCulled = false;
    shell.renderOrder = 1;
    shell.userData.frame = fr;
    scene.add(shell);
    pick.push(shell);

    const mark = new THREE.Mesh(
      new THREE.SphereGeometry(markerRadius, 14, 14),
      new THREE.MeshBasicMaterial({ color: markerColor }),
    );
    mark.position.set(fr.eye[0], fr.eye[1], fr.eye[2]);
    mark.frustumCulled = false;
    mark.renderOrder = 2;
    mark.userData.frame = fr;
    scene.add(mark);
    pick.push(mark);
  });

  const ray = new THREE.Raycaster();
  const p2 = new THREE.Vector2();
  const tip = document.getElementById('tip');
  let last = null;

  function hover(fr) {
    if (fr === last) return;
    last = fr;
    if (!fr) { tip.classList.remove('on'); return; }
    document.getElementById('ti').src = fr.thumb;
    document.getElementById('tn').textContent = fr.name;
    document.getElementById('tm').textContent =
      '#' + fr.id + ' · elevation ' + fr.elevation_deg + '° · azimuth ' + fr.azimuth_deg + '°';
    tip.classList.add('on');
  }

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    p2.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    p2.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(p2, cam);
    const hit = ray.intersectObjects(pick, false)[0];
    hover(hit ? hit.object.userData.frame : null);
  });
  canvas.addEventListener('pointerleave', () => hover(null));

  function resize() {
    const r = document.getElementById('wrap').getBoundingClientRect();
    const w = Math.max(100, r.width), h = Math.max(100, r.height);
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  (function loop() {
    requestAnimationFrame(loop);
    ctrl.update();
    renderer.render(scene, cam);
  })();
  </script>
</body>
</html>
"""


def build_capture_visualization(dataset_dir: Path, thumb_size: int = 144) -> Path:
    dataset_dir = dataset_dir.resolve()
    meta = json.loads((dataset_dir / "meta.json").read_text(encoding="utf-8"))
    cams = json.loads((dataset_dir / "cameras.json").read_text(encoding="utf-8"))
    cap = meta["capture"]
    w, h = int(cap["image_size_wh"][0]), int(cap["image_size_wh"][1])
    orbit_r = float(cap["orbit_radius"])
    z_near = max(0.08, orbit_r * 0.04)
    z_far = orbit_r * 2.8

    elev = cap["elevations_deg"]
    az_step = float(cap["azimuth_step_deg"])

    frames_out = []
    for fr in cams["frames"]:
        op = fr["opencv"]
        corners = frustum_corners_world(op["R_w2c"], op["t_w2c"], op["K"], w, h, z_near, z_far)
        img_path = dataset_dir / fr["image"]
        thumb = ""
        if img_path.is_file():
            thumb = _thumb_data_uri(img_path, size=thumb_size)
        frames_out.append(
            {
                "id": fr["id"],
                "name": fr["name"],
                "ring": fr["ring"],
                "elevation_deg": fr["elevation_deg"],
                "azimuth_deg": fr["azimuth_deg"],
                "eye": op["eye_world"],
                "frustum": corners,
                "thumb": thumb or "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            }
        )

    cube_half = float(cap["cube_half_extent"])
    n = len(frames_out)
    summary = (
        f"{n} views · elevations {elev[2]:g}°, {elev[1]:g}°, +{elev[0]:g}° · azimuth every {az_step:g}°"
    )
    payload = {
        "cubeHalf": cube_half,
        "summary": summary,
        "frames": frames_out,
        "rubik": _rubik_cube_payload(cube_half, seed=int(cap.get("mesh_seed", 0))),
    }
    payload_json = json.dumps(payload, separators=(",", ":"))
    html = HTML_TEMPLATE.replace("__PAYLOAD__", payload_json)
    out_path = dataset_dir / "capture_visualization.html"
    out_path.write_text(html, encoding="utf-8")
    return out_path


def main() -> None:
    p = argparse.ArgumentParser(description="Build interactive HTML capture diagram for rubiks_orbit_v1.")
    p.add_argument("--dataset", type=Path, default=Path("datasets") / "rubiks_orbit_v1")
    args = p.parse_args()
    path = build_capture_visualization(args.dataset)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
