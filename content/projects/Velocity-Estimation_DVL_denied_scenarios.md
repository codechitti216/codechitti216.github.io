---
title: "Robust AUV Navigation through Hybrid Deep Learning and State Estimation"
date: "2025-05-28"
tags: ["AUV Navigation", "Deep Learning", "Sensor Fusion", "Kalman Filter", "State Estimation", "Robotics"]
status: "completed"
kind: "research"
published: true
visibility: "public"
institution: "IISc Bangalore"
duration: "June 2025"

# Research Fields
hypothesis: "Integrating deep learning models, specifically those with memory-augmented architectures, into traditional state estimation frameworks like Kalman filters can significantly improve the accuracy and robustness of AUV navigation, particularly in scenarios with sensor degradation, noise, and data dropouts common in underwater environments."
experiment:
  defined: true
  description: "A comprehensive, multi-stage experiment was designed to validate the hypothesis. First, several deep learning architectures (MLP, LSTM, FAN, and a custom Memory Neural Network - MNN) were trained to predict individual Doppler Velocity Log (DVL) beam measurements using historical IMU and partial DVL data from the A-Kit and Snapir datasets. This constituted 'Stage 1: Beam Prediction'. Second, the outputs of these models were integrated into two types of Kalman filters (EKF and UKF) using two different coupling strategies ('loosely coupled' and 'tightly coupled'). This was 'Stage 2: Position Estimation'. The performance of all four model architectures across all four integration strategies was systematically evaluated against ground truth data."
  baseline: "The baseline for comparison includes: 1) Traditional navigation solutions using only the raw, unfiltered sensor data. 2) Standard Extended Kalman Filter (EKF) and Unscented Kalman Filter (UKF) implementations without the deep learning-based sensor correction. 3) A simple Multi-Layer Perceptron (MLP) model to establish a performance floor for the more complex deep learning architectures."
  metric: "The primary success metric is the Root Mean Squared Error (RMSE) in meters (m) for position estimation and meters per second (m/s) for velocity estimation. This metric quantifies the average deviation of the model's predictions from the high-precision ground truth trajectory. Secondary metrics include model inference time and qualitative analysis of trajectory plots, especially during high-dynamic maneuvers and simulated sensor failure events."
  expected_outcome: "It was expected that the hybrid models would outperform the baselines significantly. Specifically, the MNN architecture, due to its explicit memory mechanism, was predicted to be the most effective at handling long-term temporal dependencies and sensor dropouts. Furthermore, the tightly coupled UKF was expected to yield the most accurate final position estimates, as it can better handle the system's non-linearities and directly process the raw sensor data corrected by the deep learning models."

results:
  executed: true
  outcome: "The experimental results strongly validated the hypothesis. The Memory Neural Network (MNN) consistently achieved the lowest RMSE for individual beam prediction (average RMSE of 0.0438 m/s) and overall velocity estimation (aggregate RMSE of 0.0649 m/s). When integrated into the position estimation framework, the combination of the MNN with a tightly coupled Unscented Kalman Filter (UKF) produced the most accurate trajectory, achieving an average position error of just 0.15m. This was a significant improvement over the loosely coupled UKF (0.22m), tightly coupled EKF (0.25m), and loosely coupled EKF (0.32m). The system demonstrated remarkable resilience, maintaining high accuracy even when multiple DVL beams were synthetically dropped."
  summary: "The research successfully proves that a hybrid framework combining deep learning for sensor data reconstruction and advanced Kalman filters for state estimation is a highly effective strategy for AUV navigation. This approach overcomes the critical limitations of traditional methods by learning to correct for sensor noise and failures in real-time, leading to a navigation system that is demonstrably more accurate, reliable, and robust in challenging, GPS-denied underwater environments."

next_action: "The next phase of research will focus on several key areas: 1) **Online Learning:** Develop mechanisms for the models to continuously adapt to changing environmental conditions and sensor characteristics during deployment. 2) **Multi-Modal Sensor Fusion:** Extend the framework to incorporate additional sensor data, such as sonar and visual information from cameras, to build a more comprehensive environmental model. 3) **Uncertainty Quantification:** Enhance the deep learning models to output not just predictions, but also confidence scores, which are critical for safety in mission-critical applications. 4) **Hardware Acceleration:** Optimize the models for energy-efficient deployment on resource-constrained embedded systems common in AUVs."

# Link back to the learning journal
evolution:
  - date: "2025-05-28"
    note: "This research was formalized and completed based on the initial hypothesis outlined in the undergraduate thesis proposal."
---

# Background / Motivation

This research was inspired by the fundamental challenge of achieving reliable autonomy in environments where standard positioning systems are unavailable. The primary motivation stems from the observation that while classical engineering models (like Kalman filters) provide a rigorous mathematical framework for state estimation, they often struggle when their underlying assumptions about sensor behavior are violated. Conversely, modern deep learning techniques excel at learning complex patterns from noisy data but can lack the interpretability and stability of model-based approaches.

## Key Insights Leading to Hypothesis

The core insight was that these two paradigms are not mutually exclusive but complementary. The errors and failure modes of underwater sensors (DVL, IMU) are not entirely random; they are often systematic and correlated with the vehicle's dynamics and its environment. This suggests that these error patterns can be *learned*. By using a deep learning model specifically to "clean" the sensor data *before* it is processed by the Kalman filter, we can allow each component to do what it does best. The deep learning model handles the complex, non-linear sensor error modeling, while the Kalman filter handles the physics-based state estimation in a more stable and reliable manner.

## Research Question

Can a hybrid framework, which uses a deep sequential learning model to predict and correct raw sensor measurements before feeding them into a tightly coupled Kalman filter, produce more accurate and robust velocity and position estimates for an AUV than either a standalone filter or a more loosely integrated system, especially under conditions of sensor data degradation and failure?

## Experiment Design

The experiment was structured to de-risk and validate the approach in stages, ensuring a rigorous comparison.

1.  **Dataset Curation:** Utilized the A-Kit dataset, featuring real-world AUV operational data, including synchronized DVL, IMU, and ground-truth position information. The data includes a variety of maneuvers (straight lines, turns, depth changes) and environmental conditions.
2.  **Stage 1 - Velocity Estimation Models:**
    *   **Architectures:** Four models were selected to cover a range of complexity and approaches:
        *   **MLP:** A simple feedforward network as a baseline.
        *   **LSTM:** A standard recurrent neural network for capturing temporal sequences.
        *   **FAN (Fourier Analysis Network):** A hybrid model to test the importance of frequency-domain features.
        *   **MNN (Memory Neural Network):** A custom architecture with an explicit memory module designed to handle long-term dependencies and abrupt changes (like sensor dropouts).
    *   **Task:** Each model was trained to predict the velocity of each of the four DVL beams based on a history of IMU data and the (potentially incomplete) DVL data.
3.  **Stage 2 - Position Estimation Framework:**
    *   **Filters:** The two most common filters for non-linear systems were used:
        *   **EKF (Extended Kalman Filter):** Uses linearization to handle non-linear dynamics.
        *   **UKF (Unscented Kalman Filter):** Uses a deterministic sampling approach (the unscented transform) which is generally more accurate for highly non-linear systems.
    *   **Coupling Strategies:**
        *   **Loosely Coupled:** The deep learning model first calculates a final velocity vector, which is then used as a single measurement update for the filter.
        *   **Tightly Coupled:** The filter directly uses the *individual beam predictions* from the deep learning model as separate measurements, allowing it to better manage failures of single beams.
4.  **Evaluation:** All 16 combinations (4 models x 2 filters x 2 coupling strategies) were systematically tested on a held-out test set. The final position and velocity RMSE were calculated and compared against the ground truth. Scenarios with simulated beam dropouts were explicitly tested to evaluate robustness.

## Expected Outcomes

The primary expectation was a clear performance hierarchy. It was anticipated that the **MNN + Tightly Coupled UKF** would emerge as the superior combination. The reasoning was as follows:
*   The **MNN**'s explicit memory would allow it to better "remember" the vehicle's state before a sensor dropout, leading to more stable predictions during the outage.
*   The **UKF**'s superior handling of non-linearities would be crucial for accurately modeling the AUV's complex 6-DOF dynamics.
*   The **Tightly Coupled** approach would provide the filter with more granular information, enabling it to gracefully handle the loss of one or two beams without discarding the entire DVL measurement, thus improving overall robustness.

It was also expected that all hybrid models would show a marked improvement over the baseline EKF/UKF-only approaches, confirming the value of the deep learning pre-processing stage.

## Results

The experimental outcomes, detailed in Chapters 4 and 5 of the thesis, confirmed the expectations with high fidelity. The MNN model demonstrated the most robust performance in the velocity prediction stage, and the tightly coupled UKF integration strategy consistently yielded the lowest position error. The final trajectory plots visually and quantitatively showed a significant reduction in drift compared to all other configurations, especially during and after periods of simulated sensor failure.

## Next Steps

Based on the success of this framework, the immediate next steps are to move towards real-world deployment and address the limitations of the current study.
1.  **Real-Time Implementation:** The current system operates in batch mode. The next step is to optimize the MNN model (e.g., through pruning, quantization) and the filter implementation for real-time, onboard execution on an AUV's flight computer.
2.  **Extended Field Trials:** Conduct extensive field trials in more diverse and challenging underwater environments (e.g., high currents, complex bathymetry, long-duration missions) to validate the long-term stability and generalizability of the system.
3.  **Adaptive Parameter Tuning:** Investigate the use of reinforcement learning or meta-learning to allow the system to auto-tune the Kalman filter's noise parameters (Q and R) and the deep learning model's hyperparameters in response to changing conditions, creating a fully adaptive navigation system.