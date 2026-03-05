# HEVC vs VVC Experiment Guide

## 1. Install Prerequisites

In terminal:

```bash
sudo apt update
sudo apt install -y build-essential cmake git python3 python3-pip
```

Install Python package:

```bash
pip3 install bjontegaard matplotlib numpy
```

---

## 2. Download Reference Codecs

### HEVC (HM)

```bash
git clone https://vcgit.hhi.fraunhofer.de/jvet/HM.git
cd HM
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
cd ../..
```

Executable:

```
HM/bin/TAppEncoderStatic
```

### VVC (VTM)

```bash
git clone https://vcgit.hhi.fraunhofer.de/jvet/VVCSoftware_VTM.git
cd VVCSoftware_VTM
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
cd ../..
```

Executable:

```
VVCSoftware_VTM/bin/EncoderAppStatic
```

---

## 3. Download Raw Video

Download:

```
BasketballPass_416x240_50.yuv
```

From:

https://media.xiph.org/video/derf/

Place it in your working directory.

---

## 4. Run HEVC Encoding

Run 4 encodes with different QP values.

Example (QP=22):

```bash
./HM/bin/TAppEncoderStatic \
-c HM/cfg/encoder_randomaccess_main.cfg \
-i BasketballPass_416x240_50.yuv \
-wdt 416 -hgt 240 -fr 50 \
-f 20 \
-q 22 \
-b out_hm_22.bin > log_hm_22.txt
```

Repeat with:

```
-q 27
-q 32
-q 37
```

Expected outputs:

```
out_hm_22.bin
out_hm_27.bin
out_hm_32.bin
out_hm_37.bin
```

---

## 5. Run VVC Encoding

Example (QP=22):

```bash
./VVCSoftware_VTM/bin/EncoderAppStatic \
-c VVCSoftware_VTM/cfg/encoder_randomaccess_vtm.cfg \
-i BasketballPass_416x240_50.yuv \
-wdt 416 -hgt 240 -fr 50 \
-f 20 \
-q 22 \
-b out_vtm_22.bin > log_vtm_22.txt
```

Repeat for:

```
-q 27
-q 32
-q 37
```

Expected outputs:

```
out_vtm_22.bin
out_vtm_27.bin
out_vtm_32.bin
out_vtm_37.bin
```

---

## 6. Extract Metrics from Logs

Open each log file and scroll to **Summary** section.

Extract:

- Bitrate (kbps)
- Y-PSNR (dB)
- Total Encoding Time (s)

Example table:

| Codec | QP | Bitrate | PSNR | Time |
|------|----|--------|------|------|
| HM | 22 | | | |
| HM | 27 | | | |
| HM | 32 | | | |
| HM | 37 | | | |
| VTM | 22 | | | |
| VTM | 27 | | | |
| VTM | 32 | | | |
| VTM | 37 | | | |

---

## 7. Plot R-D Curve

Create `plot_rd.py`

```python
import matplotlib.pyplot as plt

rate_hm = []
psnr_hm = []

rate_vtm = []
psnr_vtm = []

plt.plot(rate_hm, psnr_hm, marker='o', label='HEVC (HM)')
plt.plot(rate_vtm, psnr_vtm, marker='o', label='VVC (VTM)')

plt.xlabel('Bitrate (kbps)')
plt.ylabel('PSNR (dB)')
plt.title('Rate-Distortion Curve')
plt.legend()
plt.grid()

plt.show()
```

---

## 8. Calculate BD‑Rate

Create `bd_rate.py`

```python
import bjontegaard as bd

rate_hm = []
psnr_hm = []

rate_vtm = []
psnr_vtm = []

bd_rate = bd.bd_rate(rate_hm, psnr_hm, rate_vtm, psnr_vtm)

print(f"BD-Rate (VVC vs HEVC): {bd_rate:.2f}%")
```

Run:

```bash
python3 bd_rate.py
```

Interpretation:

| BD‑Rate | Meaning |
|-------|--------|
| Negative | VVC saves bitrate |
| Positive | VVC worse than HEVC |

Example:

```
-35%
```

means **VVC saves 35% bitrate**.

---

## 9. Compute Complexity Penalty

Calculate:

```
Encoding Time Ratio = Time_VTM / Time_HM
```

Example:

| QP | HM Time | VTM Time | Ratio |
|----|--------|---------|------|
|22|20s|200s|10x|

Average ratio = complexity increase.

---

## 10. Expected Results

Typical observation:

| Metric | Observation |
|------|-------------|
| Bitrate | VVC lower |
| Quality | Similar PSNR |
| Encoding Time | VVC much slower |

Typical BD‑Rate:

```
-30% to -45%
```

Encoding complexity:

```
10x – 50x slower
```

---

## 11. Discussion Points for Report

### Why VVC is slower

Key tools increasing complexity:

- QTMT partitioning
- 67 intra prediction modes
- Affine motion compensation
- Advanced motion vector prediction
- Multiple transform sizes

### Feasibility of real‑time encoding

Software VVC encoding on CPU:

- Not practical for real‑time
- Requires hardware accelerators

---

# Final Checklist

| Step | Done |
|----|----|
| Install dependencies | |
| Build HM | |
| Build VTM | |
| Download YUV | |
| Run 8 encodes | |
| Extract metrics | |
| Plot RD curve | |
| Compute BD‑Rate | |
| Calculate time ratio | |

