---
title: "Why Gradient Descent Works (And When It Doesn't)"
date: "2025-08-17"
tier: "note"
status: "planned"
published: true
---

When we call `loss.backward()` in PyTorch, a `.grad` value is computed for every parameter in our model. But what actually is that `.grad` value? Let's crack it open.

`.grad` is the partial derivative of the loss function with respect to that particular weight. So what's a partial derivative?

Take a simple function: $z = x^2 + y^2$. What is $\partial z / \partial x$? It's $2x$. The $y^2$ term disappears — becomes zero — because we assume $y$ is constant. Similarly, $\partial z / \partial y = 2y$, because now we assume $x$ is constant and the $x^2$ term drops to zero.

That's what PyTorch computes for every single weight in our model. For each weight, it asks: "If I nudge *just this weight* while holding everything else fixed, how does the loss change?"

We then update the weight using this gradient along with the learning rate and optimizer state. But here's the thing — the underlying assumption when we compute `.grad` for any given weight is that *all the other weights stay constant*. 

Are they staying constant? No. Every weight updates simultaneously.

So are we breaking our own assumptions? Is gradient descent just... wrong? Ideally, we'd need to account for the fact that all the other weights are also going to be updated when calculating the update for any one weight. Otherwise, aren't we cheating?
