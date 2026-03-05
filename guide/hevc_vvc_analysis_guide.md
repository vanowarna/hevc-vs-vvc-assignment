# HEVC vs VVC Analysis Guide

This guide explains how to analyze the encoding results after extracting the metrics into a CSV file. The analysis produces:

- Rate–Distortion (R‑D) curve
- BD‑Rate comparison
- Encoding complexity comparison

The analysis can be performed either in **Jupyter Notebook** or as a **standard Python script**.

---

# 1. Project Structure

Create a directory named **analysis** and store the CSV file and analysis script there.

Example structure:

```
HM/
VVCSoftware_VTM/
source/
encoded-output/
analysis/
    output_metrics.csv
    analysis.py
```

---

# 2. CSV File

Place the extracted dataset into `analysis/output_metrics.csv`.

Example content:

```
Codec,QP,Bitrate_kbps,Y_PSNR_dB,Time_sec
HM,22,6311.3760,43.2798,89.504
HM,27,3410.2560,41.5033,74.017
HM,32,2052.3360,39.1165,69.112
HM,37,1222.8000,36.2630,61.474
VTM,22,4727.0400,44.0691,570.181
VTM,27,2568.0480,42.5558,334.987
VTM,32,1578.9600,40.5555,221.358
VTM,37,972.3840,38.0017,152.397
```

---

# 3. Install Python Dependencies

Install the required Python libraries.

```
pip install pandas matplotlib numpy bjontegaard
```

These libraries are used for:

| Library | Purpose |
|-------|--------|
| pandas | Data processing |
| matplotlib | Plotting graphs |
| numpy | Numerical operations |
| bjontegaard | BD‑Rate calculation |

---

# 4. Create the Analysis Script

Create a file:

```
analysis/analysis.py
```

Insert the following code.

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import bjontegaard as bd

# Load the data

df = pd.read_csv('output_metrics.csv')

# Separate codec data
hm_data = df[df['Codec'] == 'HM']
vtm_data = df[df['Codec'] == 'VTM']

# --- Rate Distortion Plot ---

plt.figure(figsize=(8,6))

plt.plot(hm_data['Bitrate_kbps'], hm_data['Y_PSNR_dB'],
         marker='o', label='HEVC (HM)')

plt.plot(vtm_data['Bitrate_kbps'], vtm_data['Y_PSNR_dB'],
         marker='s', label='VVC (VTM)')

plt.xlabel('Bitrate (kbps)')
plt.ylabel('Y-PSNR (dB)')
plt.title('Rate-Distortion Curve: HEVC vs VVC')
plt.legend()
plt.grid(True)

plt.show()

# --- BD Rate Calculation ---

rate_hm = hm_data['Bitrate_kbps'].values
psnr_hm = hm_data['Y_PSNR_dB'].values

rate_vtm = vtm_data['Bitrate_kbps'].values
psnr_vtm = vtm_data['Y_PSNR_dB'].values

bd_rate_result = bd.bd_rate(rate_hm, psnr_hm, rate_vtm, psnr_vtm,
                            min_overlap=0, method='pchip')

print(f"BD-Rate (VVC vs HEVC): {bd_rate_result:.2f}%")

# --- Complexity Analysis ---

time_ratio = vtm_data['Time_sec'].values / hm_data['Time_sec'].values

complexity_df = pd.DataFrame({
    'QP':[22,27,32,37],
    'HM Time (s)': hm_data['Time_sec'].values,
    'VTM Time (s)': vtm_data['Time_sec'].values,
    'Ratio': time_ratio
})

complexity_df['Ratio'] = complexity_df['Ratio'].apply(lambda x: f"{x:.2f}x")

avg_ratio = time_ratio.mean()

print("--- Encoding Time Complexity ---")
print(complexity_df.to_string(index=False))
print(f"\nAverage Encoding Time Ratio: {avg_ratio:.2f}x")
```

---

# 5. Run the Analysis

Navigate to the analysis directory.

```
cd analysis
```

Run the script.

```
python analysis.py
```

The script will:

1. Load the dataset
2. Plot the **Rate‑Distortion curve**
3. Compute the **BD‑Rate between VVC and HEVC**
4. Calculate the **encoding time ratio**

---

# 6. Using Jupyter Notebook (Optional)

The same analysis can be performed in a notebook.

Start Jupyter:

```
jupyter notebook
```

Create a notebook inside the **analysis** folder and copy the same code blocks into cells.

This allows interactive visualization of the results.

---

# 7. Expected Outputs

Running the script produces:

| Output | Description |
|------|-------------|
| RD Curve Plot | Visual comparison of compression efficiency |
| BD‑Rate Value | Average bitrate difference between codecs |
| Complexity Table | Encoding time comparison |

Example console output:

```
BD-Rate (VVC vs HEVC): -34.52%

--- Encoding Time Complexity ---
 QP  HM Time (s)  VTM Time (s)  Ratio
 22        89.50        570.18  6.37x
 27        74.02        334.99  4.53x
 32        69.11        221.36  3.20x
 37        61.47        152.40  2.48x

Average Encoding Time Ratio: 4.15x
```

These results summarize the **compression efficiency improvement** and the **computational complexity increase** when moving from HEVC to VVC.

