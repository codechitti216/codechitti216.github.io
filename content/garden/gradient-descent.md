---
title: "Why Gradient Descent Works (And When It Doesn't)"
date: "2025-08-17"
tier: "seed"
status: "planned"
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

## So Why Doesn't Everyone Use Newton's Method?

Because it doesn't scale.

The Hessian is an $N \times N$ matrix, where $N$ is the number of parameters. A model with 1 million parameters needs a Hessian with 1 trillion entries. Storing it requires $O(N^2)$ memory. Inverting it costs $O(N^3)$ computation. For modern neural networks with billions of parameters, this is impossible.

Gradient descent is $O(N)$. One gradient, one update, done.

So gradient descent wins — not because it's mathematically correct, but because it's cheap enough to iterate. Each step ignores cross-parameter interactions, but the steps are so cheap that we can take millions of them. Newton's method gets the answer in fewer steps, but each step costs more than the entire gradient descent training run.

## Seeing It In Practice

Let's move from toy functions to a real dataset. We'll train a linear regression model on the diabetes dataset using both gradient descent and Newton's method, and watch the difference unfold.

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/codechitti216/codechitti216.github.io/blob/main/public/notebooks/gradient-descent.ipynb)

We use sklearn's diabetes dataset — 442 patients, 1 feature (BMI), 2 learnable parameters (slope + intercept). Small enough that the Hessian is a 2×2 matrix we can inspect by hand.

The loss function is MSE:

$$L(\mathbf{w}) = \frac{1}{n}\|X\mathbf{w} - \mathbf{y}\|^2$$

**Gradient descent** computes the gradient — partial derivatives assuming the other weight is constant — and updates both weights simultaneously:

```python
def gradient_descent(X, y, lr, n_steps):
    n = X.shape[0]
    w = np.zeros(X.shape[1])

    for step in range(n_steps):
        residuals = X @ w - y
        grad = (2 / n) * X.T @ residuals  # each component assumes the other is constant
        w = w - lr * grad                  # update both simultaneously
    return w
```

**Newton's method** uses the Hessian to adjust the gradient, accounting for cross-parameter interactions:

```python
def newtons_method(X, y, n_steps):
    n = X.shape[0]
    w = np.zeros(X.shape[1])

    H = (2 / n) * X.T @ X       # Hessian — includes the cross-term
    H_inv = np.linalg.inv(H)

    for step in range(n_steps):
        residuals = X @ w - y
        grad = (2 / n) * X.T @ residuals
        w = w - H_inv @ grad     # Hessian-adjusted update
    return w
```

The result: Newton's method reaches the exact minimum in **1 step**. Gradient descent takes ~50 steps to get close. And with a learning rate that's too large, gradient descent doesn't just converge slowly — the loss explodes. That's the backfire, on real data.

The Hessian for this problem has a non-zero off-diagonal entry — the parameters *are* entangled. Gradient descent ignores this. Newton's method uses it. The difference is visible in the loss curve, the weight trajectory, and the number of steps to convergence.

The full notebook walks through every step with plots — loss curves, weight-space trajectories, and the fitted regression lines. Open it in Colab and run it yourself.

*Coming soon: why SGD's noise from mini-batches might actually help generalization, and how the learning rate schedule partially compensates for what the Hessian would have given us.*
