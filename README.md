# HEVC (H.265) vs VVC (H.266) Compression Analysis

This project evaluates the performance of the **Versatile Video Coding (VVC)** standard compared to its predecessor, **High Efficiency Video Coding (HEVC)**. The evaluation focuses on compression efficiency (bitrate savings at constant quality) and computational complexity (encoding time), as required for the Multimedia Communication lab report.

---

## 📖 Methodology & Reproduction

Detailed step-by-step instructions for reproducing this experiment are available in the following guides:

1.  **[Experiment Reproduction Guide](guide/hevc_vvc_experiment_guide.md)**: Detailed steps on building the reference encoders (HM and VTM), downloading the raw source, and executing the encoding commands.
2.  **[Analysis & Plotting Guide](guide/hevc_vvc_analysis_guide.md)**: Instructions on how to extract metrics from logs, calculate BD-Rate, and generate R-D curves using Python.
3.  **[Jupyter Notebook Analysis](analysis/analysis.ipynb)**: The actual implementation used to process the data, calculate results, and generate the plots shown in this report.

---

## 📊 Experiment Setup

-   **Source Sequence**: `FourPeople_1280x720_60.y4m` (HD 720p, 60fps)
-   **Frames Encoded**: 10 frames
-   **Quantization Parameters (QP)**: 22, 27, 32, 37
-   **Reference Software**:
    -   HEVC: HM-16.20 (HEVC Test Model)
    -   VVC: VTM-11.0 (VVC Test Model)

---

## 📈 Experimental Results

### 1. Rate-Distortion (R-D) Curve Plot
The R-D curve demonstrates the relationship between bitrate (X-axis) and quality/PSNR (Y-axis). Both HM and VTM curves are plotted on the same graph to visualize the coding efficiency gap.

![Rate-Distortion Curve](analysis/output.png)

### 2. BD-Rate Analysis
The Bjøntegaard-Delta Rate (BD-Rate) measures the average bitrate difference between two codecs at the same quality level.

| Comparison | BD-Rate Value |
| :--- | :---: |
| **VVC (VTM) vs HEVC (HM)** | **-43.36%** |

*Interpretation: VVC provides approximately **43.36% bitrate savings** over HEVC for this sequence.*

### 3. The Complexity Penalty
The complexity penalty is calculated as the average ratio of encoding time between the two codecs.

$$Ratio = \frac{Time_{VTM}}{Time_{HM}}$$

| QP | HM Time (s) | VTM Time (s) | Ratio |
| :---: | :---: | :---: | :---: |
| 22 | 89.504 | 570.181 | 6.37x |
| 27 | 74.017 | 334.987 | 4.53x |
| 32 | 69.112 | 221.358 | 3.20x |
| 37 | 61.474 | 152.397 | 2.48x |

**Average Encoding Time Ratio: 4.14x**

---

## 🧪 Lab Discussion

### 1. Bitrate Reduction Performance
This experiment yielded a **BD-Rate of -43.36%** (using 'pchip' interpolation method). While VVC is often advertised as achieving a "50% bitrate reduction," this efficiency is highly dependent on the content resolution and the coding tools used. 

**Resolution vs. CTU Size:**
VVC utilizes larger **128x128 Coding Tree Units (CTUs)** compared to HEVC's 64x64. These massive CTUs are designed to exploit spatial redundancy in high-resolution content like **4K video**. When testing on lower resolution video (like our 720p source or WQVGA), the benefits of 128x128 CTUs are less pronounced because the image blocks are smaller and more detailed relative to the CTU size. This explains why we achieved ~43% rather than the theoretical 50% max seen in ultra-high-definition tests.

### 2. Engineering Features Causing Complexity
The **4.14x increase** in encoding time is driven by several intensive engineering features introduced in VVC to push the compression limits:
-   **QTMT (Quad-Tree plus Multi-Type Tree)**: Unlike HEVC's rigid quad-tree, VVC allows **rectangular splits** (binary and ternary). This significantly increases the number of partitioning combinations that the encoder must test during Rate-Distortion Optimization (RDO).
-   **Affine Motion Compensation**: VVC models complex motion (zooming, rotation) rather than just simple translation. The **Affine Motion Search** adds a significant computational burden to the motion estimation process.
-   **67 Intra Prediction Modes**: VVC nearly doubles the number of intra modes from HEVC's 35, providing finer granularity but requiring more searches per block.

### 3. Conclusion: Feasibility of Software Deployment
The current software-based VVC reference encoder (VTM) is **not feasible** for live streaming applications on current general-purpose hardware. 
-   **Performance Gap**: Even for a low-frame-count 720p encode, the process is several times slower than real-time. 
-   **Deployment Reality**: For live streaming, the industry relies on hardware-based encoders (ASICs) or highly optimized software implementations (like `kvazaar` or `vvenc`) that use heuristic shortcuts to bypass the exhaustive RDO search used in the reference model. Without such optimizations, VVC remains primarily a standard for offline "high-quality" file compression rather than live broadcast on consumer-grade CPUs.

---
