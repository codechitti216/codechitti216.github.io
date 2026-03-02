---
title: "Gaussian Splatting: Multi-View Rubik's Cube Reconstruction"
date: "2025-08-05"
tags: ["Gaussian Splatting", "NeRF", "View Synthesis", "3D Reconstruction", "PyTorch"]
status: "ongoing"
kind: "learning"
published: true
visibility: "public"
---

## Objective

Build and validate a Gaussian Splatting pipeline on a controlled multi-view dataset.

## Scope

- Dataset generation from a synthetic Rubik's cube scene
- Multi-view camera calibration and rendering
- End-to-end Gaussian parameter optimization (position, scale, rotation, color)
- Training diagnostics and convergence tracking

## Dataset

- Total views: 108
- Levels: top (36), normal (36), bottom (36)
- Angular step: 10 degrees
- Resolution: 1024 x 768
- Camera distance: 6.3
- Orbital radius: 8.07

Representative assets are in `public/assets/`:
- `camera_positions_3d.png`
- `camera_positions_3d_with_images.png`
- `camera_positions_with_perspective_images.png`
- `top_view_*.png`, `normal_view_*.png`, `bottom_view_*.png`

## Model

Gaussian parameterization (54 Gaussians):
- Position: \(\mu_i \in \mathbb{R}^3\)
- Covariance/scale: \(\Sigma_i\) (axis-scaled form)
- Rotation: quaternion
- Color: RGB

Core implementation pattern:

```python
class GaussianSplattingRubiks:
    def __init__(self, num_gaussians=54, device='cuda'):
        self.positions = nn.Parameter(torch.randn(54, 3) * 0.1)
        self.scales = nn.Parameter(torch.ones(54, 3) * 0.1)
        self.rotations = nn.Parameter(torch.randn(54, 4))
        self.colors = nn.Parameter(torch.rand(54, 3))
```

## Training

Configuration:

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

Loss (used in implementation):

\[
\mathcal{L}_{total} = \mathcal{L}_{photo} + 0.1\,\mathcal{L}_{color}
\]

where
- \(\mathcal{L}_{photo}\): MSE between rendered and target image
- \(\mathcal{L}_{color}\): color consistency regularizer

Training step shape:

```python
rendered_img = self.render_gaussians(camera)
photometric_loss = F.mse_loss(rendered_img, target_img)
color_consistency_loss = self.compute_color_loss()
total_loss = photometric_loss + 0.1 * color_consistency_loss

optimizer.zero_grad()
total_loss.backward()
torch.nn.utils.clip_grad_norm_([self.positions, self.colors], max_norm=1.0)
optimizer.step()
```

## Observed training trajectory

Epoch losses (from `training_history.json`):

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

Artifacts:
- `training_plots_epoch_0001.png` ... `training_plots_epoch_0010.png`
- `gaussian_3d_epoch_0001.png` ... `gaussian_3d_epoch_0010.png`
- `Gaussian Evolution.mp4`

## Engineering constraints encountered

- Open3D headless rendering context issues when spawning many visualizers
- Memory pressure during multi-view training
- Color collapse risk without explicit color handling

Mitigations applied:
- Single persistent visualizer instance for dataset generation
- Batched training and periodic CUDA cache clearing
- Explicit RGB-aware data path and color regularization

## Validation notes

Internal validation was done on the synthetic Rubik's setup and visual convergence diagnostics.
No external benchmark (PSNR/SSIM/LPIPS on standard datasets) is reported in this page.

## Limitations

- Controlled synthetic scene; domain transfer not yet validated
- Short training horizon (10 epochs)
- No formal ablation table in this report

## Reproducibility pointers

Implementation files referenced in this work:
- `gaussian_splatting_rubiks.py`
- `single_visualizer_multiview.py`
- `camera_positions_visualization.py`

Outputs and logs:
- `public/assets/training_history.json`
- `public/assets/gaussian_3d_epoch_*.png`
- `public/assets/training_plots_epoch_*.png`
