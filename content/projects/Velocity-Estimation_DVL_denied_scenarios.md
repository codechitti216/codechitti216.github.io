---
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
  baseline: "The baseline for comparison includes: 1) Traditional navigation solutions using only the raw, unfiltered sensor data. 2) Standard Extended Kalman Filter (EKF) and Unscented Kalman Filter (UKF) implementations without the deep learning-based sensor correction. 3) A simple Multi-Layer Perceptron (MLP) model to establish a performance floor for the more complex deep learning architectures."
  metric: "The primary success metric is the Root Mean Squared Error (RMSE) in meters (m) for position estimation and meters per second (m/s) for velocity estimation. This metric quantifies the average deviation of the model's predictions from the high-precision ground truth trajectory. Secondary metrics include model inference time and qualitative analysis of trajectory plots, especially during high-dynamic maneuvers and simulated sensor failure events."

results:
  executed: true
  outcome: "The experimental results strongly validated the hypothesis. The Memory Neural Network (MNN) consistently achieved the lowest RMSE for individual beam prediction (average RMSE of 0.0438 m/s) and overall velocity estimation (aggregate RMSE of 0.0649 m/s). When integrated into the position estimation framework, the combination of the MNN with a tightly coupled Unscented Kalman Filter (UKF) produced the most accurate trajectory, achieving an average position error of just 0.15m. This was a significant improvement over the loosely coupled UKF (0.22m), tightly coupled EKF (0.25m), and loosely coupled EKF (0.32m). The system demonstrated remarkable resilience, maintaining high accuracy even when multiple DVL beams were synthetically dropped."


# Link back to the learning journal
evolution:
  - date: "2025-05-28"
    note: "This research was formalized and completed based on the initial hypothesis outlined in the undergraduate thesis proposal."
---

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
    *   **Coupling Strategies:**
        *   **Loosely Coupled:** The deep learning model first calculates a final velocity vector, which is then used as a single measurement update for the filter.
        *   **Tightly Coupled:** The filter directly uses the *individual beam predictions* from the deep learning model as separate measurements, allowing it to better manage failures of single beams.

## Expected Outcomes

The primary expectation was a clear performance hierarchy. It was anticipated that the **MNN + Tightly Coupled UKF** would emerge as the superior combination. The reasoning was as follows:
*   The **MNN**'s explicit memory would allow it to better "remember" the vehicle's state before a sensor dropout, leading to more stable predictions during the outage.
*   The **UKF**'s superior handling of non-linearities would be crucial for accurately modeling the AUV's complex 6-DOF dynamics.
*   The **Tightly Coupled** approach would provide the filter with more granular information, enabling it to gracefully handle the loss of one or two beams without discarding the entire DVL measurement, thus improving overall robustness.


## Next Steps

Based on the success of this framework, the immediate next steps are to move towards real-world deployment and address the limitations of the current study.
2.  **Extended Field Trials:** Conduct extensive field trials in more diverse and challenging underwater environments (e.g., high currents, complex bathymetry, long-duration missions) to validate the long-term stability and generalizability of the system.
3.  **Adaptive Parameter Tuning:** Investigate the use of reinforcement learning or meta-learning to allow the system to auto-tune the Kalman filter's noise parameters (Q and R) and the deep learning model's hyperparameters in response to changing conditions, creating a fully adaptive navigation system.
