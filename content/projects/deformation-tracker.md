---
title: "Deformation Tracker - Civil Structures"
date: "2024-06-01"
status: "Completed"
tags: ["Computer Vision", "Material Testing", "Displacement Analysis", "Civil Engineering"]
institution: "Independent Project"
duration: "2024"
---

# Deformation Tracker - Civil Structures

## Overview

Built a tool to extract displacement vectors from video footage of material compression in a Universal Testing Machine (UTM). Achieved 0.2 mm accuracy across 7 video samples with comprehensive analysis capabilities.

## Key Achievements

- **High Precision**: Achieved ±0.2 mm accuracy against ground truth
- **Multi-Point Tracking**: Support for simultaneous tracking of multiple points
- **Comprehensive Analysis**: Generated displacement, velocity, and acceleration graphs
- **Real-time Processing**: 30 FPS video processing capability

## Technical Implementation

### Computer Vision Approach
- Manual white dot marking for maximum intensity difference
- Advanced tracking algorithms for sub-pixel accuracy
- Scale calibration using known reference distances

### Analysis Capabilities
- **Displacement Tracking**: Real-time position monitoring
- **Velocity Calculation**: First derivative of displacement
- **Acceleration Analysis**: Second derivative for dynamic behavior
- **Multi-point Selection**: User-defined regions of interest

## Methodology

### Scale Calibration
- User-selectable reference points with known distances
- Multiple reference measurements for improved accuracy
- Automatic scale factor calculation and validation

### Tracking Algorithm
- White dot detection using intensity thresholding
- Sub-pixel tracking for enhanced precision
- Temporal consistency validation

### Ground Truth Validation
- UTM ground truth accurate to 10 decimals
- 100Hz sampling rate comparison
- Camera synchronization at 30 FPS

## Performance Metrics

- **Accuracy**: 0.2 mm average across different materials
- **Precision**: Consistent performance across 7 test videos
- **Frame Rate**: 30 FPS processing capability
- **Reliability**: Robust tracking under varying lighting conditions

## User Interface Features

- Interactive point selection
- Real-time graph generation
- Export capabilities for analysis data
- Scale calibration interface

## Technologies Used

- Computer Vision algorithms
- Image processing techniques
- Real-time tracking systems
- Data visualization tools
- User interface development

## Applications

- Material testing and analysis
- Structural health monitoring
- Quality control in manufacturing
- Research in material properties
- Educational demonstrations

## Impact

This tool provides civil engineers and researchers with a cost-effective, high-precision method for analyzing material deformation. The 0.2 mm accuracy rivals expensive specialized equipment while offering greater flexibility and ease of use.

