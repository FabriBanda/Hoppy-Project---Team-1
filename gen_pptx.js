const pptxgen = require("pptxgenjs");
const path = require("path");

const ROOT = __dirname;
const RES = path.join(ROOT, "results");
function img(name) { return path.join(RES, name); }

const DARK      = "0D1B2A";
const DARK2     = "132336";
const CYAN      = "00B4D8";
const LIGHT_BG  = "F0F5FA";
const WHITE     = "FFFFFF";
const DARK_TEXT = "0D1B2A";
const MUTED     = "5B7A99";

const makeShadow = () => ({
  type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.13
});

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "HOPPY - Team 1";

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — PORTADA
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: DARK };

  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 5.8, h: 5.625,
    fill: { color: DARK2 }, line: { color: DARK2 }
  });

  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.55, y: 0.45, w: 3.5, h: 0.38,
    fill: { color: CYAN }, line: { color: CYAN }, rectRadius: 0.06
  });
  sl.addText("ROBÓTICA INTELIGENTE — TEAM 1", {
    x: 0.55, y: 0.45, w: 3.5, h: 0.38,
    fontSize: 9.5, bold: true, color: DARK, align: "center", valign: "middle", margin: 0
  });

  sl.addText("HOPPY", {
    x: 0.5, y: 1.0, w: 5.0, h: 1.3,
    fontSize: 72, bold: true, color: WHITE, fontFace: "Calibri"
  });

  sl.addText("Simulación MuJoCo\nHopping Robot on Boom Gantry", {
    x: 0.5, y: 2.25, w: 5.0, h: 0.85,
    fontSize: 15, color: CYAN, fontFace: "Calibri"
  });

  // nombres del equipo
  const team = [
    "Fernando Proal Sifuentes         A01385446",
    "Alexandro Kurt Cárdenas Pérez    A01385387",
    "Manuel Ferro Sánchez             A00836182",
    "Fabricio Banda Hernández         A00839916",
    "Zacbe Ortega Obregón             A00574358",
  ];
  sl.addText(
    team.map((n, i) => ({
      text: n,
      options: { breakLine: i < team.length - 1, color: "8ABCD4", fontSize: 11, fontFace: "Calibri" }
    })),
    { x: 0.5, y: 3.2, w: 5.1, h: 2.1 }
  );

  sl.addImage({
    path: img("mujoco_viewer.png"),
    x: 5.85, y: 0, w: 4.15, h: 5.625,
    sizing: { type: "cover", w: 4.15, h: 5.625 }
  });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 5.85, y: 0, w: 4.15, h: 5.625,
    fill: { color: DARK, transparency: 35 }, line: { color: DARK, transparency: 35 }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — QUÉ ES HOPPY
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: LIGHT_BG };

  sl.addText("¿Qué es HOPPY?", {
    x: 0.5, y: 0.3, w: 9, h: 0.65,
    fontSize: 36, bold: true, color: DARK_TEXT, fontFace: "Calibri"
  });

  sl.addImage({
    path: img("mujoco_viewer.png"),
    x: 5.4, y: 1.1, w: 4.2, h: 4.1,
    shadow: makeShadow()
  });

  const bullets = [
    "Robot monopata montado en un gantry tipo boom",
    "Yaw y pitch del boom son articulaciones pasivas — sin motor",
    "Solo hip (J3) y knee (J4) tienen actuadores",
    "El avance circular sale de empujar tangencialmente el suelo en STANCE",
    "Encoders de 4096 cuentas/rev como único sensor de velocidad",
    "Simulado en MuJoCo con física real: armadura, amortiguamiento y resorte de rodilla",
  ];
  sl.addText(
    bullets.map((b, i) => ({
      text: b,
      options: { bullet: true, color: DARK_TEXT, fontSize: 14, fontFace: "Calibri", paraSpaceAfter: 6, breakLine: i < bullets.length - 1 }
    })),
    { x: 0.5, y: 1.1, w: 4.7, h: 4.1 }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — ARQUITECTURA DEL SISTEMA
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: DARK };

  sl.addText("Arquitectura del sistema", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: WHITE, fontFace: "Calibri"
  });

  const cards = [
    { title: "J1 — Yaw",   body: "Pasivo\nBoom radio 556 mm\nNo motorizado",                cx: "00B4D8" },
    { title: "J2 — Pitch", body: "Pasivo\nGuía suave con torque externo\nEvita que el pie toque el suelo", cx: "0077B6" },
    { title: "J3 — Hip",   body: "Motorizado\nReductor 26.9x\nLímite ±20 Nm",              cx: "00B4D8" },
    { title: "J4 — Knee",  body: "Motorizado\nReductor 28.8x\nResorte pasivo + límite ±20 Nm", cx: "0077B6" },
  ];

  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7, y = 1.2 + row * 2.1;
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.2, h: 1.85,
      fill: { color: "162B3E" }, line: { color: c.cx, width: 1.5 }, rectRadius: 0.12,
      shadow: makeShadow()
    });
    sl.addText(c.title, { x: x+0.18, y: y+0.12, w: 3.85, h: 0.38, fontSize: 15, bold: true, color: c.cx, fontFace: "Calibri", margin: 0 });
    sl.addText(c.body,  { x: x+0.18, y: y+0.52, w: 3.85, h: 1.1,  fontSize: 13, color: "C8DCF0", fontFace: "Calibri", margin: 0 });
  });

  sl.addText("Modelo MJCF · dt = 1 ms · gravity = 9.81 m/s²\nEncoder: 4096 cnt/rev · filtro α = 0.18", {
    x: 0.5, y: 5.1, w: 9, h: 0.4,
    fontSize: 11, color: MUTED, fontFace: "Calibri", align: "center"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 4 — JACOBIANO Y CONTROLADOR CARTESIANO
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: LIGHT_BG };

  sl.addText("Jacobiano y controlador Cartesiano", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: DARK_TEXT, fontFace: "Calibri"
  });

  // ---- columna izquierda: FLIGHT ----
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.3, y: 1.05, w: 4.4, h: 4.3,
    fill: { color: DARK }, line: { color: CYAN, width: 1.5 }, rectRadius: 0.14,
    shadow: makeShadow()
  });

  sl.addText("FLIGHT — Impedancia Cartesiana", {
    x: 0.5, y: 1.18, w: 4.0, h: 0.45,
    fontSize: 14, bold: true, color: CYAN, fontFace: "Calibri", margin: 0
  });

  const flightLines = [
    { text: "Objetivo:", options: { bold: true, color: WHITE, fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "Posicionar el pie en un punto deseado\nen el espacio Cartesiano\n\n", options: { color: "A8C8E8", fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "Fuerza virtual en el pie:", options: { bold: true, color: WHITE, fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "f_sw = Kp·(p_des − p_toe) + Kd·(−ṗ_toe)\n\n", options: { color: CYAN, fontSize: 13, fontFace: "Courier New", breakLine: true } },
    { text: "Torque en articulaciones:", options: { bold: true, color: WHITE, fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "τ = Jᵀ · f_sw\n\n", options: { color: CYAN, fontSize: 14, fontFace: "Courier New", breakLine: true } },
    { text: "J  se calcula con mj_jacSite() sobre\nel sitio del pie — solo columnas hip y knee", options: { color: "8ABCD4", fontSize: 11, fontFace: "Calibri", breakLine: false } },
  ];
  sl.addText(flightLines, { x: 0.5, y: 1.72, w: 4.0, h: 3.4 });

  // ---- columna derecha: STANCE ----
  sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 1.05, w: 4.4, h: 4.3,
    fill: { color: DARK }, line: { color: "0077B6", width: 1.5 }, rectRadius: 0.14,
    shadow: makeShadow()
  });

  sl.addText("STANCE — Jacobiano transpuesto", {
    x: 5.5, y: 1.18, w: 4.0, h: 0.45,
    fontSize: 14, bold: true, color: "40BFFF", fontFace: "Calibri", margin: 0
  });

  const stanceLines = [
    { text: "Objetivo:", options: { bold: true, color: WHITE, fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "Generar una GRF deseada en el pie\npara propulsar y sostener el cuerpo\n\n", options: { color: "A8C8E8", fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "Fuerza deseada (3D):", options: { bold: true, color: WHITE, fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "F = fz·ẑ + ftan·t̂ + frad·r̂\n\n", options: { color: "40BFFF", fontSize: 13, fontFace: "Courier New", breakLine: true } },
    { text: "Torque feed-forward:", options: { bold: true, color: WHITE, fontSize: 12, fontFace: "Calibri", breakLine: true } },
    { text: "τ_ff = Jᵀ · F\n\n", options: { color: "40BFFF", fontSize: 14, fontFace: "Courier New", breakLine: true } },
    { text: "fz  viene de una curva Bézier de 5 puntos\nftan  propulsa el yaw pasivo\nfrad  evita deslizamiento lateral del pie", options: { color: "8ABCD4", fontSize: 11, fontFace: "Calibri", breakLine: false } },
  ];
  sl.addText(stanceLines, { x: 5.5, y: 1.72, w: 4.0, h: 3.4 });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5 — TIPOS DE CONTROLADOR
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: LIGHT_BG };

  sl.addText("Tipos de controlador", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: DARK_TEXT, fontFace: "Calibri"
  });

  const types = [
    { num: "01", title: "Híbrido FLIGHT/STANCE", body: "Controlador principal. Dos sub-controladores que se intercambian según la fuerza de contacto. Jacobiano transpuesto en STANCE, impedancia Cartesiana en FLIGHT.", active: true },
    { num: "02", title: "Solo feed-forward",     body: "Elimina el feedback de velocidad y postura. Útil como línea base para ver cuánto avance sale sin corrección de errores.", active: false },
    { num: "03", title: "Sin saturación de torque", body: "Desactiva los límites de ±20 Nm. El robot salta más alto y rápido pero los torques son físicamente irreales.", active: false },
    { num: "04", title: "Efectos físicos desactivados", body: "Flags --no-armature, --no-damping, --no-knee-spring. Permite aislar el impacto de cada efecto en la estabilidad.", active: false },
  ];

  types.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.4 + col * 4.65, y = 1.1 + row * 2.15;
    const bg          = t.active ? "0D1B2A" : WHITE;
    const titleColor  = t.active ? CYAN : DARK_TEXT;
    const bodyColor   = t.active ? "A8C8E8" : "445566";
    const numColor    = t.active ? "1E3A5A" : "E8EEF4";
    const borderColor = t.active ? CYAN : "D0DCEA";

    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.3, h: 1.9,
      fill: { color: bg }, line: { color: borderColor, width: 1.5 }, rectRadius: 0.12,
      shadow: makeShadow()
    });
    sl.addText(t.num,   { x: x+0.18, y: y+0.10, w: 0.6, h: 0.5, fontSize: 22, bold: true, color: numColor,   fontFace: "Calibri", margin: 0 });
    sl.addText(t.title, { x: x+0.18, y: y+0.52, w: 3.9, h: 0.38, fontSize: 14, bold: true, color: titleColor, fontFace: "Calibri", margin: 0 });
    sl.addText(t.body,  { x: x+0.18, y: y+0.90, w: 3.9, h: 0.9,  fontSize: 12, color: bodyColor, fontFace: "Calibri", margin: 0 });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 6 — MÁQUINA DE ESTADOS HÍBRIDA
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: DARK };

  sl.addText("Máquina de estados híbrida", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: WHITE, fontFace: "Calibri"
  });

  sl.addImage({
    path: img("circle_test_states.png"),
    x: 0.4, y: 1.05, w: 5.8, h: 2.9,
    shadow: makeShadow()
  });

  const facts = [
    { label: "Stance mín",  val: "105 ms" },
    { label: "Stance máx",  val: "175 ms" },
    { label: "Vuelo mín",   val: "240 ms" },
    { label: "Touchdown",   val: "> 0.5 N" },
    { label: "Liftoff",     val: "< 0.25 N" },
  ];
  facts.forEach((f, i) => {
    const y = 1.05 + i * 0.78;
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.45, y, w: 3.2, h: 0.62,
      fill: { color: "162B3E" }, line: { color: CYAN, width: 1 }, rectRadius: 0.08
    });
    sl.addText(f.label, { x: 6.62, y: y+0.06, w: 1.6,  h: 0.5, fontSize: 12, color: MUTED, fontFace: "Calibri", margin: 0, valign: "middle" });
    sl.addText(f.val,   { x: 8.10, y: y+0.06, w: 1.35, h: 0.5, fontSize: 15, bold: true, color: CYAN, fontFace: "Calibri", margin: 0, valign: "middle", align: "right" });
  });

  sl.addText("FLIGHT: impedancia Cartesiana en el pie  ·  STANCE: Jacobiano transpuesto con GRF Bézier", {
    x: 0.4, y: 5.1, w: 9.2, h: 0.35,
    fontSize: 11, color: MUTED, fontFace: "Calibri", align: "center"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 7 — RESULTADOS: TRAYECTORIA CIRCULAR
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: LIGHT_BG };

  sl.addText("Resultados — trayectoria circular", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: DARK_TEXT, fontFace: "Calibri"
  });

  sl.addImage({ path: img("circle_test_top_view_path.png"), x: 0.3, y: 1.0, w: 4.5, h: 4.4, shadow: makeShadow() });
  sl.addImage({ path: img("circle_test_contact_force.png"), x: 5.0, y: 1.0, w: 4.7, h: 2.8, shadow: makeShadow() });

  const stats = [
    { val: "0.58 rad/s", label: "yaw rate objetivo" },
    { val: "~80–90 N",   label: "fuerza pico por salto" },
    { val: "556 mm",     label: "radio del boom" },
  ];
  stats.forEach((s, i) => {
    const x = 5.0 + i * 1.57;
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 4.05, w: 1.4, h: 1.2,
      fill: { color: DARK_TEXT }, line: { color: DARK_TEXT }, rectRadius: 0.1,
      shadow: makeShadow()
    });
    sl.addText(s.val,   { x, y: 4.12, w: 1.4, h: 0.55, fontSize: 13, bold: true, color: CYAN,    fontFace: "Calibri", align: "center" });
    sl.addText(s.label, { x, y: 4.65, w: 1.4, h: 0.50, fontSize: 10, color: "8ABCD4", fontFace: "Calibri", align: "center" });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 8 — RESULTADOS: TORQUES Y ARTICULACIONES
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: DARK };

  sl.addText("Resultados — torques y articulaciones", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: WHITE, fontFace: "Calibri"
  });

  sl.addImage({ path: img("circle_test_torques.png"),        x: 0.3, y: 1.0,  w: 5.5, h: 2.7, shadow: makeShadow() });
  sl.addImage({ path: img("circle_test_joint_positions.png"), x: 0.3, y: 3.85, w: 5.5, h: 1.55, shadow: makeShadow() });

  const notes = [
    "Ambos motores se mantienen\ndentro del límite de ±20 Nm",
    "El knee trabaja más fuerte\nen STANCE (push-off vertical)",
    "Las posiciones de hip y knee\nocilan de forma periódica y estable",
  ];
  notes.forEach((n, i) => {
    sl.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.05, y: 1.1 + i * 1.5, w: 3.6, h: 1.3,
      fill: { color: "162B3E" }, line: { color: CYAN, width: 1.2 }, rectRadius: 0.1,
      shadow: makeShadow()
    });
    sl.addText(n, { x: 6.22, y: 1.17 + i * 1.5, w: 3.28, h: 1.15, fontSize: 13, color: "C8DCF0", fontFace: "Calibri", valign: "middle" });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 9 — PARÁMETROS CLAVE
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: LIGHT_BG };

  sl.addText("Parámetros clave", {
    x: 0.5, y: 0.25, w: 9, h: 0.6,
    fontSize: 34, bold: true, color: DARK_TEXT, fontFace: "Calibri"
  });

  const rows = [
    [
      { text: "Parámetro",   options: { bold: true, color: WHITE, fill: { color: DARK_TEXT }, fontSize: 13, fontFace: "Calibri", align: "center" } },
      { text: "Valor",       options: { bold: true, color: WHITE, fill: { color: DARK_TEXT }, fontSize: 13, fontFace: "Calibri", align: "center" } },
      { text: "Qué controla",options: { bold: true, color: WHITE, fill: { color: DARK_TEXT }, fontSize: 13, fontFace: "Calibri", align: "center" } },
    ],
    ["TARGET_YAW_RATE",      "0.58 rad/s",          "Velocidad angular alrededor del boom"],
    ["TANGENTIAL_FORCE_FF",  "78 N",                "Empuje tangencial feed-forward en STANCE"],
    ["T_STANCE",             "0.122 s",             "Duración nominal del apoyo"],
    ["MIN_FLIGHT_TIME",      "0.240 s",             "Previene saltos tipo chattering"],
    ["FZ_BEZIER",            "[0,360,920,460,0]",   "Perfil vertical de GRF (Bézier de 5 puntos)"],
    ["CIRCLE_DIRECTION",     "-1.0",                "Sentido horario (-1) o antihorario (+1)"],
    ["HIP / KNEE limit",     "±20 Nm",              "Saturación de torque en ambos motores"],
    ["LOWPASS_ALPHA",        "0.18",                "Filtro de velocidad estimada del encoder"],
  ];

  const tableData = rows.map((r, ri) => {
    if (ri === 0) return r;
    return r.map((cell, ci) => ({
      text: cell,
      options: {
        color: DARK_TEXT, fontSize: 12, fontFace: "Calibri", align: ci === 0 ? "left" : "center",
        fill: { color: ri % 2 === 0 ? "EAF1F8" : WHITE }
      }
    }));
  });

  sl.addTable(tableData, {
    x: 0.4, y: 1.05, w: 9.2, h: 4.3,
    border: { pt: 0.5, color: "C8D8E8" },
    rowH: 0.47,
    colW: [2.8, 2.2, 4.2],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 10 — CONCLUSIONES
// ─────────────────────────────────────────────────────────────────────────────
{
  let sl = pres.addSlide();
  sl.background = { color: DARK };

  sl.addImage({
    path: img("circle_test_top_view_path.png"),
    x: 5.5, y: 0, w: 4.5, h: 5.625,
    sizing: { type: "cover", w: 4.5, h: 5.625 },
    transparency: 70
  });

  sl.addText("Conclusiones", {
    x: 0.5, y: 0.35, w: 5, h: 0.6,
    fontSize: 36, bold: true, color: WHITE, fontFace: "Calibri"
  });

  const points = [
    "El controlador híbrido logra locomoción circular estable sin motor en el yaw",
    "La fuerza tangencial del Jacobiano transpuesto es suficiente para avanzar alrededor del boom",
    "El estimador de encoders funciona bien con solo un filtro pasa bajas de primer orden",
    "La saturación de torque y los efectos físicos son críticos para reproducir el comportamiento real",
    "El sistema supera todas las validaciones: torque, progresión, pitch y deslizamiento del pie",
  ];
  sl.addText(
    points.map((p, i) => ({
      text: p,
      options: { bullet: true, color: "C8DCF0", fontSize: 13.5, fontFace: "Calibri", paraSpaceAfter: 8, breakLine: i < points.length - 1 }
    })),
    { x: 0.5, y: 1.15, w: 5.0, h: 4.0 }
  );

  sl.addText("Team 1  —  Implementación de Robótica Inteligente", {
    x: 0.5, y: 5.15, w: 9, h: 0.35,
    fontSize: 11, color: MUTED, fontFace: "Calibri"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: path.join(ROOT, "HOPPY_Team1.pptx") })
  .then(() => console.log("✓ HOPPY_Team1.pptx guardado"))
  .catch(e => { console.error(e); process.exit(1); });
