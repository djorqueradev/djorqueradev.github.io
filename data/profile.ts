/**
 * CV data shown in the "Experience & education" card (English / Spanish).
 * Source: CV-Diego-Jorquera-Luna.pdf and the previous portfolio.
 */

type T = { en: string; es: string }

export interface ExperienceItem {
  period: T
  role: T
  org: string
  points: T[]
}

export const experience: ExperienceItem[] = [
  {
    period: { en: "2026 — Present", es: "2026 — Actualidad" },
    role: { en: "Co-owner & Full-Stack Developer", es: "Co-propietario y Desarrollador Full-Stack" },
    org: "Novagy",
    points: [
      {
        en: "Co-founder of a software house building CRM and business-management products; executive and technology lead together with my partner.",
        es: "Cofundador de una software house de soluciones CRM y gestión empresarial; dirección ejecutiva y tecnológica junto a mi socio.",
      },
      {
        en: "Architecture and development of ObraDesk and Dentisk (a full CRM for dental clinics).",
        es: "Arquitectura y desarrollo de ObraDesk y Dentisk (CRM integral para clínicas dentales).",
      },
      {
        en: "Led the brand's legal restructuring to scale its B2B products.",
        es: "Gestión de la reestructuración legal de la marca para escalar las soluciones B2B.",
      },
    ],
  },
  {
    period: { en: "2026 — Present", es: "2026 — Actualidad" },
    role: { en: "IoT & Full-Stack Developer — HGV Data Logger", es: "Desarrollador IoT y Full-Stack — Data Logger HGV" },
    org: "Centro de Transporte y Logística (CTL) — UNAB",
    points: [
      {
        en: "Back at the CTL with a new project: an IoT telemetry prototype for heavy goods vehicles (ESP32-S3, CAN bus, GPS).",
        es: "De vuelta en el CTL con un nuevo proyecto: un prototipo de telemetría IoT para vehículos pesados de carga (ESP32-S3, bus CAN, GPS).",
      },
      {
        en: "Firmware, FastAPI fleet backend, SwiftUI iOS app and a 3D-printed enclosure designed in OpenSCAD, plus Python tools to clean GPS data.",
        es: "Firmware, backend de flota en FastAPI, app iOS en SwiftUI y carcasa impresa en 3D diseñada en OpenSCAD, además de herramientas en Python para limpiar datos GPS.",
      },
    ],
  },
  {
    period: { en: "2023 — Present", es: "2023 — Actualidad" },
    role: { en: "Mentor & Academic Tutor", es: "Mentor y Tutor Académico" },
    org: "Universidad Andrés Bello",
    points: [
      {
        en: "Mentoring first-year students in the course “Taller para la vida Universitaria”.",
        es: "Mentoría a estudiantes de primeros años en la asignatura “Taller para la vida Universitaria”.",
      },
      {
        en: "Outreach team: representing the university at schools, fairs and talks.",
        es: "Team Difusión: representación de la universidad en colegios, ferias y charlas.",
      },
      {
        en: "Teaching support in programming labs (Python, C) and engineering science courses.",
        es: "Apoyo en laboratorios y cátedras de Programación (Python, C) y Ciencias de la Ingeniería.",
      },
    ],
  },
  {
    period: { en: "2025 — 2026", es: "2025 — 2026" },
    role: { en: "Call Center Executive — Pregrado Advance", es: "Ejecutivo de Call Center — Pregrado Advance" },
    org: "Increméntales · UNAB",
    points: [
      {
        en: "Guidance and follow-up for applicants, meeting enrollment and retention targets.",
        es: "Atención y orientación a postulantes, cumpliendo metas de captación y retención de matrículas.",
      },
    ],
  },
  {
    period: { en: "2025", es: "2025" },
    role: { en: "Professional Internship II", es: "Práctica Profesional II" },
    org: "Centro de Transporte y Logística (CTL) — UNAB",
    points: [
      {
        en: "Computational models for route and logistics optimization; large-scale mobility data analysis for strategic reports.",
        es: "Modelos computacionales para optimización de rutas y procesos logísticos; análisis de grandes volúmenes de datos de movilidad.",
      },
    ],
  },
  {
    period: { en: "2025", es: "2025" },
    role: { en: "Professional Internship I — Data Science Research", es: "Práctica Profesional I — Investigación en Ciencia de Datos" },
    org: "UNAB · Prof. Gustavo Gatica",
    points: [
      {
        en: "Built and managed the “Repositorio-Ciencia-de-Datos” project and data-analysis tools for academic research.",
        es: "Desarrollo y gestión del proyecto “Repositorio-Ciencia-de-Datos” y de herramientas de análisis para investigación académica.",
      },
    ],
  },
]

export const education: { title: T; org: string; period: T }[] = [
  {
    title: { en: "Computer Engineering (Ingeniería Civil en Informática) — 5th year", es: "Ingeniería Civil en Informática — 5.º año" },
    org: "Universidad Andrés Bello",
    period: { en: "2022 — Present", es: "2022 — Actualidad" },
  },
  {
    title: { en: "Licentiate in Engineering Sciences", es: "Licenciatura en Ciencias de la Ingeniería" },
    org: "Universidad Andrés Bello",
    period: { en: "2025", es: "2025" },
  },
  {
    title: { en: "Bachelor in Engineering Sciences", es: "Bachillerato en Ciencias de la Ingeniería" },
    org: "Universidad Andrés Bello",
    period: { en: "2025", es: "2025" },
  },
  {
    title: { en: "Student", es: "Estudiante" },
    org: "CATLEC — Center for Advanced Transportation, Logistics, and Economic Competitiveness",
    period: { en: "", es: "" },
  },
  {
    title: { en: "Student", es: "Estudiante" },
    org: "Centro Nacional de Inteligencia Artificial (CENIA)",
    period: { en: "", es: "" },
  },
]

export const skills: { group: T; items: string[] }[] = [
  { group: { en: "Languages", es: "Lenguajes" }, items: ["Python (advanced)", "TypeScript", "Swift", "C", "Transact-SQL"] },
  { group: { en: "Development", es: "Desarrollo" }, items: ["React · Next.js", "Supabase", "FastAPI", "SwiftUI", "CRM architecture"] },
  { group: { en: "Data science", es: "Ciencia de datos" }, items: ["Machine Learning", "Deep Learning", "Transfer Learning", "Big-data analysis"] },
  { group: { en: "Hardware & tools", es: "Hardware y herramientas" }, items: ["ESP32 · CAN · GPS", "OpenSCAD", "Azure IoT Hub", "Power Platform", "Jupyter", "Excel (expert)"] },
]

export const spokenLanguages: T[] = [
  { en: "Spanish — native", es: "Español — nativo" },
  { en: "English — intermediate", es: "Inglés — intermedio" },
]

export const certifications: T[] = [
  { en: "IBM AI Professional Certificate — in progress", es: "Certificado Profesional en IA de IBM — en curso" },
  { en: "Microsoft Learn: Azure IoT Hub, T-SQL, Power Platform, Python & ML", es: "Microsoft Learn: Azure IoT Hub, T-SQL, Power Platform, Python y ML" },
  { en: "Big Data: the impact of massive data on society — UAB (Coursera)", es: "Big Data: el impacto de los datos masivos en la sociedad — UAB (Coursera)" },
]
