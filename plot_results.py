from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from hoppy.mjcf_utils import project_root


def _state_numeric(states: np.ndarray) -> np.ndarray:
    return np.array([1.0 if s == "STANCE" else 0.0 for s in states], dtype=float)


def make_plots(data: dict[str, np.ndarray], *, prefix: str = "run") -> None:
    results = project_root() / "results"
    results.mkdir(exist_ok=True)
    t = data["time"]

    fig, ax = plt.subplots(1, 1, figsize=(9, 4.5))
    ax.plot(t, data["q_yaw"], label="yaw")
    ax.plot(t, data["q_pitch"], label="pitch")
    ax.plot(t, data["q_hip"], label="hip")
    ax.plot(t, data["q_knee"], label="knee")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Joint position [rad]")
    ax.set_title("Joint positions")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(results / f"{prefix}_joint_positions.png", dpi=180)
    plt.close(fig)

    fig, ax = plt.subplots(1, 1, figsize=(9, 4.5))
    ax.plot(t, data["qd_yaw_est"], label="yaw estimated")
    ax.plot(t, data["qd_pitch_est"], label="pitch estimated")
    ax.plot(t, data["qd_hip_est"], label="hip estimated")
    ax.plot(t, data["qd_knee_est"], label="knee estimated")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Estimated velocity [rad/s]")
    ax.set_title("Encoder-derived filtered velocities")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(results / f"{prefix}_estimated_velocities.png", dpi=180)
    plt.close(fig)

    fig, ax = plt.subplots(1, 1, figsize=(9, 4.5))
    ax.plot(t, data["toe_x"], label="toe x")
    if "toe_y" in data:
        ax.plot(t, data["toe_y"], label="toe y")
    ax.plot(t, data["toe_z"], label="toe z")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Position [m]")
    ax.set_title("Toe Cartesian position")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(results / f"{prefix}_toe_position.png", dpi=180)
    plt.close(fig)


    fig, ax = plt.subplots(1, 1, figsize=(6, 6))
    if "toe_y" in data:
        ax.plot(data["toe_x"], data["toe_y"], label="toe path")
        ax.scatter([0.0], [0.0], marker="x", label="yaw axis")
        ax.set_aspect("equal", adjustable="box")
        ax.set_xlabel("Toe x [m]")
        ax.set_ylabel("Toe y [m]")
        ax.set_title("Top-view circular progress")
        ax.legend()
        ax.grid(True)
        fig.tight_layout()
        fig.savefig(results / f"{prefix}_top_view_path.png", dpi=180)
    plt.close(fig)

    fig, ax = plt.subplots(1, 1, figsize=(9, 4.5))
    ax.plot(t, data["contact_force"], label="normal contact force")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Force [N]")
    ax.set_title("Toe-ground contact force")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(results / f"{prefix}_contact_force.png", dpi=180)
    plt.close(fig)

    fig, ax = plt.subplots(1, 1, figsize=(9, 4.5))
    ax.plot(t, data["tau_hip"], label="hip torque")
    ax.plot(t, data["tau_knee"], label="knee torque")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Torque [N m]")
    ax.set_title("Control torques")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(results / f"{prefix}_torques.png", dpi=180)
    plt.close(fig)

    fig, ax = plt.subplots(1, 1, figsize=(9, 3.5))
    ax.plot(t, _state_numeric(data["state"]), label="state: 0=FLIGHT, 1=STANCE")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Hybrid state")
    ax.set_yticks([0, 1], ["FLIGHT", "STANCE"])
    ax.set_title("Hybrid state machine")
    ax.legend()
    ax.grid(True)
    fig.tight_layout()
    fig.savefig(results / f"{prefix}_states.png", dpi=180)
    plt.close(fig)

    if "vx_cart" in data:
        fig, ax = plt.subplots(1, 1, figsize=(9, 4.5))
        ax.plot(t, data["vx_cart"], label="vx (Cartesian)")
        ax.plot(t, data["vy_cart"], label="vy (Cartesian)")
        ax.plot(t, data["vz_cart"], label="vz (Cartesian)")
        ax.set_xlabel("Time [s]")
        ax.set_ylabel("Velocity [m/s]")
        ax.set_title("Toe Cartesian velocity (filtered encoder-derived)")
        ax.legend()
        ax.grid(True)
        fig.tight_layout()
        fig.savefig(results / f"{prefix}_cartesian_velocities.png", dpi=180)
        plt.close(fig)
