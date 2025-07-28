---
title: "What happens when you train an Architecture on multiple loss functions?"
date: "2025-07-28"
tags: ["Multi Task Learning", "Learning Mechanism", "Explorations", "Thoughts", "Adaptation"]
status: "ongoing"
---

# Fundamental issues in Multi Task Learning

## What is MTL?

Lets take human perception when we are driving in traffic for instance. We are doing multiple tasks at once... Object Detection, Obstacle Avoidance, Depth Estimation, Planning.. 

Mimicking this through architecture and enabling one architecture/model to learn multiple tasks at once is called multi task learning. 

## How is MTL enabled? 

Learning is often associated with optimising the error you make. So, multi task learning is enabled by? You guessed it right.. Multiple Loss functions. 

When multiple loss functions are associated, the total loss which is back propagated is most oftenly a linear combination of the individual losses. 

The weights associated with each of these losses are either static (equal and unequal) but rarely dynamic. Some works have been done with deal with adaptive weighting strategies in the loss functions at training session. 

## Task complexity

Some tasks can be complex like normals calculation and some tasks can be simple like a regression loss optimisation.. So, the update on the model's weights based on the errors across both complex tasks and simple tasks without any normalisation would mislead the model and *GradNorm* focuses this problem. 

## Models Capacity

The entire point of training a model on data with a loss function is to get the best combination of weights of the architecture for the given data which understand the pattern across the dimension of the information space captured by the loss function. So, when we train a model on a data with static weights, it is practically analogous to say a school kid to ask him to give his best and leave the rest. 

Now, my intention during training is not to hold hands and pray god that the model optimises the loss across all the loss functions.. It is to enable it to understand the evolution of an individual loss value over epochs and time and enable the model to give preference on slow learning tasks or tasks which are hard to learn.. 

Though the formulation and the ideation are close to GradNorm, the intentions are completely different.. GradNorm tries to balance the effect of all the loss functions on the weights and My idea is to enable the model to become more analytical and agressive in its learning. 
