---
title: "Gaussian Splatting: Controlled Multi-View Reconstruction"
date: "2025-08-05"
tags: ["Gaussian Splatting", "NeRF", "3D Reconstruction", "PyTorch"]
status: "ongoing"
kind: "learning"
published: true
visibility: "public"
---

## Problem

Validate a Gaussian Splatting pipeline on a controlled synthetic scene with fixed camera geometry.

## Dataset

- Scene: synthetic Rubik's cube
- Views: 108 (top 36, normal 36, bottom 36)
- Angular increment: 10?
- Resolution: 1024x768
- Camera distance: 6.3

Assets: `public/assets/top_view_*.png`, `normal_view_*.png`, `bottom_view_*.png`.

## Parameterization

For Gaussian \(i\):
- center \(\mu_i \in \mathbb{R}^3\)
- scale/covariance \(\Sigma_i\)
- rotation \(q_i\) (quaternion)
- color \(c_i \in \mathbb{R}^3\)

Model uses 54 trainable Gaussians.

```python
self.positions = nn.Parameter(torch.randn(54, 3) * 0.1)
self.scales    = nn.Parameter(torch.ones(54, 3) * 0.1)
self.rotations = nn.Parameter(torch.randn(54, 4))
self.colors    = nn.Parameter(torch.rand(54, 3))
```

## Objective

\[
\mathcal{L}_{total} = \mathcal{L}_{photo} + 0.1\,\mathcal{L}_{color}
\]

- \(\mathcal{L}_{photo}\): per-image MSE between rendered image and target image
- \(\mathcal{L}_{color}\): color consistency regularization

```python
rendered = self.render_gaussians(camera)
L_photo = F.mse_loss(rendered, target)
L_color = self.compute_color_loss()
L = L_photo + 0.1 * L_color
```

## Training Setup

- Optimizer: Adam
- LR: 0.01
- Epochs: 10
- Batch size: 2
- Device: CUDA
- Gradient clipping enabled

## Observed Loss (training_history.json)

- E1: 0.2632208467
- E2: 0.2632112205
- E3: 0.2632041574
- E4: 0.2631997466
- E5: 0.2631973326
- E6: 0.2631948590
- E7: 0.2631928623
- E8: 0.2631911933
- E9: 0.2631901205
- E10: 0.2631887496

## Artifacts

- `public/assets/training_history.json`
- `public/assets/training_plots_epoch_*.png`
- `public/assets/gaussian_3d_epoch_*.png`
- `public/assets/Gaussian Evolution.mp4`

## Constraints

- Controlled synthetic setup only
- No external benchmark metrics reported (PSNR/SSIM/LPIPS)
- No ablation table in current report
