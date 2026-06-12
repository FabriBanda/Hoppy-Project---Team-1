from __future__ import annotations

import argparse
from pathlib import Path
import numpy as np
import pandas as pd

from simulate import run_simulation
from hoppy.mjcf_utils import default_xml_path
from hoppy import params as P


def stance_slip_2d(df: pd.DataFrame) -> tuple[float, float]:
    loaded_slips = []
    stance = (df["state"] == "STANCE").to_numpy()
    start = None
    for i, active in enumerate(stance):
        if active and start is None:
            start = i
        if (not active or i == len(df) - 1) and start is not None:
            end = i - 1 if not active else i
            if end - start > 5:
                seg = df.iloc[start:end + 1]
                if float(seg["contact_force"].max()) > 10.0:
                    xy = seg[["toe_x", "toe_y"]].to_numpy()
                    loaded_slips.append(float(np.linalg.norm(xy - xy[0], axis=1).max()))
            start = None
    max_loaded_slip = max(loaded_slips) if loaded_slips else 0.0
    mean_loaded_slip = float(np.mean(loaded_slips)) if loaded_slips else 0.0
    return mean_loaded_slip, max_loaded_slip


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate the HOPPY circle-hop MuJoCo model.")
    parser.add_argument("--duration", type=float, default=25.0)
    parser.add_argument("--xml", type=str, default=None)
    args = parser.parse_args()

    data = run_simulation(
        duration=args.duration,
        viewer=False,
        xml_path=Path(args.xml) if args.xml else default_xml_path(),
        output_prefix="validation",
    )
    csv_path = Path(str(data["csv_path"][0]))
    df = pd.read_csv(csv_path)

    transitions = int((df["state"] != df["state"].shift()).sum())
    tau_hip_max = float(df["tau_hip"].abs().max())
    tau_knee_max = float(df["tau_knee"].abs().max())
    toe_min = float(df["toe_z"].min())
    toe_max = float(df["toe_z"].max())
    force_max = float(df["contact_force"].max())
    q_pitch_min = float(df["q_pitch"].min())
    q_pitch_max = float(df["q_pitch"].max())
    q_hip_min = float(df["q_hip"].min())
    q_hip_max = float(df["q_hip"].max())
    q_knee_min = float(df["q_knee"].min())
    q_knee_max = float(df["q_knee"].max())
    yaw_start = float(df["q_yaw"].iloc[0])
    yaw_end = float(df["q_yaw"].iloc[-1])
    yaw_progress = yaw_end - yaw_start
    laps = abs(yaw_progress) / (2.0 * np.pi)
    avg_yaw_rate = yaw_progress / max(float(df["time"].iloc[-1] - df["time"].iloc[0]), 1e-9)
    radius = np.sqrt(df["toe_x"] ** 2 + df["toe_y"] ** 2)
    radius_mean = float(radius.mean())
    radius_min = float(radius.min())
    radius_max = float(radius.max())
    mean_loaded_slip, max_loaded_slip = stance_slip_2d(df)

    print("Validation finished")
    print(f"CSV: {csv_path}")
    print(f"hybrid transitions: {transitions}")
    print(f"yaw progress: {yaw_progress:.4f} rad  ({laps:.3f} laps in {args.duration:.1f} s)")
    print(f"average yaw rate: {avg_yaw_rate:.4f} rad/s")
    print(f"toe radius: mean {radius_mean:.4f} m / min {radius_min:.4f} / max {radius_max:.4f}")
    print(f"toe_z range: {toe_min:.4f} m to {toe_max:.4f} m")
    print(f"contact force max: {force_max:.2f} N")
    print(f"q_pitch range: {q_pitch_min:.4f} rad to {q_pitch_max:.4f} rad")
    print(f"q_hip range: {q_hip_min:.4f} rad to {q_hip_max:.4f} rad")
    print(f"q_knee range: {q_knee_min:.4f} rad to {q_knee_max:.4f} rad")
    print(f"max |tau hip/knee|: {tau_hip_max:.4f} Nm / {tau_knee_max:.4f} Nm")
    print(f"loaded stance foot slip 2D: mean {mean_loaded_slip:.4f} m / max {max_loaded_slip:.4f} m")

    min_laps = 0.50 if args.duration >= 20.0 else 0.10
    max_transitions = int(args.duration * 10.0)  # si hay mas de esto es que esta chateando rapido
    checks = [
        (transitions >= 20, "has repeated FLIGHT/STANCE transitions"),
        (transitions <= max_transitions, "does not chatter with tiny ultra-fast hops"),
        (laps >= min_laps, "makes forward circular progress around the boom"),
        (yaw_progress < -0.50, "moves in the reversed circular direction"),
        (toe_max - toe_min > 0.09, "uses a longer visible hopping stroke"),
        (toe_min > -0.01, "toe/contact does not sink badly below the floor"),
        (tau_hip_max <= P.HIP_TORQUE_LIMIT_NM + 1e-3 and tau_knee_max <= P.KNEE_TORQUE_LIMIT_NM + 1e-3, "respects torque saturation"),
        (q_pitch_min > -0.1 and q_pitch_max < 0.35, "keeps the boom pitch bounded"),
        (q_knee_min > -0.65 and q_knee_max < 0.45, "keeps the leg in a usable pose"),
        (max_loaded_slip < 0.25, "keeps contact travel bounded while advancing in circle"),
    ]
    ok = True
    for passed, label in checks:
        print(("[OK] " if passed else "[FAIL] ") + label)
        ok = ok and passed
    if not ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
