# HEVC vs VVC Experiment Guide

This guide explains how to reproduce the **HEVC (HM) vs VVC (VTM) encoding experiment**. The instructions work on **Linux, macOS, and Windows using WSL**. The same steps were executed using **GitHub Codespaces**, which provides a ready-to-use Linux environment in the browser.

---

# 1. Install Prerequisites

Open a terminal and install the required build tools.

```bash
sudo apt update
sudo apt install -y build-essential cmake git python3 python3-pip
```

These tools are required for:

| Tool | Purpose |
|-----|--------|
| gcc / g++ | C++ compilation |
| cmake | Build configuration |
| make | Build execution |
| git | Cloning repositories |
| python3 | Later analysis |

---

# 2. Download and Build the Reference Codecs

The **Joint Video Experts Team (JVET)** provides reference implementations for academic evaluation.

| Codec | Reference Encoder |
|------|-------------------|
| HEVC (H.265) | HM (HEVC Test Model) |
| VVC (H.266) | VTM (VVC Test Model) |

## 2.1 Build HM (HEVC)

```bash
git clone https://vcgit.hhi.fraunhofer.de/jvet/HM.git
cd HM
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
cd ../..
```

Executable location:

```
HM/bin/TAppEncoderStatic
```

## 2.2 Build VTM (VVC)

```bash
git clone https://vcgit.hhi.fraunhofer.de/jvet/VVCSoftware_VTM.git
cd VVCSoftware_VTM
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
cd ../..
```

Executable location:

```
VVCSoftware_VTM/bin/EncoderAppStatic
```

At this point the working directory should contain:

```
HM/
VVCSoftware_VTM/
```

---

# Using GitHub Codespaces (Optional)

If running the experiment in **GitHub Codespaces**:

1. Create a repository.
2. Click **Code → Codespaces → Create Codespace**.
3. A cloud Linux environment opens in VS Code.
4. Run all commands inside the built-in terminal.

Codespaces already includes most build tools, making compilation easier.

---

# 3. Download the Test Video

Create a directory to store the raw video source.

```bash
mkdir source
cd source
```

Download the YUV sequence from the Xiph video dataset:

```bash
wget https://media.xiph.org/video/derf/y4m/FourPeople_1280x720_60.y4m
```

After downloading, the project structure should look like:

```
HM/
VVCSoftware_VTM/
source/
    FourPeople_1280x720_60.y4m
```

---

# 4. Create Output Directory

Create a folder where all encoded files and logs will be stored.

```bash
mkdir encoded-output
```

Final directory structure:

```
HM/
VVCSoftware_VTM/
source/
encoded-output/
```

---

# 5. HEVC Encoding (HM)

The HEVC encoder is executed four times using different **Quantization Parameter (QP)** values.

QP values used:

```
22, 27, 32, 37
```

Only **10 frames** are encoded to reduce runtime.

Example command for **QP = 22**:

```bash
./HM/bin/TAppEncoderStatic \
-c HM/cfg/encoder_randomaccess_main.cfg \
-i source/FourPeople_1280x720_60.y4m \
-wdt 1280 -hgt 720 -fr 60 \
-f 10 \
-q 22 \
-b encoded-output/out_hm_22.bin > encoded-output/log_hm_22.txt
```

Repeat the same command with:

```
-q 27
-q 32
-q 37
```

Outputs produced:

```
encoded-output/out_hm_22.bin
encoded-output/out_hm_27.bin
encoded-output/out_hm_32.bin
encoded-output/out_hm_37.bin

encoded-output/log_hm_22.txt
encoded-output/log_hm_27.txt
encoded-output/log_hm_32.txt
encoded-output/log_hm_37.txt
```

---

# 6. VVC Encoding (VTM)

The VVC encoder is also executed four times using the same QP values.

Example command for **QP = 22**:

```bash
./VVCSoftware_VTM/bin/EncoderAppStatic \
-c VVCSoftware_VTM/cfg/encoder_randomaccess_vtm.cfg \
-i source/FourPeople_1280x720_60.y4m \
-wdt 1280 -hgt 720 -fr 60 \
-f 10 \
-q 22 \
-b encoded-output/out_vtm_22.bin > encoded-output/log_vtm_22.txt
```

Repeat the command with:

```
-q 27
-q 32
-q 37
```

Outputs produced:

```
encoded-output/out_vtm_22.bin
encoded-output/out_vtm_27.bin
encoded-output/out_vtm_32.bin
encoded-output/out_vtm_37.bin

encoded-output/log_vtm_22.txt
encoded-output/log_vtm_27.txt
encoded-output/log_vtm_32.txt
encoded-output/log_vtm_37.txt
```

---

# 7. Extracting Metrics From Log Files

Each log file contains a **summary section** at the end of the encoding process.

The following metrics are extracted:

| Metric | Description |
|------|-------------|
| Bitrate (kbps) | Output compression bitrate |
| Y-PSNR (dB) | Luma Peak Signal-to-Noise Ratio |
| Total Encoding Time (s) | Total time required for encoding |

These values can be collected manually by opening the log files or using automated tools such as scripts or language models to parse the logs.

The extracted results were compiled into the following dataset:

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

This dataset contains the **bitrate, PSNR, and encoding time** for all eight encodes (four HEVC and four VVC).

