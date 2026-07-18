---
layout: article_unencrypt
title: 卷积神经网络
tags:
  - 学术
  - 学习笔记
  - 深度学习(DL)
date: 2026-05-17
featured_image: /assets/images/CNN.png
excerpt: 卷积神经网络 (Convolutional Neural Network, CNN) 是一种前馈神经网络，主要用于处理具有网格结构的数据（如图像、视频、音频）。
math: true
---

使用全连接网络处理图像等高维数据时，常见问题是参数量过大。

假设一张 $224\times224\times3$ 的彩色图像输入到一个 1000 维隐藏层：

$$
\text{参数量} = 224 \times 224 \times 3 \times 1000 \approx 1.5\times 10^8
$$

仅第一层就有上亿参数，训练成本和过拟合风险都很高。

卷积神经网络（Convolutional Neural Network, CNN）通过两种机制解决这个问题：

1. **局部连接（Local Connectivity）**：每个神经元只看局部区域，而非整张图。
2. **参数共享（Weight Sharing）**：同一个卷积核在整张图上滑动复用。

## 卷积层

在二维图像场景中，卷积层（Convolution Layer）通常写作：

$$
\boldsymbol{Y} = \text{Conv2d}(\boldsymbol{X}, \boldsymbol{W}) + \boldsymbol{b}
$$

其中：

- $\boldsymbol{X}$：输入特征图 （假定为 $m\times m\times C_{in}$ 的图片，即输入通道为$C_{in}$）
- $\boldsymbol{W}$：卷积核 （Filter, 假定为 $n\times n\times C_{in}$ 的矩阵）
- $\boldsymbol{Y}$：输出特征图 （$(m-n+1)\times (m-n+1)\times C_{out}$，输出通道为 $C_{out}$）

输出通道为 $t$ 时，准备 $t$ 个卷积核。每个卷积核在输入图上滑动（在每个位置逐元素乘然后相加），再将 $C_{in}$ 个通道的结果相加。第 $k$ 个滤波器在输出特征图上的 $(i, j)$ 位置产生的计算结果

$$Y_k(i, j) = \sum_{c=0}^{C_{in}-1} \sum_{p=0} \sum_{q=0} \boldsymbol{X}(i+p, j+q, c) \cdot \boldsymbol{W}_k(p, q, c) + b_k$$

<div align="center">
<img src="/assets/images/correlation.svg">
</div>

将 $t$ 个卷积核的计算结果叠加，得到输出特征图。

<div class="callout note">
<p>事实上，我们可以将卷积层转化为等价的全连接层。</p>
<p>忽略偏置项，将输入和输出图像展平，得到$m\times m\times C_{in}$维输入向量和$(m-n+1) \times (m-n+1) \times C_{out}$个隐藏层神经元。一个神经元只负责处理卷积核滑动到的一个小区域，即在等价权重矩阵 $W$ 的对应行中，只有 $n \times n \times C_{in}$ 个位置是有真实权重数值的，其余全为0。</p>
</div>

- **Padding**

位于图像正中央的像素，会被卷积核滑过好几次；而处于角落的像素，可能只被卷积核扫描到一次。这意味着网络极其容易忽略图像边缘的重要特征。因此在进行卷积操作前，在原始输入图像的四周人为地补充一圈或多圈像素（通常补充 0）。既能更好读取边缘信息，又能防止图像经过多个卷积层后变小。

- **Stride**

卷积核在输入图像上滑动时，每次移动的像素距离。步长越大，提取的特征越稀疏，输出的特征图尺寸越小。


## 池化层

在池化层（Pooling Layer）中，使用一个固定大小的窗口（如 2x2），以一定的步长在特征图上滑动，然后对窗口内的局部信息进行统计汇总。

- 最大池化（Max Pooling）：取窗口内的最大值。保留了该区域“最强烈的特征信号”。

- 平均池化（Average Pooling）：取窗口内所有值的平均数。用于保留背景等整体信息。

通过池化，模型对图像的轻微扭曲、平移具有了较强的鲁棒性。同时，池化可以减小图片的大小。

---

```python
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(in_channels=3, out_channels=32, kernel_size=3, stride=1, padding=1),  # 3x32x32 -> 32x32x32
            nn.ReLU(inplace=True),                                 # 原地修改
            nn.MaxPool2d(kernel_size=2, stride=2),                 # -> 32x16x16

            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1), # -> 64x16x16
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),                 # -> 64x8x8
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x
```

