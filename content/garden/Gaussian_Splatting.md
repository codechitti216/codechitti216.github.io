---
title: "Gaussian Splatting: Rubik's Cube Multi-View Reconstruction"
date: "2025-08-05"
tags: ["Gaussian Splatting", "3D Reconstruction", "View Synthesis", "PyTorch"]
status: "ongoing"
kind: "learning"
published: true
visibility: "public"
---

## Problem Definition

This work builds a controlled Gaussian Splatting pipeline for novel view synthesis on a synthetic Rubik's cube scene.

Target outcomes:
1. Generate a geometrically consistent multi-view dataset.
2. Train a compact Gaussian representation from image supervision.
3. Validate convergence behavior and reconstruction fidelity qualitatively on held-out views.

## Dataset and Camera Setup

- Total views: **108**
- View groups: **top (36), normal (36), bottom (36)**
- Azimuth step: **10?**
- Resolution: **1024 ? 768**
- Camera distance: **6.3**
- Orbital radius: **8.07**

### Camera geometry artifacts

<div style="display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 1000px; margin: 20px 0;">
  <div style="text-align: center;">
    <a href="assets/camera_positions_3d.png" target="_blank">
      <img src="assets/camera_positions_3d.png" alt="3D camera positions" style="width: 100%; max-width: 800px; height: auto; border: 2px solid #ddd; border-radius: 8px;" />
    </a>
    <p><strong>3D orbital camera layout</strong></p>
  </div>

  <div style="text-align: center;">
    <a href="assets/camera_positions_3d_with_images.png" target="_blank">
      <img src="assets/camera_positions_3d_with_images.png" alt="Camera positions with sample rendered views" style="width: 100%; max-width: 800px; height: auto; border: 2px solid #ddd; border-radius: 8px;" />
    </a>
    <p><strong>Camera-to-image correspondence</strong></p>
  </div>

  <div style="text-align: center;">
    <a href="assets/camera_positions_with_perspective_images.png" target="_blank">
      <img src="assets/camera_positions_with_perspective_images.png" alt="Perspective coverage map" style="width: 100%; max-width: 800px; height: auto; border: 2px solid #ddd; border-radius: 8px;" />
    </a>
    <p><strong>Perspective coverage</strong></p>
  </div>
</div>

## Representation and Trainable Parameters

A set of 54 Gaussians is optimized.

For Gaussian \(i\):
- Mean: \(\mu_i \in \mathbb{R}^3\)
- Covariance/scale parameters: \(\Sigma_i\)
- Rotation: quaternion \(q_i\)
- Color: \(c_i \in \mathbb{R}^3\)

```python
self.positions = nn.Parameter(torch.randn(54, 3) * 0.1)
self.scales = nn.Parameter(torch.ones(54, 3) * 0.1)
self.rotations = nn.Parameter(torch.randn(54, 4))
self.colors = nn.Parameter(torch.rand(54, 3))
```

## Rendering Step: Implementation Disclosure

In this project page, the rasterization/projection internals are currently abstracted behind:

```python
rendered_img = self.render_gaussians(camera)
```

That means this document does **not** currently expose the explicit projected covariance derivation in code (e.g., \(\Sigma' = J W \Sigma W^T J^T\)) inside the page.

To avoid ambiguity: this page documents the training pipeline and artifacts; the full low-level splat projection kernel is not expanded here yet.

## Training Objective

Current implementation uses:

\[
\mathcal{L}_{total} = \mathcal{L}_{photo} + 0.1\,\mathcal{L}_{color}
\]

where:
- \(\mathcal{L}_{photo}\): image-space MSE between rendered and target view
- \(\mathcal{L}_{color}\): color consistency regularization

```python
rendered_img = self.render_gaussians(camera)
photometric_loss = F.mse_loss(rendered_img, target_img)
color_consistency_loss = self.compute_color_loss()
total_loss = photometric_loss + 0.1 * color_consistency_loss
```

## Training Configuration

```python
training_config = {
    "epochs": 10,
    "learning_rate": 0.01,
    "batch_size": 2,
    "image_downsampling": 4,
    "device": "cuda",
    "optimization": "Adam"
}
```

## Convergence Record (from training_history.json)

- Epoch 1: 0.2632208467
- Epoch 2: 0.2632112205
- Epoch 3: 0.2632041574
- Epoch 4: 0.2631997466
- Epoch 5: 0.2631973326
- Epoch 6: 0.2631948590
- Epoch 7: 0.2631928623
- Epoch 8: 0.2631911933
- Epoch 9: 0.2631901205
- Epoch 10: 0.2631887496

## Training Visuals

<details>
<summary>Per-epoch plots</summary>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin: 20px 0;">
  <a href="assets/training_plots_epoch_0001.png" target="_blank"><img src="assets/training_plots_epoch_0001.png" alt="epoch 1" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0002.png" target="_blank"><img src="assets/training_plots_epoch_0002.png" alt="epoch 2" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0003.png" target="_blank"><img src="assets/training_plots_epoch_0003.png" alt="epoch 3" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0004.png" target="_blank"><img src="assets/training_plots_epoch_0004.png" alt="epoch 4" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0005.png" target="_blank"><img src="assets/training_plots_epoch_0005.png" alt="epoch 5" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0006.png" target="_blank"><img src="assets/training_plots_epoch_0006.png" alt="epoch 6" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0007.png" target="_blank"><img src="assets/training_plots_epoch_0007.png" alt="epoch 7" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0008.png" target="_blank"><img src="assets/training_plots_epoch_0008.png" alt="epoch 8" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0009.png" target="_blank"><img src="assets/training_plots_epoch_0009.png" alt="epoch 9" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/training_plots_epoch_0010.png" target="_blank"><img src="assets/training_plots_epoch_0010.png" alt="epoch 10" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
</div>

</details>

<details>
<summary>3D Gaussian snapshots</summary>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin: 20px 0;">
  <a href="assets/gaussian_3d_epoch_0001.png" target="_blank"><img src="assets/gaussian_3d_epoch_0001.png" alt="3d epoch 1" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/gaussian_3d_epoch_0005.png" target="_blank"><img src="assets/gaussian_3d_epoch_0005.png" alt="3d epoch 5" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
  <a href="assets/gaussian_3d_epoch_0010.png" target="_blank"><img src="assets/gaussian_3d_epoch_0010.png" alt="3d epoch 10" style="width:100%; border:1px solid #ddd; border-radius:4px;" /></a>
</div>

</details>

<div style="text-align: center; margin: 20px 0;">
  <video width="100%" style="max-width: 800px; border: 2px solid #ddd; border-radius: 8px;" controls preload="metadata">
    <source src="assets/Gaussian%20Evolution.mp4" type="video/mp4">
  </video>
</div>

## Reproducibility Pointers

Files used in this workflow:
- `gaussian_splatting_rubiks.py`
- `single_visualizer_multiview.py`
- `camera_positions_visualization.py`

Outputs:
- `public/assets/training_history.json`
- `public/assets/training_plots_epoch_*.png`
- `public/assets/gaussian_3d_epoch_*.png`
- `public/assets/Gaussian Evolution.mp4`

## Known Gaps

- This page does not yet include an explicit derivation/code block for projected covariance \(\Sigma'\) computation.
- No standardized external benchmark metrics (PSNR/SSIM/LPIPS) are reported here.
- No ablation matrix is reported in this document.
