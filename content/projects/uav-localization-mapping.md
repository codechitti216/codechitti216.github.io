---
title: "UAV Localization and Mapping"
date: "2024-07-01"
status: "Completed"
tags: ["3D Perception", "LiDAR", "RGB", "Point Clouds", "UAV"]
institution: "IIIT Bangalore"
duration: "Jul 2024 - Dec 2024"
---

# UAV Localization and Mapping

## Overview

Implemented KPConv and PointNet++ pipelines for 3D segmentation using LiDAR and RGB imagery. Benchmarked across KITTI, NuScenes, and SemanticKITTI datasets with focus on UAV applications.

## Key Achievements

- **3D Segmentation**: Implemented state-of-the-art point cloud segmentation methods
- **Multi-Modal Fusion**: Designed RGB-LiDAR alignment module
- **Benchmark Performance**: Evaluated across multiple standard datasets
- **Real-time Processing**: Optimized for UAV deployment constraints

## Technical Implementation

### Deep Learning Models
- **KPConv**: Kernel Point Convolution for point cloud processing
- **PointNet++**: Hierarchical neural network for point set processing
- Custom architectures for UAV-specific requirements

### Sensor Fusion
- RGB-LiDAR alignment module using SIFT + FLANN
- Calibration matrix optimization
- Runtime and accuracy optimization

### Datasets
- **KITTI**: Autonomous driving dataset
- **NuScenes**: Large-scale autonomous driving dataset
- **SemanticKITTI**: Semantic segmentation benchmark

## Technical Details

### RGB-LiDAR Alignment
- SIFT feature detection and matching
- FLANN-based nearest neighbor search
- Calibration matrix utilization for precise alignment
- Performance optimization for real-time processing

### Performance Metrics
- Segmentation accuracy across different object classes
- Runtime performance analysis
- Memory usage optimization for UAV deployment

## Technologies Used

- KPConv (Kernel Point Convolution)
- PointNet++ architecture
- SIFT feature detection
- FLANN matching algorithms
- Point cloud processing libraries
- Multi-modal sensor fusion

## Impact

This project advanced the state of UAV-based 3D perception by combining cutting-edge deep learning techniques with practical sensor fusion approaches. The work demonstrates effective integration of RGB and LiDAR data for robust 3D understanding in UAV applications.

