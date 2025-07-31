---

title: "Understanding Embeddings: From Vectors to Meaning in Neural Representations"
date: "2025-07-31"
tags: \["Embeddings", "Neural Representations", "Word Vectors", "Cross-Entropy", "Learning Intuition"]
status: "learning-log"
----------------------

# Conceptual Foundations of Embeddings

## 1. What are Embeddings?

Embeddings are **dense vector representations** of discrete input tokens (e.g., words, item IDs, users) that allow neural networks to operate over them geometrically.

Instead of using one-hot vectors, which are sparse and uninformative, we use:

```math
x_{\text{word}} = \text{Embed}(i) \in \mathbb{R}^d
```

* Where `i` is the index of the word in the vocabulary.
* `Embed` is a lookup table — a learnable matrix of shape `(V, d)` where `V` is vocab size.

Embeddings map symbolic objects to **points in a vector space**, where **distance and direction** encode semantic similarity and relationships.

---

## 2. Embeddings as Learnable Parameters

You explored how:

* The embedding matrix is initialized randomly.
* During training, **only the rows (vectors) used in the forward pass** are updated via backpropagation.
* This is analogous to how CNN filters are tuned — embeddings are **task-dependent representations**.

The insight that embeddings aren’t static dictionaries, but **actively shaped by data and loss**, was a key conceptual shift.

---

## 3. Embeddings in a Word Prediction Model

You walked through a toy model that predicts the next word given a fixed-size context window (e.g., 2 words). The architecture:

* Embedding layer (for each context word)
* Concatenation of embeddings
* Linear projection
* Softmax over vocabulary
* Cross-entropy loss with true next word

```math
\mathcal{L} = -\log P_{\theta}(w_{t+1} \mid w_{t-1}, w_t)
```

Training reshapes the embedding vectors so that **similar contexts** lead to high probability on the correct next word.

---

## 4. Padding, Repetition & Confusion

You raised important questions:

> “If input is always `PAD, PAD`, won’t the model always predict the same thing?”

And:

> “Won’t the model get confused if the same input sometimes leads to different targets?”

We clarified:

* In early positions, padding causes degenerate inputs like `[PAD, PAD] → ‘The’`.
* However, **diversity of training samples** ensures the model doesn't collapse. Over time, the model learns to rely on stronger signals than padding.
* Also, softmax doesn't predict *one answer*, it predicts a distribution — so **variation is expected and handled probabilistically**.
* With **cross-entropy**, the model doesn’t “confuse” but rather **learns a weighted average of possibilities**, refining estimates with more context.

---

## 5. Why Cross-Entropy is Critical

You concluded:

> “Without cross-entropy, LLMs are bullshit with RMSE losses… right?”

Absolutely. RMSE or MSE assumes regression. But **language is categorical** and requires a probability distribution over discrete tokens.

Cross-entropy is fundamental because:

* It measures divergence between predicted and true distributions.
* It provides rich gradients for **classification tasks with large vocabularies**.
* It is differentiable and stable for softmax outputs.

Using RMSE here would not only be wrong—it would be **semantically incoherent**.

---

## 6. Conceptual Summary of Your Learning

| Concept                       | Your Understanding   |
| ----------------------------- | -------------------- |
| What embeddings are           | ✅ Solid              |
| How they're learned           | ✅ Solid              |
| Vector geometry (distances)   | 🟡 Moderate          |
| Padding/inputs/contexts       | ✅ Nuanced questions  |
| Loss and probabilistic output | ✅ Good grasp         |
| Practical application         | 🟡 Emerging interest |

---

## 7. Next Steps Toward Mastery

Your curiosity is moving you from *symbolic intuition* to *geometric and practical reasoning*. To deepen:

### 📊 Visualize Word Embeddings

* Load GloVe or Word2Vec
* Reduce with PCA/t-SNE
* Explore analogies: `"king" - "man" + "woman"` = ?

### 🛠 Build a Toy Embedder

* Small dataset
* Train to predict next word (context window)
* Visualize how embeddings change over epochs

### 🧠 Sentence Embeddings

* Understand pooling (avg, max, CLS-token)
* Train your own with BERT/SentenceBERT
* Use them in tasks like similarity, clustering

### 🎯 Downstream Projects

* Embed users and products → recommendation
* Embed paragraphs → search engine
* Contrastive embedding → SimCLR/CLIP for image-text

---

*This journey reframed embeddings for you from being “just a layer” to a deep interplay between structure, probability, and learning. The next leap lies in seeing how they move — geometrically and semantically — across time and context.*
