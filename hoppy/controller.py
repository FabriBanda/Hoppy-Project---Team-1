from __future__ import annotations

from dataclasses import dataclass
import numpy as np

from . import params as P
from .bezier import bezier_value


@dataclass
class ControllerLog:
    time: float
    state: str
    q: np.ndarray
    qd_est: np.ndarray
    toe_pos: np.ndarray
    contact_force: float
    tau: np.ndarray
    desired_force: np.ndarray


class HoppyHybridController:
    """
    controlador principal de HOPPY — alterna entre FLIGHT y STANCE
    solo mueve hip y knee, el yaw y pitch son pasivos igual que en el rig fisico
    el avance circular sale de empujar tangencialmente en STANCE, no de un motor en el yaw
    """

    def __init__(self, model, *, torque_saturation: bool = True):
        import mujoco

        self.mujoco = mujoco
        self.model = model
        self.torque_saturation = torque_saturation
        self.state = "FLIGHT"
        self.stance_start_time = 0.0
        self.flight_start_time = 0.0
        self.stance_toe_xy = np.zeros(2, dtype=float)

        self.joint_names = ["joint1", "joint2", "joint3", "joint4"]
        self.joint_ids = {
            name: mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, name)
            for name in self.joint_names
        }
        self.qpos_addr = {name: int(model.jnt_qposadr[jid]) for name, jid in self.joint_ids.items()}
        self.dof_addr = {name: int(model.jnt_dofadr[jid]) for name, jid in self.joint_ids.items()}

        self.hip_actuator_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_ACTUATOR, "hip_motor")
        self.knee_actuator_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_ACTUATOR, "knee_motor")
        self.toe_site_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_SITE, "toe_site")
        self.hip_body_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "Link3")
        self.floor_geom_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_GEOM, "floor")

        support_names = ["foot_contact"]
        self.support_geom_ids = {
            mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_GEOM, name)
            for name in support_names
        }
        self.support_geom_ids = {gid for gid in self.support_geom_ids if gid >= 0}

    def get_q(self, data) -> np.ndarray:
        return np.array([data.qpos[self.qpos_addr[name]] for name in self.joint_names], dtype=float)

    def set_initial_pose(self, data) -> None:
        for name, value in P.Q0.items():
            data.qpos[self.qpos_addr[name]] = value
        data.qvel[:] = 0.0
        self.mujoco.mj_forward(self.model, data)

    def toe_jacobian_xyz_leg(self, data) -> np.ndarray:
        jacp = np.zeros((3, self.model.nv), dtype=float)
        jacr = np.zeros((3, self.model.nv), dtype=float)
        self.mujoco.mj_jacSite(self.model, data, jacp, jacr, self.toe_site_id)
        hip_col = self.dof_addr["joint3"]
        knee_col = self.dof_addr["joint4"]
        return jacp[:, [hip_col, knee_col]]

    def toe_velocity_xyz(self, data, qd_est: np.ndarray) -> np.ndarray:
        jacp = np.zeros((3, self.model.nv), dtype=float)
        jacr = np.zeros((3, self.model.nv), dtype=float)
        self.mujoco.mj_jacSite(self.model, data, jacp, jacr, self.toe_site_id)
        qvel_est_full = np.zeros(self.model.nv, dtype=float)
        for idx, name in enumerate(self.joint_names):
            qvel_est_full[self.dof_addr[name]] = qd_est[idx]
        return jacp @ qvel_est_full

    def circle_basis(self, data) -> tuple[np.ndarray, np.ndarray, float]:
        # vectores radial y tangencial en el plano del suelo
        # el radial apunta del eje de yaw al pie, el tangencial es hacia donde avanza
        toe_xy = data.site_xpos[self.toe_site_id][:2].copy()
        radius = float(np.linalg.norm(toe_xy))
        if radius < 1.0e-6:
            yaw = float(data.qpos[self.qpos_addr["joint1"]])
            radial = np.array([-np.cos(yaw), -np.sin(yaw)], dtype=float)
            radius = P.RBOOM
        else:
            radial = toe_xy / radius
        tangent = P.CIRCLE_DIRECTION * np.array([-radial[1], radial[0]], dtype=float)
        return radial, tangent, radius

    def contact_force(self, data) -> float:
        force = 0.0
        for i in range(data.ncon):
            contact = data.contact[i]
            pair = {int(contact.geom1), int(contact.geom2)}
            if self.floor_geom_id in pair and (pair & self.support_geom_ids):
                c_array = np.zeros(6, dtype=float)
                self.mujoco.mj_contactForce(self.model, data, i, c_array)
                force += max(0.0, float(c_array[0]))
        return force

    @staticmethod
    def _clip_torque_speed(tau: float, w: float, A: np.ndarray, b: np.ndarray) -> float:
        lower = -np.inf
        upper = np.inf
        for (aw, au), bi in zip(A, b):
            rhs = bi - aw * w
            if abs(au) < 1.0e-12:
                continue
            bound = rhs / au
            if au > 0:
                upper = min(upper, bound)
            else:
                lower = max(lower, bound)
        return float(np.clip(tau, lower, upper))

    def saturate(self, tau: np.ndarray, qd_est: np.ndarray) -> np.ndarray:
        if not self.torque_saturation:
            return tau.copy()
        out = tau.copy()
        out[0] = self._clip_torque_speed(out[0], qd_est[2], P.HIP_LIMIT_A, P.HIP_LIMIT_B)
        out[1] = self._clip_torque_speed(out[1], qd_est[3], P.KNEE_LIMIT_A, P.KNEE_LIMIT_B)
        return out

    def update_state(self, data, time: float, normal_force: float) -> None:
        if self.state == "FLIGHT":
            flight_elapsed = time - self.flight_start_time
            if flight_elapsed > P.MIN_FLIGHT_TIME and normal_force > P.TOUCHDOWN_FORCE_N:
                self.state = "STANCE"
                self.stance_start_time = time
                self.stance_toe_xy = data.site_xpos[self.toe_site_id][:2].copy()
            return

        if self.state == "STANCE":
            elapsed = time - self.stance_start_time
            if (elapsed > P.MIN_STANCE_TIME and normal_force < P.LIFTOFF_FORCE_N) or elapsed > P.MAX_STANCE_TIME:
                self.state = "FLIGHT"
                self.flight_start_time = time

    def flight_control(self, data, q: np.ndarray, qd_est: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        toe_pos = data.site_xpos[self.toe_site_id].copy()
        hip_pos = data.xpos[self.hip_body_id].copy()
        toe_vel = self.toe_velocity_xyz(data, qd_est)
        radial2, tangent2, _ = self.circle_basis(data)
        radial = np.array([radial2[0], radial2[1], 0.0])
        tangent = np.array([tangent2[0], tangent2[1], 0.0])
        flight_elapsed = max(0.0, float(data.time - self.flight_start_time))
        flight_phase = np.clip(flight_elapsed / max(P.MIN_FLIGHT_TIME, 1.0e-6), 0.0, 1.0)
        touchdown_blend = 0.5 - 0.5 * np.cos(np.pi * np.clip((flight_phase - 0.58) / 0.42, 0.0, 1.0))
        swing_lift = P.FLIGHT_SWING_LIFT * np.sin(np.pi * flight_phase) ** 1.35
        tangential_offset = (
            (1.0 - touchdown_blend) * P.FLIGHT_TANGENTIAL_OFFSET
            + touchdown_blend * P.FLIGHT_TOUCHDOWN_TANGENTIAL_OFFSET
        )
        radial_offset = (
            (1.0 - touchdown_blend) * P.FLIGHT_RADIAL_OFFSET
            + touchdown_blend * P.FLIGHT_TOUCHDOWN_RADIAL_OFFSET
        )

        # primero levanta el pie para no arrastrarlo, luego lo lleva adelante
        # al final del vuelo lo recoge un poco para que caiga debajo de la cadera y no estirado
        desired_pos = (
            hip_pos
            + radial_offset * radial
            + tangential_offset * tangent
            + np.array([0.0, 0.0, -P.FOOT_CLEARANCE_FROM_HIP + swing_lift])
        )
        f_sw = P.KP_SW @ (desired_pos - toe_pos) + P.KD_SW @ (-toe_vel)
        tau = self.toe_jacobian_xyz_leg(data).T @ f_sw

        q_leg = q[2:4]
        qd_leg = qd_est[2:4]
        tau += P.KP_FLIGHT_POSTURE * (P.Q_D_FLIGHT - q_leg) + P.KD_FLIGHT_POSTURE * (-qd_leg)
        return tau, f_sw

    def stance_control(self, data, time: float, q: np.ndarray, qd_est: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        elapsed = time - self.stance_start_time
        s = np.clip(elapsed / P.T_STANCE, 0.0, 1.0)
        radial2, tangent2, radius = self.circle_basis(data)
        tangent = np.array([tangent2[0], tangent2[1], 0.0])
        radial = np.array([radial2[0], radial2[1], 0.0])

        fz = bezier_value(P.FZ_BEZIER, s)

        # esto es lo que hace que el yaw avance — fuerza tangencial al suelo
        # va en forma de seno para no patear el piso al entrar ni al salir
        yaw_rate = float(qd_est[0])
        desired_tangential_speed = P.TARGET_YAW_RATE * radius
        current_tangential_speed = P.CIRCLE_DIRECTION * yaw_rate * radius
        envelope = np.sin(np.pi * min(1.0, s)) ** 1.2
        ftan = (P.TANGENTIAL_FORCE_FF + P.KP_YAW_VEL * (desired_tangential_speed - current_tangential_speed)) * envelope
        ftan = float(np.clip(ftan, -P.MAX_TANGENTIAL_FORCE, P.MAX_TANGENTIAL_FORCE))

        # correccion radial suave para que el pie no se deslice pa los lados
        # si se pone muy fuerte compite con la fuerza tangencial y se frena solo
        toe_pos = data.site_xpos[self.toe_site_id].copy()
        toe_xy = toe_pos[:2]
        toe_vel = self.toe_velocity_xyz(data, qd_est)
        radial_error = float(np.dot(toe_xy - self.stance_toe_xy, radial2))
        radial_speed = float(np.dot(toe_vel[:2], radial2))
        frad = -P.KP_FOOT_HOLD_RADIAL * radial_error - P.KD_FOOT_HOLD_RADIAL * radial_speed
        frad = float(np.clip(frad, -P.MAX_FOOT_HOLD_RADIAL_FORCE, P.MAX_FOOT_HOLD_RADIAL_FORCE))

        # si la pierna se aplasta demasiado le metemos un poco de fuerza hacia arriba
        # para que no quede plana contra el suelo antes de despegar
        height_error = max(0.0, P.STANCE_TOE_Z_SOFT_MIN - float(toe_pos[2]))
        downward_speed = max(0.0, -float(toe_vel[2]))
        fz_guard = P.KP_STANCE_HEIGHT * height_error + P.KD_STANCE_HEIGHT * downward_speed
        fz_guard = float(np.clip(fz_guard, 0.0, P.MAX_STANCE_HEIGHT_FORCE))

        desired_force = ftan * tangent + frad * radial + np.array([0.0, 0.0, fz + fz_guard])
        tau_ff = self.toe_jacobian_xyz_leg(data).T @ desired_force

        q_leg = q[2:4]
        qd_leg = qd_est[2:4]
        # extiende en medio de la zancada y retrae al final
        # asi el pie llega bien posicionado al proximo touchdown en vez de quedar abierto
        pulse = np.sin(np.pi * min(1.0, s))
        late_retract = 0.5 - 0.5 * np.cos(np.pi * np.clip((s - 0.74) / 0.26, 0.0, 1.0))
        q_des = P.Q_D_STANCE + pulse * (P.Q_D_PUSH - P.Q_D_STANCE)
        q_des -= late_retract * P.Q_D_RETRACT
        tau_fb = P.KP_ST * (q_des - q_leg) + P.KD_ST * (-qd_leg)
        return tau_ff + tau_fb, desired_force

    def step(self, data, time: float, qd_est: np.ndarray) -> ControllerLog:
        q = self.get_q(data)
        data.qfrc_applied[:] = 0.0
        normal_force = self.contact_force(data)
        self.update_state(data, time, normal_force)

        if getattr(P, "PITCH_GUIDE_ENABLE", False):
            pitch_dof = self.dof_addr["joint2"]
            pitch = float(q[1])
            pitch_rate = float(qd_est[1])
            target_pitch = P.PITCH_GUIDE_TARGET_FLIGHT if self.state == "FLIGHT" else P.PITCH_GUIDE_TARGET_STANCE
            pitch_tau = P.PITCH_GUIDE_KP * (target_pitch - pitch) + P.PITCH_GUIDE_KD * (-pitch_rate)
            data.qfrc_applied[pitch_dof] = float(np.clip(pitch_tau, -P.PITCH_GUIDE_MAX_TORQUE, P.PITCH_GUIDE_MAX_TORQUE))

        if getattr(P, "YAW_GUIDE_ENABLE", False):
            yaw_dof = self.dof_addr["joint1"]
            yaw_rate_error = P.YAW_GUIDE_TARGET_RATE - qd_est[0]
            yaw_tau = float(np.clip(P.YAW_GUIDE_KD * yaw_rate_error, -P.YAW_GUIDE_MAX_TORQUE, P.YAW_GUIDE_MAX_TORQUE))
            data.qfrc_applied[yaw_dof] = yaw_tau

        if self.state == "FLIGHT":
            tau, desired_force = self.flight_control(data, q, qd_est)
        else:
            tau, desired_force = self.stance_control(data, time, q, qd_est)

        tau = self.saturate(tau, qd_est)
        data.ctrl[self.hip_actuator_id] = tau[0]
        data.ctrl[self.knee_actuator_id] = tau[1]

        return ControllerLog(
            time=time,
            state=self.state,
            q=q.copy(),
            qd_est=qd_est.copy(),
            toe_pos=data.site_xpos[self.toe_site_id].copy(),
            contact_force=normal_force,
            tau=tau.copy(),
            desired_force=np.asarray(desired_force, dtype=float).copy(),
        )
