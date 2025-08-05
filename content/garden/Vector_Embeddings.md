---
title: "Understanding Embeddings"
date: "2025-08-01"
tags: ["Embeddings", "Machine Learning", "Vectors", "Cosine Similarity", "Neural Networks"]
status: "ongoing"
kind: "learning"
published: true
visibility: "public"
evolution:
  - date: "2024-08-01"
    note: "Initial exploration of word embeddings and their mathematical foundations."
  - date: "2024-08-01"
    note: "Extended to vision embeddings and cross-modal applications."
  - date: "2025-08-01"
    note: "Validated effectiveness through systematic experimentation and comparison."
  - date: "2025-07-31"
    note: "Led to formal hypothesis about cosine similarity and sparsity - see research post: Investigating Cosine Similarity Robustness with Sparse Embeddings"
---

# My Interactive Learning Journey into Embeddings

## Conceptual Foundation: What Are Embeddings?

To me, embeddings started as a mysterious concept. But I gradually began to see them as **compact vector representations** of complex entities—like words, images, or even people.

I first thought of real-world analogies:

* **Grades** are like embeddings—they compress a student’s entire semester into a few numbers that reflect proficiency.
* For products, an embedding could be the combination of its history, user interactions, and metadata.

That clicked: **embeddings = learned summaries** that help machines understand similarity or structure in data.

## Why Are Embeddings Useful for Machines?

I realized that embeddings allow machines to operate on **geometry**. They turn messy, symbolic data into structured spaces where you can compute distances, angles, and directions. This enables search, recommendation, reasoning, and clustering.

## Mathematical Intuition: Geometry Behind Embeddings

I explored the vector space view:

* **Vectors**: Each entity becomes a point in a high-dimensional space.
* **Distances and angles** matter. I understood that:

  * Dot product measures alignment.
  * Cosine similarity normalizes magnitude and focuses on **direction**.

I initially thought distance alone was enough, but then realized:

> "Cosine similarity tells you how aligned two embeddings are—important when you care about similarity in intent, not just magnitude."

A flaw I identified: Cosine similarity may fail when embeddings have zeros across some dimensions, even if they share strong alignment in others.

## How Embeddings Are Learned

This part felt magical at first. I slowly unpacked it through examples:

* **Supervised learning**: Like classifying images—backprop guides the embedding to separate classes.
* **Unsupervised**: Like clustering sentences by topic without labels.
* **Self-supervised**: This was a revelation.

I dove into tasks like **predicting the next word**. It felt naive at first—"Just predicting A or B? That’s language understanding?" But I slowly realized:

> These tasks force the model to **capture structure** in the data. Predicting next words encodes grammar, syntax, and semantics—just implicitly.

I built up the mental image:

* We start with a **learnable matrix**—one row per word.
* Each word is mapped to a vector.
* For "The cat sat on...", we average or pool the vectors and predict the next word (e.g., "mat").

Through **cross-entropy**, we guide which embeddings should shift. If we predict wrong, the vectors for "the" and "cat" are nudged.

At some point, it clicked:

> The embedding table is like a CNN filter—**a trainable map from discrete input to continuous space**.

Padding? Just a dummy vector. And yes, repeated inputs like `"<pad>, <pad>"` don't confuse the model—because ground truth varies, and the model learns **distributions**, not hard rules.

## What I Now Understand

### ✅ Conceptual Meaning

I have a solid grasp: Embeddings = vector forms of data that reflect **relational meaning**.

### ✅ Mathematical Intuition

Comfortable with vectors, dot product, cosine similarity, and how geometry translates to machine reasoning.

### 🟡 How Embeddings Are Learned

I understand the pipeline, but want to deepen my grasp of **losses like contrastive/triplet**, and more diverse architectures.

### 🟡 Practical Applications

I know about word embeddings and image similarity, but haven’t built many end-to-end systems yet. Still need to apply this knowledge hands-on.

## Gaps I Still Have

* I wasn’t fully clear on how loss propagates through embedding tables at first.
* I initially underestimated the sophistication of self-supervised tasks.
* I haven’t yet explored multi-modal embeddings (like combining vision and text).

## What’s Next for Me

* 🔬 Implement **contrastive loss** and **triplet loss** training from scratch.
* 🔍 Explore **BERT-style masked language models** to see embeddings evolve in deep stacks.
* 📚 Read up on **representation collapse**, **embedding regularization**, and **center loss**.
* 🛠️ Build a toy recommendation system using user/item embeddings.

---

Embeddings used to feel abstract. Now they feel alive—shaped by data, evolving with tasks, and powerful in their simplicity. I want to keep building intuition through **code**, **failure**, and **curiosity**.
