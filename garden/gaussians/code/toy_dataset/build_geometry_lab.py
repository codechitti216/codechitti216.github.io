from __future__ import annotations

import argparse
import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image

_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from toy_dataset.build_capture_visualization import _rubik_cube_payload


def _image_to_data_uri_jpeg(path: Path, *, quality: int = 88) -> str | None:
    """Same pixel size as source (UVs stay valid); JPEG for smaller embedded payload."""
    if not path.is_file():
        return None
    im = Image.open(path).convert("RGB")
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=quality, optimize=True)
    b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


def build_geometry_lab(dataset_dir: Path, *, embed_images: bool = True) -> Path:
    dataset_dir = dataset_dir.resolve()
    meta = json.loads((dataset_dir / "meta.json").read_text(encoding="utf-8"))
    cams = json.loads((dataset_dir / "cameras.json").read_text(encoding="utf-8"))

    frames_min = []
    for fr in cams["frames"]:
        op = fr["opencv"]
        rel = fr["image"].replace("\\", "/")
        row: dict = {
            "name": fr["name"],
            "image": rel,
            "K": op["K"],
            "R_w2c": op["R_w2c"],
            "t_w2c": op["t_w2c"],
            "eye": op["eye_world"],
            "uv8": fr["gt"]["cube_corners_uv"],
        }
        if embed_images:
            uri = _image_to_data_uri_jpeg(dataset_dir / rel)
            if uri:
                row["imageDataUri"] = uri
        frames_min.append(row)

    cap = meta["capture"]
    payload = {
        "cornersWorld": meta["gt"]["cube_corners_world"],
        "frames": frames_min,
        "rubik": _rubik_cube_payload(
            float(cap["cube_half_extent"]),
            seed=int(cap.get("mesh_seed", 0)),
        ),
    }

    html = _HTML.replace("__PAYLOAD__", json.dumps(payload, separators=(",", ":")))
    out = dataset_dir / "geometry_lab.html"
    out.write_text(html, encoding="utf-8")
    return out


_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Geometry lab</title>
  <style>
    :root { --bg:#14161c; --panel:#1e222b; --text:#e4e8ef; --muted:#8b95a5; --accent:#7eb8ff; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.55; padding: 16px 18px 40px; }
    h1 { font-size: 1.2rem; font-weight: 600; margin: 0 0 8px 0; }
    h2 { font-size: 0.95rem; font-weight: 600; color: #c5cad6; margin: 18px 0 8px 0; }
    .row { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; margin-bottom: 10px; }
    label { font-size: 0.75rem; color: var(--muted); display: block; margin-bottom: 4px; }
    select { padding: 6px 10px; border-radius: 6px; border: 1px solid #3a4250; background: #181c24; color: var(--text); min-width: 200px; }
    .stereo-wrap { background: var(--panel); border-radius: 10px; padding: 12px; max-width: 100%; overflow-x: auto; }
    #stereoRow { position: relative; display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
    #stereoRow img { display: block; width: min(512px, 100%); max-width: 42vw; height: auto; border-radius: 6px; background: #111; vertical-align: top; }
    #stereoOverlay { position: absolute; left: 0; top: 0; pointer-events: auto; cursor: crosshair; border-radius: 6px; }
    .img-label { font-size: 0.75rem; color: #8b95a5; margin-bottom: 6px; }
    .img-col { position: relative; }
    .kp-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .kp-btns button { padding: 4px 10px; border-radius: 6px; border: 1px solid #3a4250; background: #252a34; color: var(--text); cursor: pointer; font-size: 0.8rem; }
    .kp-btns button.on { border-color: var(--accent); background: #2a3140; }
    #threeHost { width: 100%; max-width: 920px; height: min(420px, 70vh); background: #0d0f14; border-radius: 10px; margin-top: 8px; }
    #legend { font-size: 0.8rem; color: var(--muted); font-family: ui-monospace, monospace; margin-top: 10px; max-width: 920px; }
    .sibling-nav { font-size: 0.8rem; margin: 0 0 14px 0; }
    .sibling-nav a { color: var(--accent); text-decoration: none; margin-right: 14px; }
    .sibling-nav a:hover { text-decoration: underline; }
    .sibling-nav span.this { color: var(--muted); }
  </style>
</head>
<body>
  <h1>Geometry lab</h1>
  <nav class="sibling-nav" aria-label="Dataset tools">
    <span class="this">geometry_lab.html</span>
    <a href="capture_visualization.html">capture_visualization.html</a>
    <a href="epipolar_lab.html">epipolar_lab.html</a>
  </nav>

  <h2>Stereo</h2>
  <div class="row">
    <div>
      <label>View A</label>
      <select id="selA"></select>
    </div>
    <div>
      <label>View B</label>
      <select id="selB"></select>
    </div>
  </div>
  <div class="stereo-wrap">
    <p id="imgErr" style="color:#f88;font-size:0.85rem;display:none;margin:0 0 8px 0"></p>
    <div id="stereoRow">
      <div class="img-col">
        <div class="img-label">View A</div>
        <img id="imgA" alt="View A" decoding="async" />
      </div>
      <div class="img-col">
        <div class="img-label">View B</div>
        <img id="imgB" alt="View B" decoding="async" />
      </div>
      <canvas id="stereoOverlay" aria-hidden="true"></canvas>
    </div>
    <div class="kp-btns" id="kpBtns"></div>
  </div>

  <h2>3D</h2>
  <div id="threeHost"></div>
  <p id="legend"></p>

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
  const CORNERS_W = DATA.cornersWorld;
  const frames = DATA.frames;
  const RUBIK = DATA.rubik;

  const COLORS = ['#e57373','#f06292','#ba68c8','#9575cd','#7986cb','#64b5f6','#4dd0e1','#81c784'];

  function matT(R) {
    return [[R[0][0],R[1][0],R[2][0]],[R[0][1],R[1][1],R[2][1]],[R[0][2],R[1][2],R[2][2]]];
  }
  function matvec(R, v) {
    return [
      R[0][0]*v[0]+R[0][1]*v[1]+R[0][2]*v[2],
      R[1][0]*v[0]+R[1][1]*v[1]+R[1][2]*v[2],
      R[2][0]*v[0]+R[2][1]*v[1]+R[2][2]*v[2],
    ];
  }
  function cameraCenter(R, t) {
    const v = matvec(matT(R), t);
    return [-v[0], -v[1], -v[2]];
  }
  function rayDirUnit(R, K, u, v) {
    const fx = K[0][0], fy = K[1][1], cx = K[0][2], cy = K[1][2];
    const dc = [(u - cx) / fx, (v - cy) / fy, 1];
    const dw = matvec(matT(R), dc);
    const L = Math.hypot(dw[0], dw[1], dw[2]);
    return [dw[0]/L, dw[1]/L, dw[2]/L];
  }
  function camPointToWorld(R, C, Xc) {
    const w = matvec(matT(R), Xc);
    return [C[0] + w[0], C[1] + w[1], C[2] + w[2]];
  }
  function imagePlaneCornersWorld(R, K, C, W, H, depth) {
    const fx = K[0][0], fy = K[1][1], cx = K[0][2], cy = K[1][2];
    const cornersPx = [[0, 0], [W, 0], [W, H], [0, H]];
    return cornersPx.map(([u, v]) => {
      const Xc = [depth * (u - cx) / fx, depth * (v - cy) / fy, depth];
      const p = camPointToWorld(R, C, Xc);
      return new THREE.Vector3(p[0], p[1], p[2]);
    });
  }
  function pixelOnImagePlaneWorld(R, K, C, u, v, depth) {
    const fx = K[0][0], fy = K[1][1], cx = K[0][2], cy = K[1][2];
    const Xc = [depth * (u - cx) / fx, depth * (v - cy) / fy, depth];
    const p = camPointToWorld(R, C, Xc);
    return new THREE.Vector3(p[0], p[1], p[2]);
  }
  function makeImagePlaneMesh(R, K, C, imgEl, depth) {
    if (!imgEl.complete || !imgEl.naturalWidth) return null;
    const fx = K[0][0], fy = K[1][1], cx = K[0][2], cy = K[1][2];
    const W = imgEl.naturalWidth, H = imgEl.naturalHeight;
    const corners = [[0, 0], [W, 0], [W, H], [0, H]];
    const pos = [];
    const uvs = [];
    for (let i = 0; i < 4; i++) {
      const u = corners[i][0], v = corners[i][1];
      const Xc = [depth * (u - cx) / fx, depth * (v - cy) / fy, depth];
      const Pw = camPointToWorld(R, C, Xc);
      pos.push(Pw[0], Pw[1], Pw[2]);
      uvs.push(u / W, 1 - v / H);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex([0, 1, 2, 0, 2, 3]);
    const tex = new THREE.Texture(imgEl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.renderOrder = -3;
    return mesh;
  }
  function makeViewpointFrustum(R, K, C, W, H, depth, frameColor, rayColor) {
    const corners = imagePlaneCornersWorld(R, K, C, W, H, depth);
    const Cv = new THREE.Vector3(C[0], C[1], C[2]);
    const frPos = [];
    for (let i = 0; i < 4; i++) {
      frPos.push(Cv.x, Cv.y, Cv.z, corners[i].x, corners[i].y, corners[i].z);
    }
    const frGeom = new THREE.BufferGeometry();
    frGeom.setAttribute('position', new THREE.Float32BufferAttribute(frPos, 3));
    const fr = new THREE.LineSegments(
      frGeom,
      new THREE.LineBasicMaterial({ color: rayColor, transparent: true, opacity: 0.55, depthTest: true }),
    );
    fr.renderOrder = -1;
    const frame = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(corners),
      new THREE.LineBasicMaterial({ color: frameColor, transparent: true, opacity: 0.95 }),
    );
    frame.renderOrder = -1;
    return [fr, frame];
  }
  function makeEyeToPixelStub(C, Pplane, color) {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(C[0], C[1], C[2]),
      Pplane.clone(),
    ]);
    const line = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }),
    );
    line.renderOrder = 1;
    return line;
  }
  function triangulateRays(C1, d1, C2, d2) {
    const w0 = [C1[0]-C2[0], C1[1]-C2[1], C1[2]-C2[2]];
    const a = d1[0]*d1[0]+d1[1]*d1[1]+d1[2]*d1[2];
    const b = d1[0]*d2[0]+d1[1]*d2[1]+d1[2]*d2[2];
    const c = d2[0]*d2[0]+d2[1]*d2[1]+d2[2]*d2[2];
    const d = d1[0]*w0[0]+d1[1]*w0[1]+d1[2]*w0[2];
    const e = d2[0]*w0[0]+d2[1]*w0[1]+d2[2]*w0[2];
    const denom = a*c - b*b;
    if (Math.abs(denom) < 1e-14) return null;
    const s = (b*e - c*d) / denom;
    const t = (a*e - b*d) / denom;
    const P1 = [C1[0]+s*d1[0], C1[1]+s*d1[1], C1[2]+s*d1[2]];
    const P2 = [C2[0]+t*d2[0], C2[1]+t*d2[1], C2[2]+t*d2[2]];
    const P = [(P1[0]+P2[0])/2, (P1[1]+P2[1])/2, (P1[2]+P2[2])/2];
    return { P, P1, P2, s, t };
  }

  const selA = document.getElementById('selA');
  const selB = document.getElementById('selB');
  const imgElA = document.getElementById('imgA');
  const imgElB = document.getElementById('imgB');
  const stereoRow = document.getElementById('stereoRow');
  const stereoOverlay = document.getElementById('stereoOverlay');
  const octx = stereoOverlay.getContext('2d');
  const kpBtns = document.getElementById('kpBtns');
  const legend = document.getElementById('legend');
  const imgErr = document.getElementById('imgErr');

  frames.forEach((f, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = f.name;
    selA.appendChild(o.cloneNode(true));
    selB.appendChild(o);
  });
  if (frames.length > 1) selB.value = '1';

  for (let k = 0; k < 8; k++) {
    const b = document.createElement('button');
    b.textContent = 'Corner ' + k;
    b.dataset.k = k;
    b.addEventListener('click', () => selectCorner(k));
    kpBtns.appendChild(b);
  }

  let fa = frames[0], fb = frames[1];
  let selectedK = 0;

  function getStereoLayout() {
    const ia = imgElA;
    const ib = imgElB;
    const rr = stereoRow.getBoundingClientRect();
    const ra = ia.getBoundingClientRect();
    const rb = ib.getBoundingClientRect();
    return {
      oa: { x: ra.left - rr.left, y: ra.top - rr.top, w: ra.width, h: ra.height, nw: ia.naturalWidth || 1, nh: ia.naturalHeight || 1 },
      ob: { x: rb.left - rr.left, y: rb.top - rr.top, w: rb.width, h: rb.height, nw: ib.naturalWidth || 1, nh: ib.naturalHeight || 1 },
      rw: stereoRow.clientWidth,
      rh: stereoRow.clientHeight,
    };
  }

  function uvToRow(uv, box) {
    return [
      box.x + (uv[0] / box.nw) * box.w,
      box.y + (uv[1] / box.nh) * box.h,
    ];
  }

  function layoutStereo() {
    if (!imgElA.complete || !imgElB.complete || !imgElA.naturalWidth || !imgElB.naturalWidth) return;
    const L = getStereoLayout();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    stereoOverlay.width = L.rw * dpr;
    stereoOverlay.height = L.rh * dpr;
    stereoOverlay.style.width = L.rw + 'px';
    stereoOverlay.style.height = L.rh + 'px';
    drawStereo();
  }

  function drawStereo() {
    if (!imgElA.complete || !imgElB.complete || !imgElA.naturalWidth || !imgElB.naturalWidth) return;
    const L = getStereoLayout();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.clearRect(0, 0, L.rw, L.rh);

    const ua = fa.uv8, ub = fb.uv8;
    for (let k = 0; k < 8; k++) {
      const c = COLORS[k];
      const pa = uvToRow(ua[k], L.oa);
      const pb = uvToRow(ub[k], L.ob);
      octx.strokeStyle = c;
      octx.globalAlpha = 0.55;
      octx.lineWidth = 1.2;
      octx.beginPath();
      octx.moveTo(pa[0], pa[1]);
      octx.lineTo(pb[0], pb[1]);
      octx.stroke();
      octx.globalAlpha = 1;
      octx.fillStyle = c;
      octx.beginPath();
      octx.arc(pa[0], pa[1], k === selectedK ? 1.8 : 1.2, 0, Math.PI * 2);
      octx.fill();
      octx.beginPath();
      octx.arc(pb[0], pb[1], k === selectedK ? 1.8 : 1.2, 0, Math.PI * 2);
      octx.fill();
      octx.fillStyle = '#111';
      octx.font = 'bold 7px system-ui';
      octx.fillText(String(k), pa[0] - 1, pa[1] + 1);
      octx.fillText(String(k), pb[0] - 1, pb[1] + 1);
    }
  }

  function loadPair() {
    fa = frames[parseInt(selA.value, 10)];
    fb = frames[parseInt(selB.value, 10)];
    imgErr.style.display = 'none';
    imgErr.textContent = '';

    function tryDraw() {
      if (imgElA.complete && imgElB.complete && imgElA.naturalWidth && imgElB.naturalWidth) {
        layoutStereo();
        drawStereo();
        update3D();
      }
    }

    imgElA.onerror = () => {
      imgErr.textContent = 'Failed to load: ' + fa.name;
      imgErr.style.display = 'block';
    };
    imgElB.onerror = () => {
      imgErr.textContent = 'Failed to load: ' + fb.name;
      imgErr.style.display = 'block';
    };
    imgElA.onload = tryDraw;
    imgElB.onload = tryDraw;
    imgElA.removeAttribute('crossorigin');
    imgElB.removeAttribute('crossorigin');
    const srcA = fa.imageDataUri || fa.image;
    const srcB = fb.imageDataUri || fb.image;
    imgElA.src = srcA;
    imgElB.src = srcB;
    tryDraw();
  }

  selA.addEventListener('change', loadPair);
  selB.addEventListener('change', loadPair);

  stereoOverlay.addEventListener('click', (e) => {
    if (!imgElA.naturalWidth) return;
    const L = getStereoLayout();
    const rr = stereoRow.getBoundingClientRect();
    const mx = e.clientX - rr.left;
    const my = e.clientY - rr.top;
    const oa = L.oa, ob = L.ob;
    if (mx >= oa.x && mx <= oa.x + oa.w && my >= oa.y && my <= oa.y + oa.h) {
      const u = ((mx - oa.x) / oa.w) * oa.nw;
      const v = ((my - oa.y) / oa.h) * oa.nh;
      let best = 0, bd = 1e9;
      for (let k = 0; k < 8; k++) {
        const dx = fa.uv8[k][0] - u, dy = fa.uv8[k][1] - v;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = k; }
      }
      if (bd < 400) selectCorner(best);
    } else if (mx >= ob.x && mx <= ob.x + ob.w && my >= ob.y && my <= ob.y + ob.h) {
      const u = ((mx - ob.x) / ob.w) * ob.nw;
      const v = ((my - ob.y) / ob.h) * ob.nh;
      let best = 0, bd = 1e9;
      for (let k = 0; k < 8; k++) {
        const dx = fb.uv8[k][0] - u, dy = fb.uv8[k][1] - v;
        const d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = k; }
      }
      if (bd < 400) selectCorner(best);
    }
  });

  new ResizeObserver(() => layoutStereo()).observe(stereoRow);

  function selectCorner(k) {
    selectedK = k;
    kpBtns.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === k));
    drawStereo();
    update3D();
  }

  let scene, camera, renderer, controls;
  let dynRoot = null;

  function update3D() {
    const host = document.getElementById('threeHost');
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.05, 100);
      camera.position.set(4.2, 3.4, 5.2);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      scene.add(new THREE.AmbientLight(0xffffff, 0.62));
      const keyL = new THREE.DirectionalLight(0xffffff, 0.88);
      keyL.position.set(6, 12, 8);
      scene.add(keyL);
      const fillL = new THREE.DirectionalLight(0xaaccff, 0.38);
      fillL.position.set(-8, 4, -6);
      scene.add(fillL);

      if (RUBIK) {
        const tex = new THREE.TextureLoader().load(RUBIK.atlasPng);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = false;
        tex.anisotropy = Math.min(10, renderer.capabilities.getMaxAnisotropy());
        const rg = new THREE.BufferGeometry();
        rg.setAttribute('position', new THREE.Float32BufferAttribute(RUBIK.positions, 3));
        rg.setAttribute('uv', new THREE.Float32BufferAttribute(RUBIK.uvs, 2));
        rg.setIndex(RUBIK.indices);
        rg.computeVertexNormals();
        const rubik = new THREE.Mesh(
          rg,
          new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.06 }),
        );
        rubik.frustumCulled = false;
        rubik.renderOrder = -4;
        scene.add(rubik);
      }

      new ResizeObserver(() => {
        renderer.setSize(host.clientWidth, host.clientHeight);
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
      }).observe(host);

      (function anim() {
        requestAnimationFrame(anim);
        controls.update();
        renderer.render(scene, camera);
      })();
    }

    const k = selectedK;
    const R1 = fa.R_w2c, t1 = fa.t_w2c, K1 = fa.K;
    const R2 = fb.R_w2c, t2 = fb.t_w2c, K2 = fb.K;
    const uv1 = fa.uv8[k], uv2 = fb.uv8[k];
    const C1 = cameraCenter(R1, t1);
    const C2 = cameraCenter(R2, t2);
    const d1 = rayDirUnit(R1, K1, uv1[0], uv1[1]);
    const d2 = rayDirUnit(R2, K2, uv2[0], uv2[1]);
    const tri = triangulateRays(C1, d1, C2, d2);
    const gt = CORNERS_W[k];
    const err = tri ? Math.hypot(tri.P[0]-gt[0], tri.P[1]-gt[1], tri.P[2]-gt[2]) : 0;

    const Lray = 4.5;
    function makeRay(C, d, color) {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(C[0], C[1], C[2]),
        new THREE.Vector3(C[0]+d[0]*Lray, C[1]+d[1]*Lray, C[2]+d[2]*Lray),
      ]);
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color }));
    }
    function makePt(p, color, size) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(size, 16, 16),
        new THREE.MeshBasicMaterial({ color }),
      );
    }

    if (dynRoot) {
      scene.remove(dynRoot);
      dynRoot.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const m = o.material;
          if (m.map) m.map.dispose();
          m.dispose();
        }
      });
    }
    dynRoot = new THREE.Group();

    const imgPlaneDepth = 0.38;

    const planeA = makeImagePlaneMesh(R1, K1, C1, imgElA, imgPlaneDepth);
    const planeB = makeImagePlaneMesh(R2, K2, C2, imgElB, imgPlaneDepth);
    if (planeA) dynRoot.add(planeA);
    if (planeB) dynRoot.add(planeB);

    if (imgElA.complete && imgElA.naturalWidth) {
      const WA = imgElA.naturalWidth, HA = imgElA.naturalHeight;
      const [frA, frameA] = makeViewpointFrustum(R1, K1, C1, WA, HA, imgPlaneDepth, 0x6eb5ff, 0x4d78a8);
      dynRoot.add(frA, frameA);
    }
    if (imgElB.complete && imgElB.naturalWidth) {
      const WB = imgElB.naturalWidth, HB = imgElB.naturalHeight;
      const [frB, frameB] = makeViewpointFrustum(R2, K2, C2, WB, HB, imgPlaneDepth, 0xff9e6e, 0xb87850);
      dynRoot.add(frB, frameB);
    }

    const Ppix1 = pixelOnImagePlaneWorld(R1, K1, C1, uv1[0], uv1[1], imgPlaneDepth);
    const Ppix2 = pixelOnImagePlaneWorld(R2, K2, C2, uv2[0], uv2[1], imgPlaneDepth);
    dynRoot.add(makeEyeToPixelStub(C1, Ppix1, 0x9ecbff));
    dynRoot.add(makeEyeToPixelStub(C2, Ppix2, 0xffb88a));

    const pixM1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 12, 12),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setStyle(COLORS[k]) }),
    );
    pixM1.position.copy(Ppix1);
    pixM1.renderOrder = 2;
    const pixM2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 12, 12),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setStyle(COLORS[k]) }),
    );
    pixM2.position.copy(Ppix2);
    pixM2.renderOrder = 2;
    dynRoot.add(pixM1, pixM2);

    const rA = makeRay(C1, d1, 0x6eb5ff);
    const rB = makeRay(C2, d2, 0xff9e6e);
    rA.renderOrder = 1;
    rB.renderOrder = 1;
    dynRoot.add(rA, rB);

    const c1m = makePt(C1, 0x6eb5ff, 0.012);
    const c2m = makePt(C2, 0xff9e6e, 0.012);
    c1m.position.set(C1[0], C1[1], C1[2]);
    c2m.position.set(C2[0], C2[1], C2[2]);
    c1m.renderOrder = 2;
    c2m.renderOrder = 2;
    dynRoot.add(c1m, c2m);

    if (tri) {
      const ptEst = makePt(tri.P, 0x7cfc7c, 0.0104);
      ptEst.position.set(tri.P[0], tri.P[1], tri.P[2]);
      ptEst.renderOrder = 2;
      dynRoot.add(ptEst);
    }
    const ptGt = makePt(gt, 0xffe066, 0.01);
    ptGt.position.set(gt[0], gt[1], gt[2]);
    ptGt.renderOrder = 2;
    dynRoot.add(ptGt);

    scene.add(dynRoot);

    legend.innerHTML = tri
      ? 'err=' + err.toExponential(2) +
        ' &nbsp;|&nbsp; seg=' + Math.hypot(tri.P1[0]-tri.P2[0], tri.P1[1]-tri.P2[1], tri.P1[2]-tri.P2[2]).toExponential(2) +
        ' &nbsp;|&nbsp; s=' + tri.s.toFixed(3) + ' t=' + tri.t.toFixed(3)
      : '—';

    controls.target.set(0, 0, 0);
  }

  loadPair();
  selectCorner(0);
  window.addEventListener('resize', layoutStereo);
  </script>
</body>
</html>
"""


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dataset", type=Path, default=Path("datasets") / "rubiks_orbit_v1")
    p.add_argument(
        "--no-embed-images",
        action="store_true",
        help="Do not embed JPEG data URIs (smaller HTML; use a local HTTP server so images/ paths load).",
    )
    args = p.parse_args()
    path = build_geometry_lab(args.dataset, embed_images=not args.no_embed_images)
    print(f"Wrote {path}")


if __name__ == "__main__":
    main()
