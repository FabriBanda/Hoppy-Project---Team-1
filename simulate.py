from __future__ import annotations

import argparse
import csv
from pathlib import Path
import time as walltime

import numpy as np

from hoppy import params as P
from hoppy.controller import HoppyHybridController
from hoppy.filters import EncoderVelocityEstimator
from hoppy.mjcf_utils import default_xml_path, xml_with_overrides, project_root


def run_simulation(duration: float = 6.0, *, viewer: bool = False, torque_saturation: bool = True,
                   xml_path: Path | None = None, no_armature: bool = False,
                   no_damping: bool = False, no_knee_spring: bool = False,
                   output_prefix: str = "run") -> dict[str, np.ndarray]:
    import mujoco

    root = project_root()
    xml_path = xml_path or default_xml_path()
    results_dir = root / "results"
    results_dir.mkdir(exist_ok=True)

    if no_armature or no_damping or no_knee_spring:
        xml_path = xml_with_overrides(
            xml_path,
            no_armature=no_armature,
            no_damping=no_damping,
            no_knee_spring=no_knee_spring,
            output_name=f"_tmp_{output_prefix}.xml",
        )

    model = mujoco.MjModel.from_xml_path(str(xml_path))
    data = mujoco.MjData(model)

    controller = HoppyHybridController(model, torque_saturation=torque_saturation)
    controller.set_initial_pose(data)

    estimator = EncoderVelocityEstimator(
        dt=P.DT,
        n=len(controller.joint_names),
        quantization=P.ENCODER_QUANTIZATION,
        alpha=P.LOWPASS_ALPHA,
    )

    rows: list[dict[str, float | str]] = []
    n_steps = int(duration / P.DT)

    def do_one_step() -> None:
        q = controller.get_q(data)
        qd_est = estimator.update(q)
        log = controller.step(data, float(data.time), qd_est)
        rows.append({
            "time": log.time,
            "state": log.state,
            "q_yaw": log.q[0],
            "q_pitch": log.q[1],
            "q_hip": log.q[2],
            "q_knee": log.q[3],
            "qd_yaw_est": log.qd_est[0],
            "qd_pitch_est": log.qd_est[1],
            "qd_hip_est": log.qd_est[2],
            "qd_knee_est": log.qd_est[3],
            "toe_x": log.toe_pos[0],
            "toe_y": log.toe_pos[1],
            "toe_z": log.toe_pos[2],
            "contact_force": log.contact_force,
            "tau_hip": log.tau[0],
            "tau_knee": log.tau[1],
            "desired_fx": log.desired_force[0],
            "desired_fy": log.desired_force[1],
            "desired_fz": log.desired_force[2] if len(log.desired_force) > 2 else log.desired_force[1],
            "vx_cart": 0.0,
            "vy_cart": 0.0,
            "vz_cart": 0.0,
        })
        mujoco.mj_step(model, data)

    if viewer:
        import mujoco.viewer
        with mujoco.viewer.launch_passive(model, data) as v:
            # Keep the viewer focused on the full HOPPY boom/leg assembly.
            # The user can still move the camera manually afterwards.
            try:
                v.cam.lookat[:] = [-0.35, 0.0, 0.16]
                v.cam.distance = 1.25
                v.cam.azimuth = 130
                v.cam.elevation = -18
            except Exception:
                pass

            for _ in range(n_steps):
                step_start = walltime.time()
                do_one_step()
                v.sync()
                sleep_time = P.DT - (walltime.time() - step_start)
                if sleep_time > 0:
                    walltime.sleep(sleep_time)
    else:
        for _ in range(n_steps):
            do_one_step()

    csv_path = results_dir / f"{output_prefix}_log.csv"
    if rows:
        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)

    out = rows_to_arrays(rows)
    out["csv_path"] = np.array([str(csv_path)], dtype=object)
    return out


def rows_to_arrays(rows: list[dict[str, float | str]]) -> dict[str, np.ndarray]:
    if not rows:
        return {}
    keys = rows[0].keys()
    out: dict[str, np.ndarray] = {}
    for key in keys:
        if key == "state":
            out[key] = np.array([r[key] for r in rows], dtype=object)
        else:
            out[key] = np.array([float(r[key]) for r in rows], dtype=float)

    # Compute Cartesian toe velocities via filtered finite differences on toe_x/y/z.
    alpha = P.LOWPASS_ALPHA
    for axis, key_p, key_v in [("x", "toe_x", "vx_cart"), ("y", "toe_y", "vy_cart"), ("z", "toe_z", "vz_cart")]:
        pos = out[key_p]
        raw = np.zeros_like(pos)
        raw[1:] = np.diff(pos) / P.DT
        filt = np.zeros_like(raw)
        for i in range(1, len(raw)):
            filt[i] = alpha * raw[i] + (1.0 - alpha) * filt[i - 1]
        out[key_v] = filt

    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Run HOPPY in MuJoCo.")
    parser.add_argument("--duration", type=float, default=6.0, help="Simulation time in seconds.")
    parser.add_argument("--viewer", action="store_true", help="Open MuJoCo viewer.")
    parser.add_argument("--no-torque-saturation", action="store_true", help="Disable torque-speed saturation.")
    parser.add_argument("--no-armature", action="store_true", help="Disable hip/knee armature in a temp XML.")
    parser.add_argument("--no-damping", action="store_true", help="Disable hip/knee damping in a temp XML.")
    parser.add_argument("--no-knee-spring", action="store_true", help="Disable knee stiffness in a temp XML.")
    parser.add_argument("--output-prefix", default="run", help="Prefix for CSV and plots.")
    parser.add_argument("--xml", type=str, default=None, help="Optional path to a custom MJCF/XML model.")
    args = parser.parse_args()

    data = run_simulation(
        duration=args.duration,
        viewer=args.viewer,
        torque_saturation=not args.no_torque_saturation,
        no_armature=args.no_armature,
        no_damping=args.no_damping,
        no_knee_spring=args.no_knee_spring,
        xml_path=Path(args.xml) if args.xml else None,
        output_prefix=args.output_prefix,
    )

    from plot_results import make_plots
    make_plots(data, prefix=args.output_prefix)
    print(f"Simulation finished. CSV: {data['csv_path'][0]}")
    print(f"Plots saved in: {project_root() / 'results'}")


if __name__ == "__main__":
    main()
