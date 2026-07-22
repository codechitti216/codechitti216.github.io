---
title: "Why Doesn't Gradient Descent Backfire?"
date: "2025-08-17"
tags: ["Optimization", "Gradient Descent", "Mathematical Foundations"]
tier: "seed"
status: "planned"
published: true
---

When you compute the partial derivative of the loss with respect to one weight, you assume all other weights are constant. But they're not — every weight updates simultaneously. So how do you know the updates won't interfere destructively?

This is a question about the validity of the linear approximation under simultaneous perturbation. The answer involves learning rate bounds, Lipschitz smoothness, and loss landscape geometry.

*Coming soon.*
