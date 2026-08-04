import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1B3A6B"))
        
        # Header (on pages after cover)
        if self._pageNumber > 1:
            self.drawString(54, 750, "PHISHGUARD UTB — INFORME TÉCNICO Y PEDAGÓGICO COMPLETO")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(612 - 54, 750, "FAFI — Sistemas de Información 2026")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
            
        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "Universidad Técnica de Babahoyo — Facultad de Administración, Finanzas e Informática")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(612 - 54, 36, page_str)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 612 - 54, 48)
        
        self.restoreState()

def create_guia_docente_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1B3A6B'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2E6DA4'),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1B3A6B'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2E6DA4'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1E293B')
    )
    
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    story = []
    
    # Title Header Block
    story.append(Paragraph("PHISHGUARD UTB: INFORME TÉCNICO Y PEDAGÓGICO COMPLETO", title_style))
    story.append(Paragraph("GUÍA EXPLICATIVA PARA EVALUACIÓN ACADÉMICA Y DOCENTE", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1B3A6B'), spaceAfter=12))
    
    # Context Box
    callout_data = [[
        Paragraph("<b>UNIVERSIDAD TÉCNICA DE BABAHOYO — FAFI</b><br/>"
                  "<b>Carrera:</b> Sistemas de Información (6to Semestre 2026)<br/>"
                  "<b>Propósito:</b> Documento de sustentación técnica, pedagógica e institucional para docentes evaluadores y tribunales académicos.", callout_style)
    ]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 10))
    
    # 1. FICHA TÉCNICA
    story.append(Paragraph("1. FICHA TÉCNICA Y CONTEXTUALIZACIÓN ACADÉMICA", h1_style))
    
    ficha_data = [
        [Paragraph("Parámetro", table_header), Paragraph("Detalle Institucional y Técnico", table_header)],
        [Paragraph("<b>Nombre del Sistema</b>", table_cell), Paragraph("<b>PhishGuard UTB</b> — Plataforma Web de Concientización en Ingeniería Social", table_cell)],
        [Paragraph("<b>Institución / Facultad</b>", table_cell), Paragraph("Universidad Técnica de Babahoyo — FAFI", table_cell)],
        [Paragraph("<b>Carrera / Semestre</b>", table_cell), Paragraph("Sistemas de Información (6to Semestre)", table_cell)],
        [Paragraph("<b>Línea de Investigación</b>", table_cell), Paragraph("Sistemas de Información y Comunicación, Emprendimiento e Innovación", table_cell)],
        [Paragraph("<b>Sublínea</b>", table_cell), Paragraph("Redes y Tecnologías Inteligentes de Software y Hardware", table_cell)],
        [Paragraph("<b>Proyecto Vinculación</b>", table_cell), Paragraph("<i>\"Protegiendo a la Provincia de Los Ríos de la Ingeniería Social\"</i>", table_cell)],
        [Paragraph("<b>Arquitectura</b>", table_cell), Paragraph("3 Capas (SPA React 19 + API REST Node.js/Express + BD PostgreSQL 16)", table_cell)],
        [Paragraph("<b>Infraestructura VPS</b>", table_cell), Paragraph("Ubuntu Server 24.04 LTS, Nginx 1.24, SSL Let's Encrypt, PM2", table_cell)],
        [Paragraph("<b>Población Objetivo</b>", table_cell), Paragraph("Estudiantes de la Carrera de Sistemas de Información de la UTB", table_cell)],
    ]
    t_ficha = Table(ficha_data, colWidths=[140, 364])
    t_ficha.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1B3A6B')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_ficha)
    story.append(Spacer(1, 10))
    
    # 2. FUNDAMENTACIÓN CIENTÍFICA
    story.append(Paragraph("2. FUNDAMENTACIÓN CIENTÍFICA Y JUSTIFICACIÓN ACADÉMICA", h1_style))
    story.append(Paragraph("<b>2.1 Justificación bajo la Ley Orgánica de Educación Superior (LOES)</b>", h2_style))
    story.append(Paragraph("El proyecto responde a los mandatos de la LOES en Ecuador respecto a la <i>Investigación Formativa</i> y la <i>Vinculación con la Sociedad</i>. Los estudiantes de Sistemas de Información no solo adquieren competencias teóricas, sino que transfieren conocimiento aplicable a la comunidad estudiantil de la Provincia de Los Ríos, donde la brecha digital y la vulnerabilidad ante ciberdelitos son elevadas.", body_style))
    
    story.append(Paragraph("<b>2.2 Problema Central: \"La Ilusión de Seguridad del Estudiante Tecnológico\"</b>", h2_style))
    story.append(Paragraph("Existe un fenómeno documentado (<i>Tessian & Stanford University, 2021</i>) donde los estudiantes de áreas tecnológicas asumen falsamente que su conocimiento en hardware/software los vuelve inmunes al ciberfraude. Sin embargo:", body_style))
    story.append(Paragraph("• <b>El 74% de los ciberataques exitosos</b> explotan el factor humano (<i>Verizon DBIR, 2023</i>).", bullet_style))
    story.append(Paragraph("• <b>El 88% de los incidentes de fugas de datos</b> se deben a errores humanos o manipulación psicológica.", bullet_style))
    story.append(Paragraph("• En universidades ecuatorianas, <b>menos del 35% de estudiantes</b> reconoce técnicas avanzadas como <i>Vishing</i> o <i>Pretexting</i> (<i>Medina & Torres, 2022</i>).", bullet_style))
    story.append(Paragraph("<b>PhishGuard UTB</b> resuelve este problema ofreciendo un entorno controlado, evaluable y gamificado que transforma el comportamiento reflexivo del estudiante ante estímulos de Ingeniería Social.", body_style))
    
    story.append(Spacer(1, 10))
    
    # 3. ARQUITECTURA DE SOFTWARE
    story.append(Paragraph("3. ARQUITECTURA DE SOFTWARE E INGENIERÍA DEL SISTEMA", h1_style))
    story.append(Paragraph("El sistema implementa una arquitectura desacoplada de tres capas basada en principios SOLID y el patrón MVC/RESTful:", body_style))
    
    story.append(Paragraph("<b>3.1 Capa de Presentación (Frontend — React.js 19 + Vite 8)</b>", h2_style))
    story.append(Paragraph("• <b>Single Page Application (SPA):</b> Navegación fluida sin recargas de página mediante React Router DOM v7.", bullet_style))
    story.append(Paragraph("• <b>Rutas Protegidas:</b> Componente ProtectedRoute que evalúa JWTs y roles de usuario (estudiante vs admin).", bullet_style))
    story.append(Paragraph("• <b>UX/UI Responsivo y Modo Oscuro:</b> Diseño optimizado para móviles y escritorio con persistencia de tema dinámico (WCAG 2.1).", bullet_style))
    
    story.append(Paragraph("<b>3.2 Capa de Lógica de Negocio (Backend — Node.js 22 LTS + Express 4)</b>", h2_style))
    story.append(Paragraph("• <b>API RESTful:</b> Organizada en 11 módulos de rutas de negocio.", bullet_style))
    story.append(Paragraph("• <b>Seguridad Avanzada:</b> Contraseñas encriptadas con bcryptjs (sal 10), tokens JWT stateless, middleware Helmet, Rate Limiting (200 req/15min) y CORS restringido.", bullet_style))
    story.append(Paragraph("• <b>Servicio Transaccional de Correo:</b> Nodemailer con tokens criptográficos aleatorios de 1 hora de expiración para recuperación de contraseña.", bullet_style))
    
    story.append(Paragraph("<b>3.3 Capa de Datos (PostgreSQL 16 + ORM Sequelize 6)</b>", h2_style))
    story.append(Paragraph("La base de datos relacional consta de <b>11 entidades con integridad referencial estricta</b>:", body_style))
    story.append(Paragraph("1. <b>usuarios</b>: Credenciales cifradas, roles, perfil y tokens.", bullet_style))
    story.append(Paragraph("2. <b>modulos</b>: Unidades temáticas (Phishing, Pretexting, Vishing, Baiting).", bullet_style))
    story.append(Paragraph("3. <b>contenidos</b>: Secciones educativas por módulo con metadatos visuales.", bullet_style))
    story.append(Paragraph("4. <b>preguntas</b>: Cuestionarios interactivos con retroalimentación.", bullet_style))
    story.append(Paragraph("5. <b>progreso_modulos</b>: Rastreo porcentual por estudiante.", bullet_style))
    story.append(Paragraph("6. <b>resultados_quizzes</b>: Calificaciones, intentos y aprobación.", bullet_style))
    story.append(Paragraph("7. <b>encuestas_diagnosticas</b>: Captura pre-test de 8 preguntas y cálculo de riesgo.", bullet_style))
    story.append(Paragraph("8. <b>certificados</b>: Registro de certificados emitidos con UUIDv4.", bullet_style))
    story.append(Paragraph("9. <b>logros</b> / 10. <b>logros_usuarios</b>: Sistema de insignias gamificadas (N:M).", bullet_style))
    story.append(Paragraph("11. <b>notificaciones</b>: Mensajería en tiempo real.", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # 4. ESTRUCTURA PEDAGÓGICA
    story.append(Paragraph("4. ESTRUCTURA PEDAGÓGICA Y DESGLOSE DE MÓDULOS", h1_style))
    
    mod_data = [
        [Paragraph("Módulo Educativo", table_header), Paragraph("Secciones", table_header), Paragraph("Contenido Clave & Simulaciones", table_header)],
        [Paragraph("<b>1. Phishing</b>", table_cell), Paragraph("7 secciones", table_cell), Paragraph("Spear Phishing, Smishing, Clone Phish. Simulador de correo fraudulento, caso real BEC ($2.3M) y laboratorio de detección de homóglifos.", table_cell)],
        [Paragraph("<b>2. Pretexting</b>", table_cell), Paragraph("6 secciones", table_cell), Paragraph("Guiones de suplantación, caso real de soporte técnico falso en universidades (2023) y psicología de autoridad vs compañerismo.", table_cell)],
        [Paragraph("<b>3. Vishing</b>", table_cell), Paragraph("5 secciones", table_cell), Paragraph("Caller ID Spoofing, Deepfakes vocales, ingeniería del pánico y simulación interactiva de respuesta telefónica bancaria.", table_cell)],
        [Paragraph("<b>4. Baiting</b>", table_cell), Paragraph("5 secciones", table_cell), Paragraph("Baiting físico (USB) vs digital (cracks/software). Experimento de la Univ. de Illinois (Tischer et al., 45% infección).", table_cell)],
    ]
    t_mod = Table(mod_data, colWidths=[100, 70, 334])
    t_mod.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1B3A6B')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_mod)
    story.append(Spacer(1, 10))
    
    # 5. MÉTODOS DE EVALUACIÓN (MÉTRICA SUS)
    story.append(Paragraph("5. MÉTODOS DE EVALUACIÓN CIENTÍFICA DEL SISTEMA (ESCALA SUS)", h1_style))
    story.append(Paragraph("Para evaluar el Objetivo Específico 3, el sistema fue sometido a la <b>System Usability Scale (SUS)</b> (<i>Brooke, 1996; Bangor et al., 2009</i>), instrumento internacional estandarizado de 10 ítems Likert.", body_style))
    story.append(Paragraph("<b>Algoritmo de Cálculo de la Escala SUS:</b>", body_style))
    story.append(Paragraph("• Para ítems impares (1, 3, 5, 7, 9): Puntuación = Respuesta - 1", bullet_style))
    story.append(Paragraph("• Para ítems pares (2, 4, 6, 8, 10): Puntuación = 5 - Respuesta", bullet_style))
    story.append(Paragraph("• <b>Puntuación Final SUS</b> = (Suma de puntuaciones de los 10 ítems) × 2.5", bullet_style))
    story.append(Paragraph("Una puntuación SUS <b>≥ 70.0 puntos sobre 100</b> confirma que el sistema cumple con la categoría de usabilidad 'Buena/Aceptable' para su adopción masiva.", body_style))
    
    story.append(Spacer(1, 10))
    
    # 6. PANEL ADMINISTRATIVO
    story.append(Paragraph("6. PANEL DE ADMINISTRACIÓN Y ANALÍTICA DE DATOS", h1_style))
    story.append(Paragraph("El módulo de administración ofrece a los docentes e investigadores:", body_style))
    story.append(Paragraph("• <b>Dashboard Analítico Interactivo:</b> Tarjetas de estudiantes registrados, activos, encuestas completadas, certificados emitidos y tasa de aprobación.", bullet_style))
    story.append(Paragraph("• <b>CRUD Completo de Contenidos:</b> Creación y edición de temas con formato enriquecido e inclusión de multimedia.", bullet_style))
    story.append(Paragraph("• <b>CRUD de Cuestionarios:</b> Configuración de preguntas, opciones y retroalimentación personalizada.", bullet_style))
    story.append(Paragraph("• <b>Gestión de Usuarios:</b> Monitoreo de actividad y control de cuentas.", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # 7. CONCLUSIÓN TÉCNICA
    story.append(Paragraph("7. CONCLUSIÓN TÉCNICA Y VALOR DE INGENIERÍA", h1_style))
    story.append(Paragraph("PhishGuard UTB no es una página web estática; es un <b>sistema integral de ingeniería de software</b> desplegado en un servidor VPS real en producción. Constituye una contribución práctica y medible a la ciberseguridad universitaria de la Provincia de Los Ríos.", body_style))
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Creado PDF: {output_path}")

def create_guion_exposicion_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1B3A6B'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2E6DA4'),
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'H1_2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1B3A6B'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body2',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    
    speech_style = ParagraphStyle(
        'Speech_Box',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )
    
    table_cell = ParagraphStyle(
        'TableCell2',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1E293B')
    )
    
    table_header = ParagraphStyle(
        'TableHeader2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    story = []
    
    story.append(Paragraph("GUIÓN Y GUÍA RÁPIDA DE EXPOSICIÓN ANTE EL DOCENTE", title_style))
    story.append(Paragraph("PhishGuard UTB — Plataforma Web de Concientización en Ingeniería Social", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1B3A6B'), spaceAfter=10))
    
    # 1. INTRODUCCIÓN
    story.append(Paragraph("1. LA INTRODUCCIÓN (Lo que dices al empezar — 1 minuto)", h1_style))
    speech1 = [[
        Paragraph("<i>\"Profesor, buenos días/tardes. Le presento <b>PhishGuard UTB</b>, un sistema web interactivo que desarrollamos para enseñar y evaluar a los estudiantes de la UTB sobre los peligros de la <b>Ingeniería Social</b> (como estafas por internet, correos falsos y llamadas fraudulentas).<br/><br/>"
                  "No es solo una página informativa estática; es un <b>sistema completo con base de datos, exámenes interactivos con nota aprobatoria, simulación de correos, certificados automáticos y un panel para que los profesores puedan ver estadísticas y administrar el contenido</b>.\"</i>", speech_style)
    ]]
    t1 = Table(speech1, colWidths=[504])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0F9FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0284C7')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t1)
    story.append(Spacer(1, 8))
    
    # 2. EL PROBLEMA
    story.append(Paragraph("2. EL PROBLEMA Y JUSTIFICACIÓN (Por qué lo creaste)", h1_style))
    speech2 = [[
        Paragraph("<i>\"Identificamos que muchos estudiantes de universidad —incluso de carreras tecnológicas como Sistemas— piensan que por saber usar computadoras están seguros. Pero la realidad es que el <b>74% de los ciberataques no rompen contraseñas con programas, sino que engañan a las personas</b>.<br/><br/>"
                  "En la UTB no teníamos una herramienta donde los estudiantes pudieran poner a prueba sus conocimientos de forma práctica. Por eso creamos esta plataforma.\"</i>", speech_style)
    ]]
    t2 = Table(speech2, colWidths=[504])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#EF4444')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t2)
    story.append(Spacer(1, 8))
    
    # 3. RECORRIDO DEL ESTUDIANTE
    story.append(Paragraph("3. EL RECORRIDO DEL ESTUDIANTE EN LA PLATAFORMA", h1_style))
    story.append(Paragraph("Muestra en pantalla el recorrido completo en 6 pasos:", body_style))
    
    pasos = [
        ("Paso 1: Registro / Login", "Registro con formulario completo o con <b>Google OAuth</b>. Sistema de <b>Recuperación de Contraseña por Correo Real</b> mediante Nodemailer."),
        ("Paso 2: Encuesta Diagnóstica", "Encuesta pre-test obligatoria de 8 preguntas. Clasifica automáticamente al alumno en riesgo <b>Bajo, Medio o Alto</b>."),
        ("Paso 3: 4 Módulos Educativos", "<b>Phishing</b> (correos falsos), <b>Pretexting</b> (suplantación de identidad), <b>Vishing</b> (llamadas/SMS) y <b>Baiting</b> (USB/descargas). Incluye simuladores interactivos."),
        ("Paso 4: Quizzes con Nota Mínima", "Cuestionario de 10 preguntas por módulo. Requiere <b>mínimo 70% (7/10)</b> para aprobar. Da <b>retroalimentación inmediata</b> si se equivoca."),
        ("Paso 5: Logros y Notificaciones", "Sistema de gamificación con insignias automáticas al completar hitos y notificaciones en tiempo real en la campana."),
        ("Paso 6: Certificado Digital PDF", "Generación automática de certificado descargable con <b>código hash de verificación único</b> al completar los 4 módulos.")
    ]
    for tit, desc in pasos:
        story.append(Paragraph(f"• <b>{tit}:</b> {desc}", body_style))
        
    story.append(Spacer(1, 8))
    
    # 4. PANEL ADMIN
    story.append(Paragraph("4. EL PANEL DE ADMINISTRACIÓN (Vista del Docente)", h1_style))
    story.append(Paragraph("Muestra el login como <b>Admin</b> y enseña:", body_style))
    story.append(Paragraph("• <b>Dashboard Interactivo:</b> Métricas de estudiantes registrados, activos, aprobados y certificados emitidos.", body_style))
    story.append(Paragraph("• <b>CRUD de Contenidos:</b> Cómo crear o modificar temas con imágenes y simulaciones.", body_style))
    story.append(Paragraph("• <b>CRUD de Preguntas:</b> Cómo ajustar las preguntas del examen y la retroalimentación.", body_style))
    
    story.append(Spacer(1, 8))
    
    # 5. PREGUNTAS FRECUENTES DEL DOCENTE
    story.append(Paragraph("5. PREGUNTAS FRECUENTES DEL PROFESOR Y CÓMO RESPONDER", h1_style))
    
    qa_data = [
        [Paragraph("Si el profesor pregunta...", table_header), Paragraph("Tú respondes exactamente esto:", table_header)],
        [Paragraph("<b>¿Cómo sabes si el alumno realmente aprendió?</b>", table_cell), Paragraph("<i>\"Porque medimos el conocimiento antes (con la Encuesta Diagnóstica) y exigimos un 70% mínimo aprobatorio en los quizzes para darle su certificado.\"</i>", table_cell)],
        [Paragraph("<b>¿Qué pasa si el alumno se equivoca en el examen?</b>", table_cell), Paragraph("<i>\"El sistema no solo le dice que falló, sino que le da una retroalimentación explicativa inmediata de por qué se equivocó y le permite reintentar.\"</i>", table_cell)],
        [Paragraph("<b>¿El contenido es fijo o se puede cambiar?</b>", table_cell), Paragraph("<i>\"Es 100% dinámico. Como profesor puedo entrar al panel admin y cambiar preguntas, agregar módulos o actualizar contenidos sin tocar el código.\"</i>", table_cell)],
        [Paragraph("<b>¿En qué tecnologías se programó?</b>", table_cell), Paragraph("<i>\"Usamos <b>React 19</b> en Frontend (con Modo Oscuro), <b>Node.js/Express</b> en Backend con seguridad JWT y bcrypt, <b>PostgreSQL 16</b> en BD y está desplegado en un <b>VPS Ubuntu con Nginx y SSL HTTPS</b>.\"</i>", table_cell)],
    ]
    t_qa = Table(qa_data, colWidths=[160, 344])
    t_qa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1B3A6B')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_qa)
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Creado PDF: {output_path}")

if __name__ == "__main__":
    out_dir = r"c:\Users\Andy\Desktop\PIG\DocumentacionANEXO"
    os.makedirs(out_dir, exist_ok=True)
    
    p1 = os.path.join(out_dir, "Guia_Explicativa_Docente_PhishGuard_UTB.pdf")
    p2 = os.path.join(out_dir, "Guion_Exposicion_Plataforma_PhishGuard_UTB.pdf")
    
    create_guia_docente_pdf(p1)
    create_guion_exposicion_pdf(p2)
