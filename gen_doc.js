const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer
} = require("docx");
const fs = require("fs");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "2E75B6" };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, color: "1F3864", font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: "2E75B6", font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: "404040", font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 100 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function qaTable(question, answer) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    spacing: { before: 120, after: 120 },
    rows: [
      new TableRow({
        children: [new TableCell({
          borders,
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: "DCE6F1", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 80, left: 160, right: 160 },
          children: [new Paragraph({
            children: [
              new TextRun({ text: "P: ", bold: true, size: 22, font: "Arial", color: "1F3864" }),
              new TextRun({ text: question, bold: true, size: 22, font: "Arial" })
            ]
          })]
        })]
      }),
      new TableRow({
        children: [new TableCell({
          borders,
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 120, left: 160, right: 160 },
          children: [new Paragraph({
            children: [
              new TextRun({ text: "R: ", bold: true, size: 22, font: "Arial", color: "2E75B6" }),
              new TextRun({ text: answer, size: 22, font: "Arial" })
            ]
          })]
        })]
      })
    ]
  });
}

function space() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 80, after: 80 } });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
          children: [
            new TextRun({ text: "Proyecto HOPPY en MuJoCo  —  Gu\xEDa de Estudio", size: 20, font: "Arial", color: "555555" })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
          children: [
            new TextRun({ text: "P\xE1gina ", size: 18, font: "Arial", color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "888888" })
          ]
        })]
      })
    },
    children: [
      // PORTADA
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 200 },
        children: [new TextRun({ text: "Simulaci\xF3n del Robot HOPPY", bold: true, size: 52, font: "Arial", color: "1F3864" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 100 },
        children: [new TextRun({ text: "en MuJoCo", bold: true, size: 40, font: "Arial", color: "2E75B6" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 600 },
        children: [new TextRun({ text: "Gu\xEDa de funcionamiento y preguntas frecuentes", size: 24, font: "Arial", color: "666666", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Dr. Ismael Sanchez Osorio", size: 22, font: "Arial", color: "444444" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 800 },
        children: [new TextRun({ text: "Junio 2026", size: 22, font: "Arial", color: "888888" })]
      }),

      // SECCION 1
      h1("1. \xBFQu\xE9 es HOPPY?"),
      p("HOPPY es un robot con una sola pata que salta. Est\xE1 montado en un gantry (una barra giratoria fija al techo), lo que hace que el robot camine en c\xEDrculos alrededor de un eje central. No tiene ruedas ni m\xFAltiples patas: toda la locomoci\xF3n viene de saltar con una sola pierna."),
      space(),
      p("El sistema tiene 4 articulaciones (DoF):"),
      bullet("Yaw (joint1): giro horizontal del gantry. PASIVA, no tiene motor."),
      bullet("Pitch (joint2): inclinaci\xF3n del boom. PASIVA, no tiene motor."),
      bullet("Hip (joint3): cadera de la pata. ACTIVA, tiene motor."),
      bullet("Knee (joint4): rodilla de la pata. ACTIVA, tiene motor."),
      space(),
      p("La idea es simple: la pata empuja el suelo hacia atr\xE1s en cada salto, y eso hace que el gantry gire. No hay motor en el eje de giro: la rotaci\xF3n es completamente pasiva, generada por la fuerza del salto."),

      // SECCION 2
      h1("2. C\xF3mo funciona el ciclo de salto"),
      p("El robot alterna entre dos estados:"),
      space(),
      h2("Estado FLIGHT (Vuelo)"),
      p("El pie no toca el suelo. El controlador mueve la pata para prepararla para el siguiente impacto:"),
      bullet("Levanta el pie para no arrastrarlo."),
      bullet("Coloca el pie un poco adelante y hacia afuera para el siguiente paso."),
      bullet("Usa control cartesiano: calcula a d\xF3nde quiere llevar el pie en el espacio 3D y lo logra con la f\xF3rmula τ = Jᵀ \xB7 F (Jacobiano transpuesto)."),
      space(),
      h2("Estado STANCE (Apoyo)"),
      p("El pie est\xE1 en el suelo. El controlador genera fuerzas en dos direcciones:"),
      bullet("Vertical (Fz): un perfil Bezier de fuerza que comprime y luego empuja hacia arriba para lanzar el cuerpo."),
      bullet("Tangencial (Ftan): empuje horizontal en la direcci\xF3n del c\xEDrculo, que es lo que hace avanzar al robot."),
      space(),
      p("Las transiciones entre estados se detectan midiendo la fuerza de contacto pie-suelo: si la fuerza sube de 0.5 N = touchdown, si baja de 0.25 N = liftoff."),

      // SECCION 3
      h1("3. Los motores y sus limitaciones f\xEDsicas"),
      p("Los motores usan reductores para multiplicar el torque. Esto tiene dos efectos importantes que el modelo incluye:"),
      space(),
      h2("Inercia reflejada (Armature)"),
      p("Cada vez que la articulaci\xF3n acelera, tambi\xE9n tiene que acelerar el rotor del motor (amplificado por N\xB2). Esto hace el sistema m\xE1s “pesado” din\xE1micamente y reduce las oscilaciones artificiales. Se calcula como:"),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "I_ref = N\xB2 \xD7 I_rotor", bold: true, size: 24, font: "Courier New", color: "1F3864" })]
      }),
      bullet("Hip: 26.9\xB2 \xD7 7\xD710⁻⁶ = 0.00507 kg\xB7m\xB2"),
      bullet("Knee: 28.8\xB2 \xD7 7\xD710⁻⁶ = 0.00581 kg\xB7m\xB2"),
      space(),
      h2("Amortiguamiento equivalente (back-EMF)"),
      p("Cuando el motor gira, genera una corriente de frenado proporcional a la velocidad. Se modela como un t\xE9rmino de amortiguamiento viscoso calculado de las constantes el\xE9ctricas del motor:"),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "b = Kv \xD7 Kt \xD7 N\xB2 / Rw", bold: true, size: 24, font: "Courier New", color: "1F3864" })]
      }),
      space(),
      h2("Saturaci\xF3n de torque"),
      p("Los motores no pueden generar torque infinito. El l\xEDmite es \xB120 N\xB7m para hip y knee. El controlador recorta cualquier torque que exceda ese valor antes de enviarlo."),
      space(),
      h2("Resorte de rodilla"),
      p("La rodilla tiene un resorte paralelo (stiffness = 0.0484 N\xB7m/rad). Almacena energ\xEDa cuando la rodilla se flexiona y la libera en el push-off, como un tend\xF3n de Aquiles."),

      // SECCION 4
      h1("4. El modelo de contacto"),
      p("El contacto pie-suelo usa par\xE1metros cuidadosamente ajustados para parecer r\xEDgido sin inestabilizar la simulaci\xF3n:"),
      bullet("solref=\"0.0015 1\": el contacto se resuelve en 1.5 ms (muy r\xE1pido = suelo duro)."),
      bullet("solimp=\"0.97 0.995 0.0005\": alta impedancia = casi sin penetraci\xF3n del pie en el suelo."),
      bullet("Fricci\xF3n alta en el piso (6.0): evita que el pie resbale y pierde energ\xEDa de propulsi\xF3n."),
      bullet("Integrador RK4 a 1 kHz: m\xE1xima precisi\xF3n en las din\xE1micas r\xE1pidas del impacto."),

      // SECCION 5
      h1("5. Los sensores y el filtrado"),
      p("El controlador NO usa las velocidades perfectas de MuJoCo (qvel). En su lugar emula encoders reales:"),
      bullet("Cuantiza la posici\xF3n a 4096 cuentas por vuelta (igual que un encoder f\xEDsico)."),
      bullet("Deriva num\xE9ricamente: v = Δq / Δt."),
      bullet("Aplica un filtro pasa-bajas discreto con alpha = 0.18 para eliminar ruido de cuantizaci\xF3n."),
      space(),
      p("Esto hace la simulaci\xF3n m\xE1s realista: el controlador trabaja con velocidades ruidosas, igual que en el robot real."),

      // PREGUNTAS
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),
      h1("6. Preguntas frecuentes del proyecto"),

      space(),
      h2("Fase 1: Modelo mec\xE1nico"),
      space(),

      qaTable(
        "\xBFPor qu\xE9 el gantry tiene articulaciones pasivas y no activas?",
        "Porque as\xED est\xE1 construido el robot f\xEDsico. El boom solo gira libremente; no hay motor en yaw ni en pitch. La locomoci\xF3n circular es un efecto emergente de las fuerzas que genera la pata al saltar: el robot empuja el suelo tangencialmente y esa reacci\xF3n hace girar el gantry."
      ),
      space(),

      qaTable(
        "\xBFQu\xE9 es la inercia reflejada y por qu\xE9 importa?",
        "Cuando el motor acelera, tambi\xE9n acelera su rotor (que gira mucho m\xE1s r\xE1pido por el reductor). La inercia del rotor se ‘refleja’ a la articulaci\xF3n amplificada por N\xB2. Sin este par\xE1metro el robot acelerar\xEDa instant\xE1neamente, lo cual es f\xEDsicamente imposible. Incluirlo hace que los impactos y transiciones sean realistas."
      ),
      space(),

      qaTable(
        "\xBFPor qu\xE9 se incluye un resorte en la rodilla?",
        "El robot f\xEDsico HOPPY tiene un resorte mec\xE1nico paralelo a la articulaci\xF3n de la rodilla. Este resorte almacena energ\xEDa el\xE1stica cuando la rodilla se flexiona (compresi\xF3n al aterrizar) y la libera en el push-off (igual que un tend\xF3n). Reduce el torque requerido al motor y mejora la eficiencia energ\xE9tica del salto."
      ),
      space(),

      qaTable(
        "\xBFC\xF3mo se calcula el amortiguamiento del actuador?",
        "Se deriva de las constantes el\xE9ctricas del motor: b = Kv \xD7 Kt \xD7 N\xB2 / Rw. Kv es la constante de velocidad, Kt la constante de torque, N el ratio del reductor y Rw la resistencia del devanado. Este t\xE9rmino modela la fuerza de frenado que genera el back-EMF cuando el motor gira."
      ),
      space(),

      h2("Fase 2: Actuadores y restricciones"),
      space(),

      qaTable(
        "\xBFPor qu\xE9 se satura el torque a \xB120 N\xB7m?",
        "Es el l\xEDmite f\xEDsico de los motores del robot. Se calcula como Kt \xD7 N \xD7 I_max. Cualquier torque mayor no puede ser generado y sobreestimar\xEDa las capacidades del sistema real. La saturaci\xF3n garantiza que la simulaci\xF3n sea f\xEDsicamente alcanzable."
      ),
      space(),

      qaTable(
        "\xBFQu\xE9 pasa si se quita la saturaci\xF3n de torque?",
        "El robot podr\xEDa saltar mucho mejor artificialmente porque los motores tendr\xEDan torque ilimitado. La simulaci\xF3n tiene la opci\xF3n --no-torque-saturation exactamente para comparar y demostrar su influencia. Con saturaci\xF3n, el comportamiento representa lo que puede hacer el robot real."
      ),
      space(),

      h2("Fase 3: Contacto"),
      space(),

      qaTable(
        "\xBFC\xF3mo detecta el robot que aterriz\xF3?",
        "El controlador revisa en cada paso (cada 1 ms) la fuerza normal del contacto pie-suelo usando mj_contactForce. Si la fuerza sube por encima de 0.5 N y el robot lleva m\xE1s de 240 ms volando, se activa el estado STANCE. Para el despegue, si la fuerza baja de 0.25 N y el tiempo m\xEDnimo de apoyo (105 ms) ya pas\xF3, vuelve a FLIGHT."
      ),
      space(),

      qaTable(
        "\xBFPor qu\xE9 se usa RK4 y Newton solver?",
        "RK4 (Runge-Kutta de 4to orden) es un integrador de alta precisi\xF3n que captura correctamente las din\xE1micas r\xE1pidas del impacto. El solver Newton con 50 iteraciones resuelve los contactos con alta precisi\xF3n. La combinaci\xF3n evita rebotes artificiales y penetraciones excesivas del pie en el suelo."
      ),
      space(),

      h2("Fase 4: Control"),
      space(),

      qaTable(
        "\xBFQu\xE9 es el Jacobiano transpuesto y para qu\xE9 se usa?",
        "El Jacobiano J relaciona velocidades articulares con velocidades cartesianas del pie. Su transpuesto convierte fuerzas cartesianas en torques articulares: τ = Jᵀ \xB7 F. Esto permite al controlador pensar en ‘quiero una fuerza de 50 N hacia adelante’ y calcular autom\xE1ticamente los torques de hip y knee necesarios para lograrla."
      ),
      space(),

      qaTable(
        "\xBFPor qu\xE9 se usa un perfil Bezier para la fuerza vertical?",
        "El perfil Bezier define c\xF3mo var\xEDa la fuerza vertical durante el apoyo: comienza en cero (touchdown suave), sube a un pico (compresi\xF3n y empuje), y vuelve a cero (liftoff suave). Esto evita discontinuidades bruscas de fuerza que desestabilizar\xEDan al robot. La forma del Bezier se ajust\xF3 para maximizar el impulso vertical manteniendo estabilidad."
      ),
      space(),

      qaTable(
        "\xBFC\xF3mo hace el robot para girar en c\xEDrculo sin motor en el eje de giro?",
        "Durante el apoyo, el controlador aplica una fuerza tangencial (en la direcci\xF3n del movimiento circular). Esta fuerza horizontal empuja el suelo en sentido contrario al movimiento deseado. La reacci\xF3n del suelo empuja el pie hacia adelante, lo que a su vez aplica un torque sobre el gantry pasivo haci\xE9ndolo girar. Es el mismo principio por el que puedes girar parado en un carrusel empujando el suelo."
      ),
      space(),

      qaTable(
        "\xBFQu\xE9 hace el controlador durante el vuelo?",
        "Durante FLIGHT, el controlador ejecuta una trayectoria de swing: primero levanta el pie (clearance) para no arrastrarlo, luego lo lleva hacia adelante y adentro (preparaci\xF3n del touchdown). Todo esto se hace con un controlador PD en espacio cartesiano: el pie tiene una posici\xF3n deseada en 3D y se aplica Jᵀ \xB7 (Kp \xD7 error_posicion + Kd \xD7 error_velocidad)."
      ),
      space(),

      h2("Fase 5: Sensores y se\xF1ales"),
      space(),

      qaTable(
        "\xBFPor qu\xE9 no se usan las velocidades perfectas de MuJoCo directamente?",
        "En el robot real no hay sensor de velocidad directo: solo hay encoders que miden posici\xF3n. La velocidad se tiene que calcular por diferencia finita y filtrar. Usar qvel directamente ser\xEDa trampa porque dar\xEDa al controlador informaci\xF3n ideal que no tendr\xEDa en la pr\xE1ctica. El estimador de velocidad emula exactamente c\xF3mo funcionar\xEDa el software embebido real."
      ),
      space(),

      qaTable(
        "\xBFQu\xE9 muestra la gr\xE1fica de velocidades cartesianas?",
        "Muestra la velocidad del pie (toe) en los tres ejes del mundo (X, Y, Z) a lo largo del tiempo. Se calculan derivando num\xE9ricamente la posici\xF3n cartesiana del pie y aplicando el mismo filtro pasa-bajas del encoder. En la gr\xE1fica se puede ver claramente: durante STANCE la velocidad Z va de negativa (bajando) a positiva (push-off), y en FLIGHT el pie se mueve r\xE1pido para preparar el siguiente touchdown."
      ),
      space(),

      qaTable(
        "\xBFQu\xE9 informaci\xF3n da la gr\xE1fica de la m\xE1quina de estados?",
        "Muestra una se\xF1al binaria a lo largo del tiempo: 0 = FLIGHT, 1 = STANCE. Permite visualizar cu\xE1nto dura cada fase y verificar que el robot tiene un patr\xF3n de salto estable y peri\xF3dico. Si los pulsos de STANCE son irregulares o muy cortos/largos, indica que el controlador tiene problemas de estabilidad."
      ),
      space(),

      // RESUMEN FINAL
      h1("7. Resumen ejecutivo del proyecto"),
      space(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders, width: { size: 3000, type: WidthType.DXA },
                shading: { fill: "1F3864", type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ children: [new TextRun({ text: "Categor\xEDa", bold: true, size: 22, font: "Arial", color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders, width: { size: 6360, type: WidthType.DXA },
                shading: { fill: "1F3864", type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ children: [new TextRun({ text: "Implementaci\xF3n", bold: true, size: 22, font: "Arial", color: "FFFFFF" })] })]
              })
            ]
          }),
          ...([
            ["Modelo mec\xE1nico", "4 DoF, masas reales, armature reflejada, amortiguamiento back-EMF, resorte de rodilla"],
            ["Actuadores", "Saturaci\xF3n \xB120 N\xB7m con relaci\xF3n torque-velocidad, doble protecci\xF3n (c\xF3digo + XML)"],
            ["Contacto", "Contacto duro: solref/solimp ajustados, friccion alta, detecci\xF3n por fuerza normal"],
            ["Control h\xEDbrido", "M\xE1quina FLIGHT/STANCE, Jacobiano transpuesto, perfil Bezier, feedback de yaw rate"],
            ["Sensores", "Encoder cuantizado, derivaci\xF3n num\xE9rica, filtro pasa-bajas, sin uso de qvel"],
            ["Gr\xE1ficas", "7 plots: posiciones, velocidades articulares y cartesianas, contacto, torques, estados"]
          ].map(([cat, impl], i) =>
            new TableRow({
              children: [
                new TableCell({
                  borders, width: { size: 3000, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? "DCE6F1" : "EBF2FA", type: ShadingType.CLEAR },
                  margins: { top: 100, bottom: 100, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: cat, bold: true, size: 21, font: "Arial" })] })]
                }),
                new TableCell({
                  borders, width: { size: 6360, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? "F7FAFD" : "FFFFFF", type: ShadingType.CLEAR },
                  margins: { top: 100, bottom: 100, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: impl, size: 21, font: "Arial" })] })]
                })
              ]
            })
          ))
        ]
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/Users/fabribanda/Downloads/HOPPY_Guia_Proyecto.docx", buf);
  console.log("Listo: /Users/fabribanda/Downloads/HOPPY_Guia_Proyecto.docx");
});
