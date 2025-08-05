---
title: "NeRFs and Gaussian Splatting"
date: "2025-08-05"
tags: ["NeRF", "Gaussian Splatting", "View Synthesis", "Rendering", "MLP", "3D Perception"]
status: "ongoing"
kind: "learning"
published: true
visibility: "public"
evolution:
  - date: "2025-08-05"
    note: "Initial curiosity about rendering and Gaussian Splatting."
  - date: "2025-08-05"
    note: "Learned what NeRF is and how it uses volume rendering and MLPs."
  - date: "2025-08-05"
    note: "Understood Gaussian Splatting as explicit, differentiable geometry proxy."
  - date: "2025-08-05"
    note: "Refined understanding of inference, initialization, and learned geometry."
  - date: "2025-08-05"
    note: "Confirmed Gaussian Splatting as a train-once, render-fast paradigm."
---


# 🧠 A Journal of Evolving Intuition: NeRFs and Gaussian Splatting

### 2025 - 08 - 05

## 🌱 Starting Point

**Prompted by curiosity**, I asked: “What is Gaussian Splatting?” All I knew was that it was some rendering method involving point clouds.

That kicked off the cascade.

I realized that to understand Gaussian Splatting, I first needed to understand NeRF — which I barely knew existed.

I started from ground zero:

* “What is rendering?”
* “Isn’t it like meshing — turning raw data into something visual?”
* “What’s this ‘view direction’? And how does radiance relate to pixels?”

## 🔍 Encountering NeRF

What I first learned: NeRF is **not a geometry model**, but a **neural function** that maps 3D coordinates and viewing directions to color and density.

### Early Realizations:

* ❌ Thought radiance and density were grayscale-like.
  ✅ Learned radiance is *emitted color in a view-dependent way*, and density governs transmittance.
* ❌ Thought each pixel had its own function or model.
  ✅ Realized it’s one MLP shared across the scene.
* ✅ Understood rays: camera → pixel → cast ray → sample 3D points.

### Pipeline Clicked:

> Sample 3D points on a ray → pass (x, d) into MLP → integrate color + transmittance → predict pixel RGB → compare to ground truth → backprop through the whole ray.

My mental reframe:

> “NeRF is a learned, differentiable form of volumetric projection.”

### Training Efficiency:

* ❌ Thought of batches as one-ray-per-batch.
  ✅ Understood minibatches of many rays, sampled randomly, for efficiency.

## 🤯 Turning to Gaussian Splatting

Then came the shift:

> “If NeRF learns a function, what does Gaussian Splatting do?”

### First Analogies:

> “It’s like stacking transparent sheets (Gaussians) and projecting them.”
> “It’s like splattering colored paintballs on a canvas and looking from behind.”

### Core Understanding:

* Starts with a **sparse point cloud** (e.g. from COLMAP)
* Initializes **one Gaussian per point**
* Each Gaussian has:

  * Position (μ)
  * Covariance (Σ)
  * Color
  * Opacity
  * View-dependent features (e.g. Spherical Harmonics)
* All of these are **trainable parameters**
* Rendering = **project and alpha-blend** Gaussians
* Backpropagate image loss to update Gaussian parameters — including positions!

### Corrected Assumptions:

* ❌ Thought the point cloud stayed fixed.
  ✅ Even Gaussian *centers* (positions) are optimized.
* ❌ Thought inference required re-initializing Gaussians.
  ✅ Training is one-time; inference is just projection.

> “After training, you discard the original point cloud — the optimized Gaussians *are* your scene.”

## 🧠 From Function to Proxy

|                | NeRF                          | Gaussian Splatting                      |
| -------------- | ----------------------------- | --------------------------------------- |
| Representation | Implicit (MLP function)       | Explicit (trainable 3D Gaussians)       |
| Geometry       | Not directly accessible       | Encoded in positions, shapes of blobs   |
| Rendering      | Sample & integrate along rays | Project & blend Gaussians               |
| Training Data  | Only multi-view images        | Multi-view images + initial point cloud |
| Inference Time | Slow (unless optimized)       | Real-time                               |
| Editable       | Hard (function entangled)     | Easy (Gaussians are modular)            |

> “NeRF learns how to simulate light transport.”
> “Gaussian Splatting learns to be seen.”

## 🔎 Diagnostic-Level Intuition

> “After training, we have a ‘mini Gaussian world’ that, when projected from the 50 known views, reconstructs the original images near-perfectly.” ✅ Yes.

> “At inference, we use the trained Gaussians — not the raw point cloud.” ✅ Yes.

> “Gaussian Splatting is not about learning a rendering function — it *is* the rendering structure.” ✅ Yes.

## 🧭 What’s Next

### Still Curious About:

* How view-dependent shading is encoded via Spherical Harmonics
* How occlusion is handled explicitly in splatting vs via density in NeRF
* What happens when GS is trained on extremely sparse data
* How to compress or prune Gaussians for edge devices
* How dynamic scenes can be represented in GS (temporal Gaussians?)

### What’s Solidified:

* ✅ Volume rendering via NeRF’s sampling → function → integration pipeline
* ✅ Differentiable splatting as a projection-first, geometry-aware approach
* ✅ Trade-offs: NeRF is expressive but slow; GS is fast and modular

---

## ✅ What I'm Studying

How two different paradigms — **NeRFs** and **Gaussian Splatting** — enable view synthesis from sparse inputs. One learns a light-emitting function, the other builds a proxy geometry of 3D blobs.

---

## 🎯 My Model of NeRF (Neural Radiance Fields)

### Summary

NeRF is a **function approximator (MLP)** that learns:

$$
F_\theta(x \in \mathbb{R}^3, \, d \in \mathbb{R}^3) \rightarrow (r, g, b, \sigma)
$$

where $x$ is a 3D position, $d$ is a viewing direction, and the output is view-dependent color + density.

One MLP for the entire scene.

### Training:

* Input = posed RGB images (camera intrinsics + extrinsics)
* For each pixel:

  * Cast a ray
  * Sample N points along the ray
  * Query the MLP at each point
  * Volume render the RGB
  * Compare to ground truth pixel
  * Backpropagate across all rays

> "NeRF doesn’t build geometry — it learns how light behaves in 3D space."

It’s an **implicit model** — the scene is encoded in the weights.

### What I Got Wrong (Initially):

* Thought MLPs were per-pixel — false. One global MLP.
* Misunderstood volume rendering — now clear it's the integration of light along a ray.
* Didn’t get why multiple samples are needed — now I see it’s to handle occlusion and variation.

---

## ✅ My Model of Gaussian Splatting

### Summary

GS is a **proxy-based renderer** using **3D Gaussian ellipsoids**.

Each Gaussian $\mathcal{G}_i$ has:

* Position $\mu_i$
* Covariance $\Sigma_i$
* Color (RGB or Spherical Harmonics)
* Opacity + visibility weights

### Training:

* Input = point cloud + posed RGB images
* Initialize one Gaussian per point
* Render all Gaussians per view
* Backpropagate loss w\.r.t. all Gaussian attributes

### Inference:

* Freeze Gaussians
* For any novel view:

  * Project Gaussians
  * Blend using alpha composition

> "Rendering = projection, not sampling. No MLP. No integration."

---

## 🔁 Core Contrast

| Aspect              | NeRF                       | Gaussian Splatting           |
| ------------------- | -------------------------- | ---------------------------- |
| Representation      | Implicit function via MLP  | Explicit proxy via Gaussians |
| Geometry            | Encoded in weights         | Encoded in positions/shapes  |
| Rendering           | Ray sampling + integration | Projection + alpha blending  |
| Training Inputs     | Posed images               | Images + point cloud         |
| Inference Time      | Slow (unless optimized)    | Real-time                    |
| Editable Components | Hard                       | Modular + intuitive          |

---
### 2025 - 08 - 06
---
