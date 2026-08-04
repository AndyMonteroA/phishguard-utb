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
        
        # Header (on pages after cover/first page)
        if self._pageNumber > 1:
            self.drawString(54, 750, "PHISHGUARD UTB — PROPÓSITO, FUNCIONAMIENTO E IMPACTO")
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

def create_fundamentos_pdf(output_path):
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
        'DocTitle_F',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1B3A6B'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle_F',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2E6DA4'),
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'Heading1_F',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1B3A6B'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_F',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_F',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    box_style = ParagraphStyle(
        'Box_F',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )
    
    table_cell = ParagraphStyle(
        'TableCell_F',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1E293B')
    )
    
    table_header = ParagraphStyle(
        'TableHeader_F',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    story = []
    
    # Title Block
    story.append(Paragraph("PHISHGUARD UTB — CLAVE DEL APLICATIVO", title_style))
    story.append(Paragraph("¿POR QUÉ LO HICIMOS? | ¿QUÉ QUEREMOS LOGRAR? | ¿QUÉ HACE Y CÓMO FUNCIONA?", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor('#1B3A6B'), spaceAfter=12))
    
    # SECTION 1: POR QUÉ LO HICIMOS
    story.append(Paragraph("1. ¿POR QUÉ HICIMOS ESTA APLICACIÓN? (La Razón y el Motivo)", h1_style))
    
    p1_box = [[
        Paragraph("<b>RAZÓN PRINCIPAL:</b> Los estudiantes de universidad —incluso de carreras tecnológicas como Sistemas de Información— tienen una <i>falsa sensación de seguridad</i>. Creen que por saber programar o formatear computadoras no los van a engañar. Sin embargo, los ciberdelincuentes hoy en día no atacan el software, atacan a las personas (Ingeniería Social).", box_style)
    ]]
    t_p1 = Table(p1_box, colWidths=[504])
    t_p1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#EF4444')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_p1)
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("<b>Los 4 factores concretos por los cuales desarrollamos PhishGuard UTB:</b>", body_style))
    story.append(Paragraph("• <b>El factor humano es la mayor vulnerabilidad:</b> El 74% de los ataques informáticos exitosos ocurren por engaños o errores humanos (<i>Verizon DBIR 2023</i>), no por fallos de programación.", bullet_style))
    story.append(Paragraph("• <b>Desconocimiento de técnicas avanzadas:</b> En universidades ecuatorianas, menos del 35% de los estudiantes puede identificar fraudes por llamada telefónica (<i>Vishing</i>) o suplantaciones por WhatsApp/correo (<i>Pretexting</i>).", bullet_style))
    story.append(Paragraph("• <b>Ausencia de herramientas prácticas en la UTB:</b> Antes de PhishGuard, en la universidad solo había charlas teóricas o diapositivas. No existía un sistema interactivo donde el alumno pudiera poner a prueba sus habilidades con simulaciones reales de correos falsos o llamadas estafa.", bullet_style))
    story.append(Paragraph("• <b>Cumplimiento con la Vinculación con la Sociedad:</b> El proyecto nació para respaldar directamente el proyecto institucional <i>\"Protegiendo a la Provincia de Los Ríos de la Ingeniería Social\"</i>, formando estudiantes capacitados que protejan su entorno.", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # SECTION 2: QUÉ QUEREMOS LOGRAR
    story.append(Paragraph("2. ¿QUÉ QUEREMOS LOGRAR CON ESTA APLICACIÓN? (El Propósito y las Metas)", h1_style))
    
    story.append(Paragraph("PhishGuard UTB persigue 4 metas fundamentales:", body_style))
    
    metas_data = [
        [Paragraph("Meta Principal", table_header), Paragraph("Lo que se logra en la práctica", table_header)],
        [Paragraph("<b>1. Cambiar el comportamiento del estudiante</b>", table_cell), Paragraph("Que el alumno deje de actuar por impulso al recibir un mensaje sospechoso. Que aprenda a detenerse y analizar las <b>señales de alerta</b> (URLs trampa, falsas urgencias, peticiones de códigos 2FA).", table_cell)],
        [Paragraph("<b>2. Diagnosticar y medir el conocimiento real</b>", table_cell), Paragraph("Medir mediante una <b>Encuesta Diagnóstica (Pre-Test)</b> el nivel con el que entra cada estudiante (Riesgo Bajo, Medio o Alto) para tener estadísticas reales sobre la brecha de ciberseguridad.", table_cell)],
        [Paragraph("<b>3. Capacitar y Certificar automáticamente</b>", table_cell), Paragraph("Garantizar que el 100% de estudiantes que completen los 4 módulos alcancen al menos un <b>70% de nota en los quizzes</b> y obtengan un <b>Certificado Digital verificable</b>.", table_cell)],
        [Paragraph("<b>4. Entregar una herramienta duradera a la UTB</b>", table_cell), Paragraph("Dejar a los docentes de la carrera un sistema completo donde puedan administrar materias, actualizar contenidos, cambiar preguntas y ver reportes estadísticos año tras año.", table_cell)],
    ]
    t_metas = Table(metas_data, colWidths=[160, 344])
    t_metas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1B3A6B')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_metas)
    story.append(Spacer(1, 10))
    
    # SECTION 3: QUÉ HACE Y CÓMO FUNCIONA
    story.append(Paragraph("3. ¿QUÉ HACE LA APLICACIÓN Y CÓMO FUNCIONA? (Las Funciones Reales)", h1_style))
    story.append(Paragraph("PhishGuard UTB es una plataforma web completa dividida en dos grandes módulos:", body_style))
    
    story.append(Paragraph("<b>A. LO QUE HACE EL ESTUDIANTE (El Flujo de Aprendizaje):</b>", body_style))
    story.append(Paragraph("1. <b>Se Registra e Inicia Sesión:</b> Puede crear su cuenta o entrar directamente con su correo de Google. Si olvida su clave, el sistema le envía un correo real de recuperación.", bullet_style))
    story.append(Paragraph("2. <b>Responde la Encuesta Diagnóstica Obligatoria:</b> 8 preguntas que calculan automáticamente su nivel inicial de riesgo (Bajo, Medio o Alto).", bullet_style))
    story.append(Paragraph("3. <b>Estudia los 4 Módulos con Simuladores Interactivos:</b>", bullet_style))
    story.append(Paragraph("   • <i>Módulo Phishing (Correos Falsos):</i> Ve ejemplos en pantalla de correos trampa (ej: <code>paypa1.com</code>) y aprende a detectar enlaces falsos.", bullet_style))
    story.append(Paragraph("   • <i>Módulo Pretexting (Suplantación):</i> Analiza guiones de falsos técnicos de TI que piden códigos de verificación.", bullet_style))
    story.append(Paragraph("   • <i>Módulo Vishing (Llamadas / SMS):</i> Interactúa con simulaciones de llamadas de falsos bancos y mensajes SMS engañosos.", bullet_style))
    story.append(Paragraph("   • <i>Módulo Baiting (Trampas USB/Piratería):</i> Conoce los riesgos de conectar USBs encontradas o descargar software crackeado.", bullet_style))
    story.append(Paragraph("4. <b>Rinde Quizzes Evaluativos con Retroalimentación Inmediata:</b> Responde 10 preguntas por módulo. Si falla, el sistema le explica en el acto por qué se equivocó. Requiere 70% (7/10) para aprobar.", bullet_style))
    story.append(Paragraph("5. <b>Gana Insignias y Certificado Digital PDF:</b> El sistema le entrega logros automáticos y genera un Certificado con su nombre y código único de verificación.", bullet_style))
    story.append(Paragraph("6. <b>Usa el Modo Oscuro y Perfil:</b> Puede cambiar el tema de la pantalla a oscuro para no cansar la vista y editar sus datos personales.", bullet_style))
    
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>B. LO QUE HACE EL DOCENTE / ADMINISTRADOR:</b>", body_style))
    story.append(Paragraph("• <b>Ve el Dashboard Estadístico:</b> Revisa cuántos alumnos se han registrado, cuántos han aprobado, la tasa de aprobación y los certificados entregados.", bullet_style))
    story.append(Paragraph("• <b>Administra Contenidos (CRUD):</b> Puede crear nuevos temas, subir imágenes o editar las simulaciones.", bullet_style))
    story.append(Paragraph("• <b>Gestiona Preguntas de Examen:</b> Puede agregar, modificar o borrar preguntas y cambiar la retroalimentación.", bullet_style))
    story.append(Paragraph("• <b>Supervisa Estudiantes:</b> Revisa quién está activo y la fecha de su último acceso.", bullet_style))
    
    story.append(Spacer(1, 10))
    
    # SECTION 4: IMPACTO
    story.append(Paragraph("4. ¿QUÉ IMPACTO TIENE EN LA UNIVERSIDAD (UTB)?", h1_style))
    
    p4_box = [[
        Paragraph("<b>RESUMEN DE IMPACTO:</b> PhishGuard UTB transforma la enseñanza de ciberseguridad en la UTB. Pasa de ser una charla teórica que se olvida rápidamente a ser una <b>experiencia práctica, interactiva, medible y certificada</b>. Protege a los futuros profesionales de Sistemas de Información de caer en ciberestafas y respalda institucionalmente los proyectos de investigación y vinculación de la FAFI.", box_style)
    ]]
    t_p4 = Table(p4_box, colWidths=[504])
    t_p4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0F9FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0284C7')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_p4)
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Creado PDF: {output_path}")

if __name__ == "__main__":
    out_dir = r"c:\Users\Andy\Desktop\PIG\DocumentacionANEXO"
    os.makedirs(out_dir, exist_ok=True)
    
    p = os.path.join(out_dir, "Explicacion_Fundamentos_PhishGuard_UTB.pdf")
    create_fundamentos_pdf(p)
