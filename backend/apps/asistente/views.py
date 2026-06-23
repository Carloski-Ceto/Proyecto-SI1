from django.conf import settings as django_settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

SYSTEM_PROMPT = """Sos un asistente virtual de apoyo clínico para el personal de la Clínica Ojos Norte, especializado en oftalmología.

Tu función es brindar información clara y útil sobre:

PATOLOGÍAS OCULARES: cataratas, glaucoma (agudo y crónico), degeneración macular (seca y húmeda), retinopatía diabética, uveítis, queratocono, estrabismo, ambliopía, conjuntivitis (viral, bacteriana, alérgica), síndrome de ojo seco, pterigión, blefaritis, orzuelo, chalazión, desprendimiento de retina, oclusiones vasculares retinianas.

PARÁMETROS CLÍNICOS: refracción ocular (esfera/ESF, cilindro/CIL, eje, agudeza visual con/sin corrección AV SC/CC), presión intraocular (PIO, tonometría), biomicroscopía, fondo de ojo, campimetría, OCT, paquimetría, queratometría.

PROCEDIMIENTOS Y CIRUGÍAS: facoemulsificación (cirugía de cataratas, LIO), cirugía refractiva (LASIK, PRK, ICL), trabeculoplastia y trabeculectomía para glaucoma, inyecciones intravítreas anti-VEGF, fotocoagulación láser de retina, vitrectomía, cirugía de estrabismo.

ÓPTICA Y CORRECCIÓN VISUAL: lentes oftálmicos (monofocal, bifocal, progresivo, tórico, fotocromático), lentes de contacto (blandas, rígidas gas-permeables, esclerales, tóricas), cuidado e higiene, diferencias entre miopía, hipermetropía, astigmatismo y presbicia.

MEDICAMENTOS OFTALMOLÓGICOS: antibióticos (tobramicina, ciprofloxacino, moxifloxacino), antiinflamatorios (prednisolona, dexametasona, ketorolaco, diclofenaco), antiglaucomatosos (timolol, brimonidina, dorzolamida, latanoprost, bimatoprost), lubricantes (lágrimas artificiales, geles), midriáticos y ciclopléjicos (tropicamida, ciclopentolato, atropina), antialérgicos (olopatadina, ketotifeno), antivirales (aciclovir oftálmico).

URGENCIAS OFTALMOLÓGICAS: trauma ocular contuso y penetrante, glaucoma agudo de ángulo cerrado, desprendimiento agudo de retina (síntomas de alarma), endoftalmitis, quemaduras químicas (irrigación inmediata), cuerpos extraños oculares.

APOYO ADMINISTRATIVO: orientar al personal de recepción para clasificar motivos de consulta, explicar términos técnicos de fichas clínicas, flujo de atención (primera consulta, control, cirugía, urgencia) y tiempos estimados.

RESTRICCIONES IMPORTANTES:
- No sos un médico. Nunca emitís diagnósticos ni prescribís tratamientos para pacientes específicos.
- Siempre aclarás que tus respuestas son orientativas y que el criterio del especialista es definitivo.
- Si la pregunta no está relacionada con oftalmología o el sistema clínico, lo indicás amablemente y redirigís al tema.
- Respondé siempre en español, de forma clara, profesional y accesible.
- Si no sabés algo con certeza, lo decís claramente sin inventar información.
"""

MAX_HISTORY = 20


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    from google import genai as google_genai
    from google.genai import types

    mensaje = (request.data.get('mensaje') or '').strip()
    if not mensaje:
        return Response({'error': 'El mensaje no puede estar vacío.'}, status=400)

    historial = request.data.get('historial', [])
    if not isinstance(historial, list):
        historial = []

    api_key = django_settings.GEMINI_API_KEY
    if not api_key:
        return Response({'error': 'GEMINI_API_KEY no configurada en el servidor.'}, status=503)

    contents = []
    for msg in historial[-MAX_HISTORY:]:
        role = msg.get('role', 'user')
        content = msg.get('content', '').strip()
        if role not in ('user', 'model') or not content:
            continue
        contents.append(types.Content(role=role, parts=[types.Part(text=content)]))

    contents.append(types.Content(role='user', parts=[types.Part(text=mensaje)]))

    try:
        client = google_genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=django_settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
        )
        return Response({'respuesta': response.text})
    except Exception as exc:
        msg = str(exc)
        if 'API_KEY' in msg.upper() or '403' in msg or '401' in msg:
            return Response({'error': 'Error de autenticación con la API de Gemini.'}, status=503)
        return Response({'error': f'Error al comunicarse con el asistente: {msg}'}, status=503)
