from __future__ import annotations

import math
import numpy as np


def bezier_value(coefficients: np.ndarray, s: float) -> float:
    """evalua la curva de Bezier — misma convencion que polyval_bz en el MATLAB original"""
    c = np.asarray(coefficients, dtype=float)
    s = float(np.clip(s, 0.0, 1.0))
    n = len(c) - 1
    total = 0.0
    for k, ck in enumerate(c):
        total += math.comb(n, k) * (s**k) * ((1.0 - s) ** (n - k)) * ck
    return float(total)
