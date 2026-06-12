# parametros del simulador, adaptados del HOPPY original en MATLAB
# todo en SI salvo que se indique lo contrario
from __future__ import annotations

import numpy as np

# Simulation
DT = 0.001
GRAVITY = 9.81
RBOOM = 556.0e-3
T_STANCE = 0.122

# postura inicial — pierna recogida con el pie cerca del suelo
Q0 = {
    "joint1": 0.0,
    "joint2": 0.010,
    "joint3": 0.0,
    "joint4": 0.0,
}

# direccion y velocidad del movimiento circular
# +1 va en sentido antihorario, -1 en sentido horario
CIRCLE_DIRECTION = -1.0
TARGET_YAW_RATE = 0.58          # rad/s, quicker circular locomotion
TANGENTIAL_FORCE_FF = 78.0      # N feed-forward horizontal GRF
KP_YAW_VEL = 155.0              # N per (m/s) tangential speed error
MAX_TANGENTIAL_FORCE = 175.0    # N

# Flight controller / foot placement
KP_SW = np.diag([50.0, 50.0, 138.0])
KD_SW = np.diag([3.8, 3.8, 10.6])
FOOT_CLEARANCE_FROM_HIP = 0.165
FLIGHT_SWING_LIFT = 0.092
FLIGHT_TANGENTIAL_OFFSET = 0.036
FLIGHT_TOUCHDOWN_TANGENTIAL_OFFSET = 0.012
FLIGHT_RADIAL_OFFSET = 0.030
FLIGHT_TOUCHDOWN_RADIAL_OFFSET = 0.020

# Stance controller: moderate extension through mid-stance, then retract for
# the next touchdown instead of getting stuck in an over-open pose.
KP_ST = np.array([44.0, 56.0])
KD_ST = np.array([4.2, 5.4])
Q_D_STANCE = np.array([0.05, 0.08])
Q_D_PUSH = np.array([0.37, 0.33])
Q_D_RETRACT = np.array([0.22, 0.18])
FZ_BEZIER = np.array([0.0, 360.0, 920.0, 460.0, 0.0])

# mantiene el pie quieto durante el apoyo sin pelear con la fuerza tangencial
# solo corrige en la direccion radial, no en la tangencial
KP_FOOT_HOLD_RADIAL = 420.0
KD_FOOT_HOLD_RADIAL = 24.0
MAX_FOOT_HOLD_RADIAL_FORCE = 24.0

# si el pie baja demasiado le damos soporte vertical extra
# evita que la pierna quede aplastada antes del despegue
STANCE_TOE_Z_SOFT_MIN = 0.040
KP_STANCE_HEIGHT = 9500.0
KD_STANCE_HEIGHT = 370.0
MAX_STANCE_HEIGHT_FORCE = 175.0

# datos del motor y reductor, sacados de get_params.m
NH = 26.9
NK = 28.8
I_ROTOR = 7.0e-6
RW = 1.3
KT = 0.0135
KV = 0.0186

HIP_ARMATURE = I_ROTOR * NH**2
KNEE_ARMATURE = I_ROTOR * NK**2
HIP_DAMPING = KV * KT * NH**2 / RW
KNEE_DAMPING = KV * KT * NK**2 / RW

# resorte de la rodilla del MATLAB original: tau_s = -0.0242*q_knee + 0.0108, se aplica doble
KNEE_STIFFNESS = 2.0 * 0.0242
KNEE_SPRINGREF = 0.0108 / 0.0242

# limites de torque — se aplican en el controlador y tambien estan en el XML
HIP_TORQUE_LIMIT_NM = 20.0
KNEE_TORQUE_LIMIT_NM = 20.0
HIP_LIMIT_A = np.array([[0.0, 1.0], [0.0, -1.0]])
HIP_LIMIT_B = np.array([HIP_TORQUE_LIMIT_NM, HIP_TORQUE_LIMIT_NM])
KNEE_LIMIT_A = np.array([[0.0, 1.0], [0.0, -1.0]])
KNEE_LIMIT_B = np.array([KNEE_TORQUE_LIMIT_NM, KNEE_TORQUE_LIMIT_NM])

# Encoder emulation
ENCODER_COUNTS_PER_REV = 4096
ENCODER_QUANTIZATION = 2.0 * np.pi / ENCODER_COUNTS_PER_REV
LOWPASS_ALPHA = 0.18

# umbrales para detectar touchdown y liftoff
TOUCHDOWN_FORCE_N = 0.5
LIFTOFF_FORCE_N = 0.25
MIN_STANCE_TIME = 0.105
MAX_STANCE_TIME = 0.175
MIN_FLIGHT_TIME = 0.24

# recoge la pierna en vuelo para que el pie no quede colgando
KP_FLIGHT_POSTURE = np.array([92.0, 104.0])
KD_FLIGHT_POSTURE = np.array([7.0, 7.5])
Q_D_FLIGHT = np.array([-0.16, -0.10])

# guia suave en el pitch del boom (es pasivo, no tiene motor)
# en vuelo lo jalamos un poco pa arriba pa que el pie no roce el suelo
# en apoyo lo soltamos para que el pie cargue bien
PITCH_GUIDE_ENABLE = True
PITCH_GUIDE_TARGET_FLIGHT = -0.100
PITCH_GUIDE_TARGET_STANCE = -0.008
PITCH_GUIDE_KP = 82.0
PITCH_GUIDE_KD = 9.8
PITCH_GUIDE_MAX_TORQUE = 20.0

# guia de yaw para elegir la direccion de giro
# solo un empujoncito, la locomocion real la genera la pierna
YAW_GUIDE_ENABLE = True
YAW_GUIDE_TARGET_RATE = -0.36
YAW_GUIDE_KD = 7.0
YAW_GUIDE_MAX_TORQUE = 5.0
