from __future__ import annotations

import numpy as np


class EncoderVelocityEstimator:
    """
    estima velocidad de cada junta a partir de posicion cuantizada del encoder
    no usamos qvel directo de mujoco — simulamos como funciona el sensor real
    """

    def __init__(self, dt: float, n: int, quantization: float, alpha: float):
        self.dt = float(dt)
        self.quantization = float(quantization)
        self.alpha = float(alpha)
        self.prev_q: np.ndarray | None = None
        self.filtered = np.zeros(n, dtype=float)

    def reset(self) -> None:
        self.prev_q = None
        self.filtered[:] = 0.0

    def update(self, q: np.ndarray) -> np.ndarray:
        q = np.asarray(q, dtype=float)
        q_meas = np.round(q / self.quantization) * self.quantization
        if self.prev_q is None:
            self.prev_q = q_meas.copy()
            return self.filtered.copy()
        raw = (q_meas - self.prev_q) / self.dt
        self.filtered = self.alpha * raw + (1.0 - self.alpha) * self.filtered
        self.prev_q = q_meas.copy()
        return self.filtered.copy()
