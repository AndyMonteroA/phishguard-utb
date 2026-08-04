# PHISHGUARD UTB: INFORME TÉCNICO Y PEDAGÓGICO COMPLETO
## GUÍA EXPLICATIVA PARA EVALUACIÓN ACADÉMICA Y DOCENTE

**Universidad Técnica de Babahoyo (UTB)**  
**Facultad de Administración, Finanzas e Informática (FAFI)**  
**Carrera de Sistemas de Información — Período Académico 2026**  
**Proyecto Intradisciplinar de Grado / Vinculación con la Sociedad**

---

> **PROPÓSITO DE ESTE DOCUMENTO:**  
> Este informe ha sido redactado con el máximo nivel de rigor académico, técnico y pedagógico. Está estructurado específicamente para ser presentado a **docentes evaluadores, tutores de tesis o tribunales académicos**, justificando el valor científico, la arquitectura de software, el sustento pedagógico y la alineación institucional de la plataforma **PhishGuard UTB**.

---

## 1. FICHA TÉCNICA Y CONTEXTUALIZACIÓN ACADÉMICA

| Parámetro | Detalle Institucional y Técnico |
| :--- | :--- |
| **Nombre del Sistema** | **PhishGuard UTB** — Plataforma Web de Concientización en Ingeniería Social |
| **Institución** | Universidad Técnica de Babahoyo — FAFI |
| **Carrera** | Sistemas de Información (6to Semestre) |
| **Línea de Investigación** | Sistemas de Información y Comunicación, Emprendimiento e Innovación |
| **Sublínea** | Redes y Tecnologías Inteligentes de Software y Hardware |
| **Proyecto de Vinculación** | *"Protegiendo a la Provincia de Los Ríos de la Ingeniería Social"* |
| **Arquitectura de Software** | 3 Capas (SPA React 19 + API REST Node.js/Express + BD PostgreSQL 16) |
| **Infraestructura** | Servidor VPS Ubuntu 24.04 LTS, Nginx, Certificado SSL HTTPS, PM2 |
| **Población Objetivo** | Estudiantes de la Carrera de Sistemas de Información de la UTB |

---

## 2. FUNDAMENTACIÓN CIENTÍFICA Y JUSTIFICACIÓN ACADÉMICA

### 2.1 Justificación bajo la Ley Orgánica de Educación Superior (LOES)
El proyecto responde a los mandatos de la **LOES en Ecuador** respecto a la *Investigación Formativa* y la *Vinculación con la Sociedad*. Los estudiantes de Sistemas de Información no solo adquieren competencias teóricas, sino que transfieren conocimiento aplicable a la comunidad estudiantil de la Provincia de Los Ríos, donde la brecha digital y la vulnerabilidad ante ciberdelitos son elevadas.

### 2.2 Problema Central: "La Ilusión de Seguridad del Estudiante Tecnológico"
Existe un fenómeno documentado (*Tessian & Stanford University, 2021*) donde los estudiantes y profesionales de áreas tecnológicas asumen falsamente que su conocimiento en hardware/software los vuelve inmunes al ciberfraude. Sin embargo:
* **El 74% de los ciberataques exitosos** explotan el factor humano (*Verizon DBIR, 2023*).
* **El 88% de los incidentes de fugas de datos** se deben a errores humanos o manipulación psicológica.
* En universidades ecuatorianas, **menos del 35% de los estudiantes** reconoce técnicas avanzadas como *Vishing* o *Pretexting* (*Medina & Torres, 2022*).

**PhishGuard UTB** resuelve este problema ofreciendo un entorno controlado, evaluable y gamificado que transforma el comportamiento reflexivo del estudiante ante estímulos de Ingeniería Social.

---

## 3. ARQUITECTURA DE SOFTWARE E INGENIERÍA DEL SISTEMA

El sistema implementa una arquitectura desacoplada de tres capas basada en principios **SOLID** y el patrón **MVC/RESTful**.

```
[ CLIENTE WEB / NAVEGADOR ]
       │  (HTTPS / JSON)
       ▼
[ SERVIDOR WEB NGINX ]  ──── (Proxy Inverso + SSL Let's Encrypt)
       │
       ▼
[ BACKEND NODE.JS + EXPRESS ] ── (Middlewares: Helmet, RateLimit, CORS, JWT Auth)
       │
       ├──── ORM SEQUELIZE 6
       │          │
       │          ▼
       └──── [ BASE DE DATOS POSTGRESQL 16 ] (11 Tablas Relacionales)
```

### 3.1 Capa de Presentación (Frontend — React.js 19 + Vite 8)
* **Single Page Application (SPA):** Navegación fluida sin recargas de página mediante `React Router DOM v7`.
* **Rutas Protegidas:** Componente `ProtectedRoute` que evalúa los JWTs y roles de usuario (`estudiante` vs `admin`) antes de renderizar vistas sensibles.
* **Experiencia del Usuario (UX/UI):** Diseñado con **Vanilla CSS modular**, tokens de diseño visual (variables CSS), iconografía vectorial (`React Icons`), animaciones de interfaz (`Framer Motion`) y retroalimentación reactiva (`React Hot Toast`).
* **Sistema de Tema Dinámico (Modo Oscuro):** Implementa persistencia de tema mediante clases dinámicas (`.dark-mode`) en el DOM, garantizando contraste accesible (normativa WCAG 2.1).

### 3.2 Capa de Lógica de Negocio (Backend — Node.js 22 LTS + Express 4)
* **Arquitectura de API REST:** Organizada en 11 módulos de rutas (`auth`, `modulos`, `quiz`, `progreso`, `encuesta`, `certificado`, `admin`, `contenidos`, `preguntas`, `logros`, `notificaciones`).
* **Seguridad y Hardening:**
  * **Cifrado de Contraseñas:** Algoritmo **bcryptjs** con sal de 10 rondas para hashing irreversible.
  * **Sesiones Stateless:** Autenticación **JWT (JSON Web Tokens)** firmados con clave secreta y tiempo de expiración configurable (`24h`).
  * **Protección contra Abuso (Anti-DDoS / Brute Force):** Middleware `express-rate-limit` con ventanas deslizantes (200 req/15min general; 20 req/15min en endpoints críticos `/login` y `/register`).
  * **Protección de Cabeceras HTTP:** Middleware `Helmet` habilitado.
  * **Control de Origen (CORS):** Restringido exclusivamente al dominio del frontend autorizado.
* **Servicio Transaccional de Correo Electrónico:** Integración de `Nodemailer` con protocolo SMTP/OAuth2 (Gmail App Password) para el flujo seguro de **Recuperación de Contraseña** mediante tokens criptográficos aleatorios (`crypto.randomBytes(32)`) de 1 solo uso con expiración estricta de 60 minutos.

### 3.3 Capa de Datos (Base de Datos Relacional — PostgreSQL 16)
La base de datos relacional consta de **11 entidades con integridad referencial estricta**, administradas mediante el ORM **Sequelize 6**:

```
 ┌──────────────┐       1:N       ┌────────────────────┐
 │   Usuario    │────────────────>│   ResultadoQuiz    │
 └──────────────┘                 └────────────────────┘
   │   │   │  1:1                         ▲
   │   │   └─────────────────────┐        │ 1:N
   │   │ 1:N                     ▼        │
   │   │                ┌────────────────────┐
   │   ├───────────────>│   ProgresoModulo   │
   │   │                └────────────────────┘
   │   │ 1:1                     ▲
   │   ▼                         │ 1:N
 ┌────────────────────┐   1:N    │
 │EncuestaDiagnostica │ ┌────────────────────┐
 └────────────────────┘ │       Modulo       │
                        └────────────────────┘
                          │ 1:N        │ 1:N
                          ▼            ▼
                    ┌──────────┐ ┌───────────┐
                    │Contenido │ │ Pregunta  │
                    └──────────┘ └───────────┘
```

1. **`usuarios`**: Almacena credenciales cifradas, roles (`estudiante`, `admin`), semestre, género, correo institucional, token de recuperación y estado de cuenta.
2. **`modulos`**: Registro de unidades temáticas (Phishing, Pretexting, Vishing, Baiting), orden y estado.
3. **`contenidos`**: Secciones educativas por módulo con metadatos de tipo (`texto`, `ejemplo_interactivo`, `caso_real`, `imagen`, `video`).
4. **`preguntas`**: Reactivos de evaluación con opciones JSON estructuradas, respuesta correcta y retroalimentación pedagógica.
5. **`progreso_modulos`**: Rastreo porcentual de lectura y completitud por módulo por usuario.
6. **`resultados_quizzes`**: Historial de calificaciones, número de intentos, tiempo y estado de aprobación.
7. **`encuestas_diagnosticas`**: Captura pre-test de 8 preguntas diagnósticas y cálculo de nivel de riesgo (`bajo`, `medio`, `alto`).
8. **`certificados`**: Registro de certificados digitales emitidos con código de verificación único UUIDv4.
9. **`logros`**: Catálogo de insignias de gamificación.
10. **`logros_usuarios`**: Tabla pivote (N:M) que vincula insignias obtenidas con timestamps.
11. **`notificaciones`**: Mensajería en tiempo real del sistema hacia el usuario.

---

## 4. ESTRUCTURA PEDAGÓGICA Y DESGLOSE DE MÓDULOS

El sistema no presenta teoría pasiva; utiliza el método de **Caso-Ejemplo-Simulación-Evaluación**:

```
[ DIAGNÓSTICO OBLIGATORIO (Pre-Test) ]
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │   MÓDULO 1: PHISHING (7 Secciones de Aprendizaje)       │
 │   • Tipología: Spear Phishing, Smishing, Clone Phish   │
 │   • Caso Real: Ataque BEC Empresarial ($2.3 Millones)   │
 │   • Simulación: Correo Fraudulento Interactivo        │
 │   • Laboratorio: Detección visual de Homóglifos (paypa1)│
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │   MÓDULO 2: PRETEXTING (6 Secciones de Aprendizaje)    │
 │   • Guiones de Suplantación e Identidades Falsas        │
 │   • Caso Real: Soporte TI Falso en Universidades 2023  │
 │   • Análisis Psicología de Autoridad vs Compañerismo   │
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │   MÓDULO 3: VISHING (5 Secciones de Aprendizaje)       │
 │   • Manipulación Vocal y Caller ID Spoofing            │
 │   • Deepfakes de Voz e Ingeniería del Pánico           │
 │   • Simulación Interactiva: Diálogo Telefónico Banco   │
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │   MÓDULO 4: BAITING (5 Secciones de Aprendizaje)       │
 │   • Baiting Físico (USB Trilladas) vs Digital (Cracks) │
 │   • Caso Real: Estudio Univ. Illinois (Tischer et al.) │
 │   • Procedimiento de Aislamiento y Reporte Instituc.   │
 └────────────────────────────────────────────────────────┘
                 │
                 ▼
[ EVALUACIÓN CONTINUA: QUIZZES (Mínimo 70% Aprobatorio) ]
                 │
                 ▼
[ GENERACIÓN AUTOMÁTICA DE CERTIFICADO Y LOGROS ]
```

---

## 5. MÉTODOS DE EVALUACIÓN CIENTÍFICA DEL SISTEMA (ESCALA SUS)

Para cumplir con el **Objetivo Específico 3**, el sistema fue sometido a una evaluación de usabilidad mediante la **System Usability Scale (SUS)** (*Brooke, 1996; Bangor et al., 2009*).

### 5.1 Algoritmo de Cálculo de la Escala SUS
La encuesta SUS consta de 10 ítems evaluados en escala Likert (1 al 5):

$$\text{Puntaje Ítem Impar } (x_i) = \text{Respuesta} - 1$$
$$\text{Puntaje Ítem Par } (x_i) = 5 - \text{Respuesta}$$
$$\text{Puntuación Final SUS} = \left( \sum_{i=1}^{10} x_i \right) \times 2.5$$

* **Criterio de Aceptación:** Una puntuación SUS $\ge 70.0$ determina que el sistema posee una usabilidad buena/aceptable para su adopción masiva en la UTB.

---

## 6. MÓDULO ADMINISTRATIVO Y GESTIÓN DE CONTENIDOS

El administrador del sistema cuenta con privilegios elevados para garantizar la sostenibilidad académica del proyecto:

1. **Dashboard Analítico:** Métricas en tiempo real de estudiantes registrados, activos, tasa de aprobación global y certificados emitidos.
2. **Editor de Contenidos Didácticos (CRUD):** Creación y modificación de temas con soporte para imágenes, videos, ejemplos de correo interactivo y marcado contextual.
3. **Gestión de Cuestionarios (CRUD de Preguntas):** Configuración dinámicas de reactivos, ponderación de opciones y redacción de retroalimentación didáctica.
4. **Auditoría de Usuarios:** Capacidad para monitorear el desempeño individual de los estudiantes y gestionar estados de cuenta.

---

## 7. GUÍA PARA LA DEMOSTRACIÓN PRÁCTICA ANTE EL DOCENTE

Al exponer el sistema ante el tribunal o docente evaluador, se sugiere seguir este orden de demostración:

1. **Flujo de Registro y Autenticación:**
   * Mostrar el registro de usuario y la validación de contraseñas.
   * Probar el inicio de sesión con **Google OAuth**.
   * Demostrar la funcionalidad de **Recuperar Contraseña** (mostrar la llegada del correo con plantilla HTML institucional y la expiración del token).

2. **Evaluación Diagnóstica (Pre-Test):**
   * Completar la encuesta inicial de 8 preguntas y mostrar cómo el sistema calcula el nivel de riesgo inicial del estudiante.

3. **Experiencia de Aprendizaje e Interactividad:**
   * Navegar por el **Módulo de Phishing**: mostrar el simulador de correo electrónico fraudulento y el caso real de ataque BEC.
   * Cambiar entre **Modo Claro / Modo Oscuro** para demostrar la accesibilidad UI.

4. **Evaluación de Módulo (Quiz):**
   * Responder el Quiz del módulo, fallar a propósito una pregunta para mostrar la **retroalimentación pedagógica inmediata**, y alcanzar el 70% requerido.

5. **Certificación y Gamificación:**
   * Mostrar el desbloqueo automático de **Logros/Insignias** y la notificación recibida.
   * Descargar el **Certificado Digital PDF** con su código de verificación hash único.

6. **Panel de Administración (Vista del Profesor):**
   * Iniciar sesión como `admin` y mostrar el Dashboard con las métricas interactivas, la edición de un contenido y la gestión de reactivos.

---

## 8. CONCLUSIÓN TÉCNICA

**PhishGuard UTB** no es una simple página informativa estática; es una **plataforma web integral de ingeniería de software**, diseñada bajo estándares académicos internacionales, probada metodológicamente y desplegada en producción real. Representa un aporte tangible a la seguridad de la información de la Universidad Técnica de Babahoyo y consolida la integración entre la docencia, la investigación y la vinculación con la sociedad.
