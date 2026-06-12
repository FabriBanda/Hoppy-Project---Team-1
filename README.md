# HOPPY MuJoCo - circle hop fixed

Esta versión mantiene la postura correcta del HOPPY, pero ahora el robot **sí avanza alrededor del boom** en vez de quedarse rebotando en el mismo lugar.

Cambios importantes:

- `joint1` yaw ya no está limitado a `[-0.20, 0.20]`, por eso puede dar vueltas completas.
- El yaw sigue siendo pasivo: no se agregó motor al gantry.
- El avance circular se genera con fuerza tangencial durante `STANCE` usando los motores de hip/knee.
- El controlador usa Jacobiano 3D del pie, no solo `x-z`, para que funcione aunque el robot vaya girando.
- El pie mantiene contacto mediante `foot_contact` con fricción alta y corrección radial suave.
- La rodilla ya no se deja caer debajo del robot.
- El salto ya no es tan corto como la versión anterior, pero sigue controlado.
- Se agregaron gráficas de trayectoria circular en vista superior.

## Cómo correr

```powershell
cd hoppy_mujoco_project_circle_hop_fixed
python validate_sim.py --duration 25
python simulate.py --duration 25 --viewer
```

Para ver las colisiones:

```powershell
python simulate.py --duration 25 --viewer --xml models/hoppy_collision_debug.xml
```

## Parámetros importantes

Los parámetros que controlan el avance están en `hoppy/params.py`:

```python
TARGET_YAW_RATE = 0.38
TANGENTIAL_FORCE_FF = 55.0
KP_YAW_VEL = 135.0
MAX_TANGENTIAL_FORCE = 170.0
```

Si quieres que avance más rápido en círculo, sube poco a poco `TARGET_YAW_RATE` o `TANGENTIAL_FORCE_FF`.

Si quieres que salte más alto, sube `FZ_BEZIER` con cuidado. Si lo subes demasiado, la pierna puede volver a doblarse raro o perder contacto.


## Long circle-hop tuning

This version was retuned to avoid the previous tiny, rapid hop chatter. The hybrid controller now enforces a minimum flight time and a longer stance profile, so the robot produces a slower, more visible hop while continuing to advance around the boom.

Key values are in `hoppy/params.py`:

- `T_STANCE = 0.150`
- `MIN_STANCE_TIME = 0.095`
- `MIN_FLIGHT_TIME = 0.180`
- larger vertical GRF profile in `FZ_BEZIER`
- longer flight foot clearance in `FOOT_CLEARANCE_FROM_HIP`

Run:

```powershell
python validate_sim.py --duration 25
python simulate.py --duration 25 --viewer
```


## Reverse circular direction update

This version is tuned to hop in the opposite circular direction. The main changes are in `hoppy/params.py` and `hoppy/controller.py`:

- `CIRCLE_DIRECTION = -1.0`
- a small `YAW_GUIDE` term is applied to the passive yaw DOF only to choose clockwise/counter-clockwise direction while the leg hopping is still handled by the hip and knee controller.
- the long-hop timing from the previous version is preserved, so it should not return to tiny rapid hops.

Run:

```powershell
python validate_sim.py --duration 25
python simulate.py --duration 25 --viewer
```
