---
title: "Embeddings From First Principles"
date: "2025-10-09"
tier: "note + notebook"
status: "completed"
published: true
---

Neural networks only work with numbers. Words are symbols. We need a mechanism to go from words to numbers — but not just any numbers. Numbers that carry meaning. Let's crack it open.

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/codechitti216/codechitti216.github.io/blob/main/public/notebooks/embeddings.ipynb)

## The Obvious Approach — Just Use a Dictionary

Say we bought a 30-rupee pocket dictionary on Church Street. It has 40 pages, maybe a few thousand words. Here's the obvious idea: assign each word a number. "Cat" is 1, "dog" is 2, "car" is 3. We have a lookup table — word in, number out.

But this breaks immediately. Someone writes "unfairly." It's not in our pocket dictionary. We have no number for it. We buy an Oxford dictionary — 500 pages, 170,000 words. That covers more, but someone writes "ChatGPT." Not in there either. A medical paper uses "pneumonoultramicroscopicsilicovolcanoconiosis." Not in any dictionary.

This is the **out-of-vocabulary (OOV) problem**. A whole-word vocabulary is brittle — any word not in the dictionary is invisible to the model. And language keeps creating new words. The vocabulary will never be complete.

We need a different unit. Not whole words — something smaller, something that can build any word we'll ever encounter.

## What's a Token?

We could split text into individual characters:

```
"unfairly" → ["u", "n", "f", "a", "i", "r", "l", "y"]
```

Our vocabulary is tiny — roughly 26 letters plus punctuation and special characters, maybe 40 tokens total. Every possible word can be built from these pieces. No word is ever "unknown."

But does it make sense to compute distance between letters? Does "u" mean something? Does "n"? A letter has no context, no meaning. We'd be forcing the model to learn from scratch that "u" followed by "n" sometimes signals negation ("unfair," "undo," "unlock") — a pattern that's obvious to us but invisible at the character level.

We want tokens that are **reusable, meaningful units**. "un" as a single token carries the concept of negation. "ly" signals an adverb. The model can learn these patterns once and reuse them across thousands of words. Characters alone make the model's job unnecessarily hard.

That's the tension: characters give us universal coverage but no meaning. Whole words give us meaning but break on anything unseen. We need something in between.

## BPE — Letting the Data Decide

Byte Pair Encoding (BPE) is a self-adapting tokenizer. It starts from characters and greedily builds up a vocabulary by merging the most frequently co-occurring pairs. The procedure:

1. **Start with characters** as the initial vocabulary
2. **Count every adjacent pair** across the entire corpus
3. **Merge the most frequent pair** into a new token — add it to the vocabulary
4. **Recount** all adjacent pairs (the corpus has changed because of the merge)
5. **Repeat** until the vocabulary reaches a target size (e.g., 30,000 tokens)

The old tokens stay. When we merge ("u", "n") into "un," we don't remove "u" or "n" from the vocabulary — they're still needed for words where "u" and "n" don't appear together.

After thousands of merges, common words end up as single tokens ("the," "cat," "and") while rare words get split into subword pieces ("un" + "fair" + "ly"). The vocabulary sits in the sweet spot between characters and whole words.

### The Ambiguity Question

Here's something that should bother us. After training, our vocabulary contains "u," "n," and "un." The word "unit" could theoretically be tokenized as:

```
Option A: ["u", "n", "i", "t"]
Option B: ["un", "i", "t"]
```

Both are valid segmentations given the vocabulary. Which one is correct?

BPE resolves this with the **merge rules** — applied in the same order they were learned. If merge rule #47 says "u + n → un," it fires before anything else. We always get Option B. Same word, same merges, same tokens, every time. The tokenization is deterministic.

But the vocabulary alone doesn't determine a unique tokenization. **The merge rules do.** Without them, we'd have a bag of tokens and no instructions for how to use them. The merge rules aren't a nice-to-have — they're what makes the tokenizer well-defined.

This raises a deeper question: could we design a tokenizer where the vocabulary itself guarantees exactly one segmentation per word, with no disambiguation rules needed? For any vocabulary richer than single characters, the answer appears to be no — as soon as shorter tokens are substrings of longer ones (and they must be, for coverage), multiple segmentations become mathematically inevitable. The disambiguation mechanism — whether it's merge rules (BPE), probabilities (Unigram/SentencePiece), or linguistic rules — is inescapable.

### The Inherent Bias

There's a more uncomfortable problem. The merge rules are learned from a specific corpus. Whatever text BPE sees most frequently determines which pairs get merged — which means the "ground truth" tokenization of any word is not objective. It's a statistical artifact shaped by the training data.

Train BPE on a medical corpus and "unfairly" might become "un" + "fair" + "ly." Train it on a legal corpus and it might become "un" + "fairly." Train it on a coding corpus and the splits change again. Different corpus, different merge rules, different tokenization of the exact same word. That's not ground truth — that's a data-dependent choice pretending to be ground truth.

And this choice propagates. The tokenization determines what tokens the model sees, which determines what patterns it can learn, which determines its performance. A decision made by counting character pairs in a corpus — before the model exists — silently shapes everything downstream.

Now we have tokens. How do we turn them into numbers?

## From Tokens to Vectors — The One-Hot Dead End

Here's the obvious encoding: count every token in the vocabulary, assign each one a unique index, and create a vector where that index is 1 and everything else is 0.

That's a **one-hot encoding**. For a vocabulary of 4 tokens — *cat, dog, car, fish* — it looks like this:

```
cat  = [1, 0, 0, 0]
dog  = [0, 1, 0, 0]
car  = [0, 0, 1, 0]
fish = [0, 0, 0, 1]
```

Each token is a unit vector along its own axis in $\mathbb{R}^V$, where $V$ is the vocabulary size. With a real vocabulary of 30,000 BPE tokens, each vector is 30,000-dimensional with a single 1 and 29,999 zeros.

The real problem is geometric. Compute the distance between any two one-hot vectors:

$$d(\text{cat}, \text{dog}) = \sqrt{(1-0)^2 + (0-1)^2 + 0 + 0} = \sqrt{2}$$

$$d(\text{cat}, \text{car}) = \sqrt{(1-0)^2 + 0 + (0-1)^2 + 0} = \sqrt{2}$$

Every pair is equidistant. "Cat" is exactly as far from "dog" as it is from "car." The representation carries no information about relationships between tokens — every token is equally unrelated to every other token. Even with infinite memory and compute, a model using one-hot inputs gets zero structural information from the representation. It must learn every single relationship from scratch, from raw training signal alone.

We need a representation where distance means something. But where does the meaning come from?

## You Are the Company You Keep

> "Tell me who your friends are, and I will tell you who you are."

Words have friends too. In the sentence "I fed the **cat** yesterday," the friends of "cat" are the words surrounding it — *I, fed, the, yesterday*. This is called a **context window**.

![A word circled in a sentence with arrows pointing to its neighboring words, labeled as its "context window"](placeholder-context-window.png)

Now look at these two sentences:

```
"I fed the cat yesterday"
"I fed the dog yesterday"
```

"Cat" and "dog" have the same friends here. And this isn't a one-off — across thousands of sentences, they keep showing up in the same neighborhoods: "the ___ ran," "pet the ___," "the ___ sat on the mat."

Why does this matter? Because if we can **substitute** one word for another and the sentence still makes sense, those words must share functional properties. "Cat" and "dog" are both things we feed, things that run, things we pet. Their interchangeability in context is evidence that they carry similar meaning.

This is the **distributional hypothesis**, stated by linguist J.R. Firth in 1957: *"You shall know a word by the company it keeps."* Co-occurrence in similar contexts is a proxy for semantic similarity — not because of some deep philosophical reason, but because substitutability implies shared function.

### Where It Gets Shaky

It's not perfect. "The cat attacked the dog" and "the dog attacked the cat" have the same words in the same context, but "cat" and "dog" play different roles. Co-occurrence captures relationships, not just similarity.

And there's a deeper concern: we're *hoping* these misleading cases are rare enough that they don't corrupt the signal. Is that justified? The law of large numbers says yes — if we average over enough examples, the noise cancels out and we converge to the true signal. But this guarantee is only as strong as the data. Common words that appear in thousands of contexts get reliable signal. Rare words that appear a handful of times are fragile — a few misleading contexts can seriously distort their representation.

The distributional hypothesis works **in proportion to how much data we have for each word.** That's an honest limitation. But for the words that matter most — the common ones — it works remarkably well.

That's the insight. Now we need the machine.

## The Machine — How Word2Vec Learns Structure

Word2Vec (Mikolov et al., 2013) operationalizes the distributional hypothesis. It turns "words with similar contexts should be similar" into a training objective.

### Two Embeddings Per Word

Every word gets two vectors — an **input embedding** $v$ used when the word is the center, and an **output embedding** $u$ used when it appears as context. Why two? Because context relationships aren't symmetric. "The" appears in the context of almost everything — it's a nearly universal neighbor. "Cat" is specific. When "cat" is center, "the" should score high as context. But when "the" is center, "cat" is no more special than any other noun. Two vectors let the model capture this asymmetry.

After training, we throw away the output embeddings. The input embeddings become the final word vectors — a lookup table whose geometry was sculpted by context.

### The Task: Skip-Gram

Slide a window across the text. At each position, pick a center word and look at its neighbors:

```
"the  [cat]  sat  on  the  mat"
       ^
    center    context: the, sat, on
```

The model's task: given the center word "cat," predict that "the," "sat," and "on" are likely to appear nearby. No labels, no human annotation — just a word and its neighbors.

### Measuring Compatibility

How does the model decide whether two words belong together? It computes the **dot product** of their vectors:

$$\text{compatibility}(\text{cat}, \text{sat}) = v_{\text{cat}} \cdot u_{\text{sat}} = \sum_{i=1}^{d} v_{\text{cat}}^{(i)} \cdot u_{\text{sat}}^{(i)}$$

High dot product means "these words belong together." Low means "they don't."

To turn this into a probability, we'd use a softmax — normalize over the entire vocabulary:

$$P(w_o \mid w_c) = \frac{\exp(v_{w_c} \cdot u_{w_o})}{\sum_{j=1}^{V} \exp(v_{w_c} \cdot u_j)}$$

But that denominator requires computing a dot product with every word in the vocabulary — all 50,000 of them — for every single training example. With billions of training examples, this is computationally fatal.

### The Shortcut: Negative Sampling

Instead of comparing against the entire vocabulary, negative sampling reformulates the problem. For each real pair that appeared together in the text, take 5–10 random words that *didn't* appear in the context and push them apart. The loss:

$$\mathcal{L} = -\log \sigma(v_{w_c} \cdot u_{w_o}) - \sum_{i=1}^{k} \log \sigma(-v_{w_c} \cdot u_{w_i})$$

where $\sigma$ is the sigmoid function. The first term pulls the real pair together — makes their dot product large. The second term pushes random anti-neighbors apart — makes their dot products negative.

This is **contrastive learning** — one of its earliest forms. SimCLR, CLIP, and every modern contrastive method uses the same skeleton: push positives together, push negatives apart.

### Who Gets Updated?

For each training sample, three kinds of vectors receive gradients:

| Vector | Updated by | Direction |
|---|---|---|
| Center word (input) | Pull + push gradients | Toward context, away from negatives |
| Context word (output) | Pull gradient only | Toward center |
| Negative words (output) | Push gradient only | Away from center |

Every vector that participated in the loss gets a gradient. The center word feels both forces. The context word gets pulled closer. The negative samples get pushed away.

### Why Don't Random Negatives Break It?

If we randomly pick "dog" as a negative sample for "cat," we're telling the model to push them apart. But they're similar — doesn't this corrupt the training?

Probability saves us. With 50,000 words and 5 negative samples, the odds of picking "dog" for any given "cat" example are about 1 in 10,000. And even when it happens, "cat" and "dog" appear as *positive* pairs far more often throughout the corpus. The real signal overwhelms the noise — the same principle that makes the distributional hypothesis work in the first place.

After enough iterations, words that share contexts cluster together, and the geometry of the embedding space encodes the patterns of the language.

But there's something deeper going on than just clustering.

## The Geometry — Why Arithmetic Works

The push-pull dynamic explains why similar words cluster together. But Word2Vec embeddings exhibit something stronger than clustering: **vector arithmetic**.

```
king - man + woman ≈ queen
paris - france + japan ≈ tokyo
walked - walking + swimming ≈ swam
```

Subtracting and adding vectors produces semantically meaningful results. Why?

### Directions Encode Relationships

The training process doesn't just learn where words are — it learns that certain **directions** in the space correspond to consistent relationships. Across many word pairs:

```
king  - queen  ≈ D
man   - woman  ≈ D
uncle - aunt   ≈ D
```

The vector $D$ encodes gender. Not because anyone labelled it — but because male and female words systematically differ in the same contexts ("he" vs "she," "his" vs "her"), and the training process pushes those consistent contextual differences into a consistent geometric direction.

So `king - man + woman` works by decomposition:

1. `king - man` = isolate what makes king different from man → **royalty**
2. `+ woman` = add back the gender component
3. `= queen` — a royal woman

We're subtracting one attribute and swapping in another. This works because different semantic relationships live along different directions in the space, and those directions are approximately **independent** of each other.

### Why Linear? The Model Is Shallow.

Why are relationships encoded as clean linear directions instead of some tangled nonlinear mess? Because the skip-gram model has no hidden layers, no activation functions between the input and output embeddings. The entire model is a single dot product — a linear operation. The model has no nonlinear tools to encode relationships. The *only way* it can express "king is to queen as man is to woman" is by making the difference vectors point in the same direction.

### Does the Sigmoid Break This?

But wait — the loss function uses a sigmoid. That's a nonlinearity. Does it contaminate the linear structure of the embeddings?

There's a theoretical counter-argument: the gradient that updates each word vector always takes the form $\alpha \cdot u_{w}$ — a scalar times another word's vector. The sigmoid determines the scalar $\alpha$ (how much to move), but the direction of movement is always along another word's vector. The nonlinearity modulates step sizes; it never contaminates the geometry.

That's a clean argument. But does it hold up in practice? The notebook runs three ablations to find out:

1. **Sigmoid vs linear loss** — train with and without the sigmoid. Do both learn the same cluster structure?
2. **Input vs output embeddings** — each word has two vectors during training. A word has one meaning. Do both vectors learn the same relationships?
3. **Two vectors vs one** — train with a single embedding per word, used for both center and context roles. Does it learn the same structure?

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/codechitti216/codechitti216.github.io/blob/main/public/notebooks/embeddings.ipynb)

### Direction vs Magnitude

In the learned space, **direction** encodes meaning and **magnitude** is largely a training artifact — common words like "the" accumulate more gradient updates and tend to have larger vectors. This is why cosine similarity (which normalizes by magnitude) is preferred over raw dot product when comparing embeddings:

$$\text{cosine}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$

Cosine strips out the frequency effect and measures purely directional similarity.

### High Dimensions Are a Blessing

A 300-dimensional space might sound excessive, but high dimensionality is what makes the rich geometry possible. Each independent semantic relationship — gender, royalty, animacy, tense, plurality — needs its own direction. In 2 dimensions, we'd run out of orthogonal directions immediately. In 300 dimensions, hundreds of relationships can coexist without interfering with each other.

The model doesn't use all 300 dimensions equally — the effective structure might occupy 50–100 meaningful directions, with the rest carrying noise. But having the extra room means the model never has to compromise, never has to smash two unrelated relationships into the same direction.

## Where This Breaks

Word2Vec is a static lookup table. One word, one vector, forever. This breaks in an obvious way: the same word can have completely different meanings depending on context.

"Bank" in "I sat by the river bank" and "I went to the bank to deposit money" gets the same vector. The lookup table doesn't know which sentence it's in — it returns the same fixed point in space regardless. That single vector is some average of the river meaning and the money meaning, which accurately represents neither.

This isn't a data problem. More training data won't fix it. It's a structural limitation: the embedding is looked up, not computed. Context shaped the vector during training, but the vector can't adapt to new context at inference time.

### What Came Next

Later models — ELMo, BERT, GPT — fix this by abandoning the lookup table entirely. Instead of retrieving a fixed vector, they run the **entire sentence** through a neural network and compute a different vector for each word depending on its surroundings.

Each word's representation gets updated by looking at every other word in the sentence. "Bank" in "river bank" gets pulled toward the waterway meaning by the presence of "river." "Bank" in "deposit money" gets pulled toward the financial meaning by "deposit." The embedding is no longer looked up — it's **computed from the sentence**.

The mechanism that enables this — attention — lets each word ask "which other words in this sentence should influence my meaning?" and weight them accordingly. That's a story for another post.
