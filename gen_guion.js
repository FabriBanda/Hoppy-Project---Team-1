const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer
} = require("docx");
const fs = require("fs");

const COLORS = {
  p1: "1F3864", // Azul oscuro - Persona 1
  p2: "7B2D8B", // Morado - Persona 2
  p3: "C55A11", // Naranja - Persona 3
  p4: "375623", // Verde oscuro - Persona 4
  bg1: "DCE6F1",
  bg2: "EDE2F5",
  bg3: "FCE4D6",
  bg4: "E2EFDA",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function speakerBlock(persona, nombre, color, bgColor, lines) {
  const rows = [];
  // Header row
  rows.push(new TableRow({
    children: [new TableCell({
      borders,
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: color, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 160, right: 160 },
      children: [new Paragraph({
        children: [new TextRun({ text: `${persona}  —  ${nombre}`, bold: true, size: 22, font: "Arial", color: "FFFFFF" })]
      })]
    })]
  }));
  // Lines
  lines.forEach(line => {
    const isNote = line.startsWith("[");
    rows.push(new TableRow({
      children: [new TableCell({
        borders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: isNote ? "F5F5F5" : bgColor, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 200, right: 160 },
        children: [new Paragraph({
          children: [new TextRun({
            text: line,
            size: 22,
            font: "Arial",
            italics: isNote,
            color: isNote ? "888888" : "222222"
          })]
        })]
      })]
    }));
  });
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 340, after: 120 },
    children: [new TextRun({ text: `▶  ${text}`, bold: true, size: 28, font: "Arial", color: "2E75B6" })]
  });
}

function space() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 60, after: 60 } });
}

function timerNote(text) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, after: 0 },
    children: [new TextRun({ text: `⏱  ${text}`, size: 18, font: "Arial", color: "AAAAAA", italics: true })]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
          children: [new TextRun({ text: "Gui\xF3n de Presentaci\xF3n  —  Proyecto HOPPY en MuJoCo", size: 19, font: "Arial", color: "666666" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
          children: [
            new TextRun({ text: "P\xE1g. ", size: 18, font: "Arial", color: "AAAAAA" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "AAAAAA" })
          ]
        })]
      })
    },
    children: [

      // PORTADA
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 160 },
        children: [new TextRun({ text: "Gui\xF3n de Presentaci\xF3n", bold: true, size: 48, font: "Arial", color: "1F3864" })]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 },
        children: [new TextRun({ text: "Simulaci\xF3n del Robot HOPPY en MuJoCo", bold: true, size: 32, font: "Arial", color: "2E75B6" })]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 500 },
        children: [new TextRun({ text: "Duraci\xF3n total aprox. 8–10 minutos", size: 22, font: "Arial", color: "888888", italics: true })]
      }),

      // Tabla de repartos
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 3780, 3780],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1800, type: WidthType.DXA },
              shading: { fill: "1F3864", type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: "Persona", bold: true, size: 21, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 3780, type: WidthType.DXA },
              shading: { fill: "1F3864", type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: "Secci\xF3n", bold: true, size: 21, font: "Arial", color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 3780, type: WidthType.DXA },
              shading: { fill: "1F3864", type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: "Tiempo est.", bold: true, size: 21, font: "Arial", color: "FFFFFF" })] })] }),
          ]}),
          ...[
            ["P1", "Introducci\xF3n + \xBFQu\xE9 es HOPPY?", "~2 min", COLORS.bg1],
            ["P2", "Modelo mec\xE1nico + Actuadores", "~2 min", COLORS.bg2],
            ["P3", "Contacto + Control h\xEDbrido", "~2.5 min", COLORS.bg3],
            ["P4", "Sensores + Resultados + Cierre", "~2 min", COLORS.bg4],
          ].map(([p, s, t, bg]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 1800, type: WidthType.DXA },
              shading: { fill: bg, type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: p, bold: true, size: 21, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: 3780, type: WidthType.DXA },
              shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: s, size: 21, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: 3780, type: WidthType.DXA },
              shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: t, size: 21, font: "Arial" })] })] }),
          ]}))
        ]
      }),

      space(), space(),

      // === PARTE 1 ===
      sectionTitle("PARTE 1 — Introducci\xF3n y \xBFQu\xE9 es HOPPY?"),
      timerNote("~2 min"),
      space(),
      speakerBlock("PERSONA 1", "Nombre", COLORS.p1, COLORS.bg1, [
        "Buenos d\xEDas. En este proyecto simulamos en MuJoCo el robot HOPPY: un sistema de locomoci\xF3n de una sola pata montada en un gantry giratorio.",
        "La pregunta central que resolvimos es: \xBFC\xF3mo hace un robot de una sola pata para caminar en c\xEDrculos sin tener motor en el eje de giro?",
        "[Mostrar la simulaci\xF3n corriendo o una captura del viewer]",
        "La respuesta est\xE1 en el salto. Cada vez que la pata empuja el suelo, genera una fuerza horizontal que hace girar pasivamente el boom. No hay motor en el eje de yaw ni en el pitch; ambos son completamente pasivos.",
        "El sistema tiene cuatro grados de libertad: yaw y pitch pasivos en el gantry, y cadera y rodilla activos en la pata. Solo los dos \xFAltimos tienen motor.",
        "Con eso, el objetivo fue implementar todo el ciclo: modelo f\xEDsico real, control h\xEDbrido de vuelo y apoyo, y an\xE1lisis de resultados. Persona 2 les explica el modelo.",
      ]),

      space(), space(),

      // === PARTE 2 ===
      sectionTitle("PARTE 2 — Modelo Mec\xE1nico y Actuadores"),
      timerNote("~2 min"),
      space(),
      speakerBlock("PERSONA 2", "Nombre", COLORS.p2, COLORS.bg2, [
        "Para que la simulaci\xF3n sea fiel al robot real, implementamos tres efectos f\xEDsicos clave en el XML de MuJoCo.",
        "Primero: la inercia reflejada del rotor, o armature. Los motores usan reductores de 26.9 y 28.8. Cuando la articulaci\xF3n acelera, tambi\xE9n acelera el rotor amplificado por N cuadrado. Esto hace el sistema m\xE1s pesado din\xE1micamente, lo cual es realista.",
        "Segundo: amortiguamiento equivalente por back-EMF. Cuando el motor gira, genera una corriente de frenado proporcional a la velocidad. Lo modelamos con la f\xF3rmula b = Kv por Kt por N cuadrado sobre Rw.",
        "Tercero: un resorte paralelo en la rodilla. Almacena energ\xEDa cuando la rodilla se flexiona al aterrizar y la libera en el push-off, como un tend\xF3n de Aquiles artificial. Reduce el torque que tiene que hacer el motor.",
        "[Mostrar gr\xE1fica de torques o joint positions]",
        "Y en cuanto a saturaci\xF3n: los motores tienen un l\xEDmite de \xB120 N\xB7m. Si el controlador pide m\xE1s, se recorta. Esto lo implementamos tanto en el c\xF3digo como en el XML.",
      ]),

      space(), space(),

      // === PARTE 3 ===
      sectionTitle("PARTE 3 — Contacto y Control H\xEDbrido"),
      timerNote("~2.5 min"),
      space(),
      speakerBlock("PERSONA 3", "Nombre", COLORS.p3, COLORS.bg3, [
        "El contacto pie-suelo es cr\xEDtico. Si est\xE1 mal configurado, el pie rebota o se hunde. Usamos solref y solimp ajustados para simular un suelo r\xEDgido: el contacto se resuelve en 1.5 milisegundos con alta impedancia. Adem\xE1s, la fricci\xF3n del piso es alta para que el pie no resbale al empujar.",
        "Para detectar el aterrizaje medimos la fuerza normal de contacto en cada paso de 1 ms. Si sube de 0.5 Newtons despu\xE9s de al menos 240 ms de vuelo, es touchdown. Si baja de 0.25 Newtons y ya pas\xF3 el tiempo m\xEDnimo de apoyo, es liftoff.",
        "El control es h\xEDbrido: alterna entre dos estados.",
        "Durante FLIGHT, el controlador lleva el pie a una posici\xF3n deseada en 3D usando el Jacobiano transpuesto: tau igual a J transpuesta por F. Primero levanta el pie para no arrastrarlo, luego lo lleva adelante para el siguiente paso.",
        "Durante STANCE, el controlador genera fuerzas de reacci\xF3n al suelo: una fuerza vertical con perfil Bezier para el salto, y una fuerza tangencial para avanzar en el c\xEDrculo. Esa fuerza tangencial es lo que hace girar el boom pasivamente.",
        "[Mostrar gr\xE1fica de estados FLIGHT/STANCE y fuerzas de contacto]",
      ]),

      space(), space(),

      // === PARTE 4 ===
      sectionTitle("PARTE 4 — Sensores, Resultados y Cierre"),
      timerNote("~2 min"),
      space(),
      speakerBlock("PERSONA 4", "Nombre", COLORS.p4, COLORS.bg4, [
        "Un \xFAltimo detalle importante: el controlador no usa las velocidades perfectas de MuJoCo. En su lugar emulamos encoders reales: cuantizamos la posici\xF3n a 4096 cuentas por vuelta, derivamos num\xE9ricamente y aplicamos un filtro pasa-bajas. As\xED el software funciona igual que en el robot f\xEDsico.",
        "[Mostrar gr\xE1fica de velocidades articulares estimadas vs cartesianas]",
        "En cuanto a resultados: el robot logra un patr\xF3n de salto estable y peri\xF3dico. La pata genera la locomoci\xF3n, el gantry gira pasivamente, y todas las restricciones f\xEDsicas se respetan.",
        "Generamos siete gr\xE1ficas de an\xE1lisis: posiciones articulares, posici\xF3n cartesiana del pie, velocidades articulares estimadas, velocidades cartesianas del pie, fuerzas de contacto, torques de control y estados de la m\xE1quina h\xEDbrida.",
        "En resumen: implementamos un sistema completo de simulaci\xF3n con din\xE1mica real, control h\xEDbrido y procesamiento de se\xF1ales realista. El robot HOPPY salta, avanza y gira usando solo dos motores.",
        "Gracias. Estamos listos para preguntas.",
      ]),

      space(), space(),

      // === TIPS ===
      new Paragraph({ spacing: { before: 300, after: 120 },
        children: [new TextRun({ text: "📋  Consejos para la presentaci\xF3n", bold: true, size: 26, font: "Arial", color: "555555" })]
      }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          ...[
            "Abran la simulaci\xF3n con --viewer antes de empezar para tenerla lista y no perder tiempo.",
            "Cada persona debe tener ABIERTA su gr\xE1fica correspondiente para mostrarla en su turno sin buscar.",
            "Si preguntan sobre c\xF3digo espec\xEDfico: params.py tiene todos los par\xE1metros, controller.py tiene el control, hoppy.xml tiene el modelo.",
            "Si no saben una respuesta: 'Eso lo revisamos en el c\xF3digo, pero la raz\xF3n principal es...' y vuelvan a lo que s\xED saben.",
            "No lean el gui\xF3n: \xFAsalo como referencia, hablen con sus propias palabras.",
          ].map((tip, i) => new TableRow({ children: [
            new TableCell({
              borders,
              width: { size: 9360, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? "FFFDE7" : "FFFFF5", type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 160, right: 160 },
              children: [new Paragraph({ children: [
                new TextRun({ text: `${i + 1}.  `, bold: true, size: 21, font: "Arial", color: "B8860B" }),
                new TextRun({ text: tip, size: 21, font: "Arial" })
              ]})]
            })
          ]}))
        ]
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/Users/fabribanda/Downloads/HOPPY_Guion_Presentacion.docx", buf);
  console.log("Listo: /Users/fabribanda/Downloads/HOPPY_Guion_Presentacion.docx");
});
