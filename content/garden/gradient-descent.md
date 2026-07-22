---
title: "Why Gradient Descent Works (And When It Doesn't)"
date: "2025-08-17"
tier: "note"
status: "completed"
published: true
---

When we call `loss.backward()` in PyTorch, a `.grad` value is computed for every parameter in our model. But what actually is that `.grad` value? Let's crack it open.

`.grad` is the partial derivative of the loss function with respect to that particular weight. So what's a partial derivative?

Take a simple function: $z = x^2 + y^2$. What is $\partial z / \partial x$? It's $2x$. The $y^2$ term disappears — becomes zero — because we assume $y$ is constant. Similarly, $\partial z / \partial y = 2y$, because now we assume $x$ is constant and the $x^2$ term drops to zero.

Notice that in this function, $x$ and $y$ don't interact at all — there's no term where they appear together. Now consider $z = x^2 + xy + y^2$. Here, $\partial z / \partial x = 2x + y$ — the derivative *depends on* $y$. And $\partial z / \partial y = x + 2y$ — it depends on $x$. The variables are entangled. Changing one affects how much the other matters.

That's what PyTorch computes for every single weight in our model. For each weight, it asks: "If I nudge *just this weight* while holding everything else fixed, how does the loss change?"

We then update the weight using this gradient along with the learning rate and optimizer state. But here's the thing — the underlying assumption when we compute `.grad` for any given weight is that *all the other weights stay constant*.

Are they staying constant? No. Every weight updates simultaneously.

So are we breaking our own assumptions? Is gradient descent just... wrong? Each weight's update was computed in a world where it's the only thing changing. But in reality, everything changes at once. Each update is optimistic — it assumes a frozen landscape that doesn't actually exist. And when variables are entangled like in our $xy$ example, those updates could interfere. Not just suboptimally, but destructively — the loss could go *up* instead of down.

That's the backfire.

## Proving the Backfire

Let's see it happen. Take our entangled function $z = x^2 + xy + y^2$, starting at $x = 1, y = 1$. The loss is $z = 3$.

The gradients are $\partial z / \partial x = 2(1) + 1 = 3$ and $\partial z / \partial y = 1 + 2(1) = 3$.

With a learning rate of $\eta = 0.8$:

- **Update only $x$:** $x_{new} = 1 - 0.8 \times 3 = -1.4$, $y$ stays at $1$. New $z = 1.96 - 1.4 + 1 = 1.56$. Loss went **down**.
- **Update only $y$:** $y_{new} = -1.4$, $x$ stays at $1$. New $z = 1 - 1.4 + 1.96 = 1.56$. Loss went **down**.
- **Update both simultaneously:** $x_{new} = -1.4$, $y_{new} = -1.4$. New $z = 1.96 + 1.96 + 1.96 = 5.88$. Loss went **up**.

Each update individually reduces the loss from $3$ to $1.56$. Together, they nearly double it to $5.88$. The cross-term $xy$ is the culprit — when both variables shift by a large amount in the same direction, the interaction amplifies the error.

But does this *always* happen? Can we find a scenario where simultaneous updates are always worse, regardless of the learning rate?

With $\eta = 0.1$:

- **Update only $x$:** $z = 0.49 + 0.7 + 1 = 2.19$
- **Update only $y$:** $z = 1 + 0.7 + 0.49 = 2.19$
- **Update both:** $z = 0.49 + 0.49 + 0.49 = 1.47$

Simultaneous is *better*. Not just safe — actively better than updating one at a time.

No matter what function we try, we can always find a small enough learning rate where simultaneous updates outperform individual ones. The backfire is real, but it's not inevitable — it depends on how far we step.

## The Gradient Is Missing Information

But this feels like a workaround. "Just use a small learning rate" doesn't address the fundamental problem: each `.grad` was computed assuming other weights are constant, and they're not. We're being too optimistic in our approach. Ideally, we'd take the updates of all the other weights into consideration when calculating the update for any one weight.

There is an approach that does exactly this. It's called **Newton's method**.

Instead of $\Delta \mathbf{w} = -\eta \nabla f$, Newton's method uses $\Delta \mathbf{w} = -H^{-1} \nabla f$, where $H$ is the **Hessian** — a matrix of all second-order partial derivatives, including every cross-term between every pair of weights. The Hessian captures exactly what gradient descent ignores: how changing one weight affects the optimal update for another.

Let's try it on our example. $z = x^2 + xy + y^2$ at $(1, 1)$:

The Hessian is:

$$H = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$$

Its inverse:

$$H^{-1} = \frac{1}{3}\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix}$$

Newton's update:

$$\Delta \mathbf{w} = -H^{-1} \nabla f = -\frac{1}{3}\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix}\begin{pmatrix} 3 \\ 3 \end{pmatrix} = -\begin{pmatrix} 1 \\ 1 \end{pmatrix}$$

New weights: $(1, 1) - (1, 1) = (0, 0)$. $z = 0$.

The exact minimum. In one step. No learning rate to tune.

Newton's method accounts for the cross-parameter interactions that gradient descent ignores, and finds the optimal update for all weights simultaneously. This is the "correct" approach — it doesn't break the constant-weight assumption because it never makes that assumption in the first place.

## What If We Don't Break the Assumption?

There's a third option. What if we update only *one* weight per step — the one with the largest gradient — and leave everything else untouched? That way, the "hold others constant" condition is genuinely satisfied. The other weight really does stay constant.

This is called **coordinate descent**. It's correct by construction. But with $N$ parameters, you'd need $N$ steps just to touch each weight once. For a model with a million parameters, that's a million steps per round. Unusable at scale.

## So Why Doesn't Everyone Use Newton's Method?

Because it doesn't scale either.

The Hessian is an $N \times N$ matrix, where $N$ is the number of parameters. A model with 1 million parameters needs a Hessian with 1 trillion entries. Storing it requires $O(N^2)$ memory. Inverting it costs $O(N^3)$ computation. For modern neural networks with billions of parameters, this is impossible.

Gradient descent is $O(N)$. One gradient, one update, done.

So we have three approaches:

- **Newton's method** — correct, accounts for all interactions, but $O(N^3)$ per step. Doesn't scale.
- **Coordinate descent** — correct, never breaks the assumption, but needs $N$ steps per round. Doesn't scale.
- **Gradient descent** — breaks the assumption, ignores cross-parameter interactions, but $O(N)$ per step. Cheap enough to run millions of times.

Gradient descent wins — not because it's mathematically correct, but because it's cheap enough to iterate.

## Seeing It In Practice

The companion notebook runs all three methods on the same $z = x^2 + xy + y^2$ function from this post. Starting at $(1, 1)$, after 50 steps:

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/codechitti216/codechitti216.github.io/blob/main/public/notebooks/gradient-descent.ipynb)

| Method | Loss after 50 steps | Breaks assumption? |
|---|---|---|
| Newton's method | 0.000000 (1 step) | No |
| Gradient descent | 0.142658 | Yes |
| Coordinate descent | 0.659274 | No |

Newton gets the exact answer in 1 step. Gradient descent is 4.6x better than coordinate descent after the same number of steps. The "wrong" approach beats the "correct" one — because it updates all weights at once, even though each update assumes the others won't change.

Open the notebook in Colab and run it yourself.

*Coming soon: why SGD's noise from mini-batches might actually help generalization, and how the learning rate schedule partially compensates for what the Hessian would have given us.*
