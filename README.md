Psi.Co.Di.Na.M.& C. son las siglas de "Psiquiatria Convencional Dinámica Natural Metódica y Científica; # 🏥 HCPE - Historia Clínica Psiquiátrica Electrónica

**Sistema completo de gestión de historias clínicas psiquiátricas**  
Versión 2.0 - 2025

---

## 📋 Descripción

HCPE es una aplicación web offline diseñada para facilitar la creación, gestión y documentación de historias clínicas psiquiátricas. Funciona completamente sin conexión a internet y no requiere base de datos externa.

### ✨ Características Principales

- ✅ **100% Offline**: Funciona sin conexión a internet
- 📝 **Formulario Completo**: Incluye todas las secciones de una HC psiquiátrica
- 🎤 **Dictado por Voz**: Transcripción automática usando Web Speech API
- 🔊 **Lectura de Texto**: Síntesis de voz para revisar contenido
- 💾 **Guardado Local**: Almacenamiento automático en el navegador
- 📄 **Exportación a Word**: Documentos editables en formato DOC
- 🖨️ **Exportación a PDF**: Generación de PDFs de alta calidad
- 📊 **Instrumentos de Evaluación**: Escalas psiquiátricas integradas
- ⌨️ **Atajos de Teclado**: Navegación rápida y eficiente
- 🎨 **Diseño Responsive**: Adaptable a cualquier dispositivo

---

## 🚀 Inicio Rápido

### Requisitos

- Navegador web moderno (Chrome, Edge, Firefox, Safari)
- No requiere instalación de software adicional

### Instalación

1. Descargue o clone el repositorio
2. Abra el archivo `hcpe.html` en su navegador
3. ¡Listo para usar!

```bash
# Si tiene Git instalado
git clone [URL_DEL_REPOSITORIO]
cd hcpe_portable

# Abra hcpe.html con su navegador preferido
```

---

## 📖 Manual de Uso

### 1️⃣ Crear Nueva Historia Clínica

1. Abra `hcpe.html` en su navegador
2. Complete los campos del formulario
3. El sistema guarda automáticamente cada 30 segundos

### 2️⃣ Funciones de Voz

#### Dictado por Voz (🎤)
- Haga clic en el botón del micrófono junto a cualquier campo de texto
- Comience a hablar (el campo se resaltará en rojo)
- El texto se transcribirá automáticamente
- Haga clic nuevamente para detener

#### Lectura de Texto (🔊)
- Haga clic en el botón de altavoz
- El sistema leerá en voz alta el contenido del campo
- El campo se resaltará en verde durante la lectura

### 3️⃣ Guardar y Cargar

#### Guardado Manual
- **Método 1**: Click en botón "💾 Guardar"
- **Método 2**: Atajo `Ctrl + S` (Windows/Linux) o `Cmd + S` (Mac)
- Ingrese un nombre descriptivo para el formulario

#### Guardado Automático
- El sistema guarda automáticamente cada 30 segundos
- Se guarda con el nombre "autosave"

#### Cargar Formulario
- **Método 1**: Click en botón "📂 Cargar"
- **Método 2**: Atajo `Ctrl + O` (Windows/Linux) o `Cmd + O` (Mac)
- Seleccione el formulario de la lista

### 4️⃣ Exportación de Documentos

#### Exportar a Word
- Click en "📝 Exportar a Word"
- Se descarga un archivo `.doc` editable
- Compatible con Microsoft Word, LibreOffice, Google Docs

#### Exportar a PDF
- Click en "📄 Exportar a PDF"
- Se genera un PDF con el formato profesional
- Ideal para archivo y documentación legal

#### Imprimir
- **Método 1**: Click en "🖨️ Imprimir"
- **Método 2**: Atajo `Ctrl + P` (Windows/Linux) o `Cmd + P` (Mac)
- El formato se optimiza automáticamente para impresión

### 5️⃣ Instrumentos de Evaluación

El sistema incluye enlaces a escalas psiquiátricas:

| Escala | Descripción |
|--------|-------------|
| **SCL-90-R** | Inventario de Síntomas |
| **HAM-D** | Escala de Depresión de Hamilton |
| **HAM-A** | Escala de Ansiedad de Hamilton |
| **MoCA** | Montreal Cognitive Assessment |
| **MMSE** | Mini-Mental State Examination |
| **PANSS** | Escala de Síntomas Positivos y Negativos |
| **WHOQOL-BREEF** | Calidad de Vida de la OMS |
| **Barrero/S** | Escala de Barrero |
| **AUDIT** | Test de Identificación de Trastornos por Alcohol |
| **DAST** | Test de Detección de Abuso de Drogas |

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + S` | Guardar formulario |
| `Ctrl/Cmd + O` | Cargar formulario |
| `Ctrl/Cmd + P` | Imprimir |
| `Ctrl/Cmd + N` | Nuevo formulario |

---

## 🏗️ Estructura del Proyecto

```
hcpe_portable/
│
├── hcpe.html              # Archivo principal
├── README.md              # Este archivo
│
├── css/
│   └── style.css          # Estilos del sistema
│
├── js/
│   └── script.js          # Funcionalidad completa
│
├── escalas/               # Instrumentos de evaluación
│   ├── audit.html         # Test AUDIT
│   ├── barrero_s.html     # Escala Barrero
│   ├── bprs_18.html       # BPRS
│   ├── dast.html          # Test DAST
│   ├── ham_d.html         # HAM-D
│   ├── moca.html          # MoCA
│   ├── mmse.html          # MMSE
│   ├── panss.html         # PANSS
│   └── whoqol_breef.html  # WHOQOL-BREEF
│
└── images/                # Recursos gráficos (si aplica)
```

---

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura del documento
- **CSS3**: Estilos y diseño responsive
- **JavaScript (Vanilla)**: Funcionalidad sin frameworks
- **Bootstrap 5**: Framework CSS para UI
- **Font Awesome**: Iconos
- **Web Speech API**: Dictado y síntesis de voz
- **jsPDF**: Generación de PDFs
- **html2canvas**: Captura de contenido HTML
- **localStorage**: Almacenamiento local del navegador

---

## 💾 Almacenamiento de Datos

### LocalStorage
- Los datos se almacenan en el navegador del usuario
- **Ventajas**: Sin servidor, privacidad total, acceso offline
- **Limitación**: Aproximadamente 5-10MB por origen
- **Persistencia**: Los datos persisten hasta que se limpie el caché del navegador

### Estructura de Datos
```javascript
{
  timestamp: "2025-11-18T10:30:00.000Z",
  campos: {
    nombre: "...",
    apellido: "...",
    // ... todos los campos del formulario
  }
}
```

---

## 🔒 Privacidad y Seguridad

- ✅ **100% Local**: No se envían datos a servidores externos
- ✅ **Sin Base de Datos**: No hay registro centralizado
- ✅ **Control Total**: El usuario mantiene todos los datos
- ⚠️ **Responsabilidad**: Hacer copias de seguridad regularmente
- ⚠️ **Navegador**: Los datos se pierden si se limpia el caché

---

## 📱 Compatibilidad

### Navegadores Soportados

| Navegador | Versión Mínima | Dictado por Voz | Síntesis de Voz |
|-----------|----------------|-----------------|-----------------|
| Chrome | 25+ | ✅ | ✅ |
| Edge | 79+ | ✅ | ✅ |
| Safari | 14.1+ | ✅ | ✅ |
| Firefox | 90+ | ❌ | ✅ |
| Opera | 27+ | ✅ | ✅ |

### Dispositivos
- 💻 **Desktop**: Funcionalidad completa
- 📱 **Tablet**: Funcionalidad completa (teclado en pantalla afecta dictado)
- 📱 **Móvil**: Funcionalidad completa (experiencia optimizada)

---

## 🐛 Solución de Problemas

### El dictado por voz no funciona
1. Verifique que su navegador soporte Web Speech API
2. Otorgue permisos de micrófono cuando se solicite
3. Use Chrome o Edge para mejor compatibilidad

### Los datos no se guardan
1. Verifique que el navegador permita localStorage
2. Asegúrese de no estar en modo incógnito/privado
3. Revise el espacio disponible en localStorage

### La exportación a Word no incluye todos los datos
1. Complete los campos con IDs correctos
2. Revise la consola del navegador (F12) para errores
3. Asegúrese de tener suficiente memoria disponible

### La impresión no se ve correctamente
1. Use la vista previa de impresión del navegador
2. Ajuste los márgenes en la configuración de impresión
3. Seleccione "Guardar como PDF" si tiene problemas

---

## 📝 Notas de la Versión

### v2.0 (2025)
- ✅ Sistema completo de dictado por voz con Web Speech API
- ✅ Síntesis de voz para lectura de campos
- ✅ Exportación mejorada a Word con todos los campos
- ✅ Sistema de guardado y carga con localStorage
- ✅ Auto-guardado cada 30 segundos
- ✅ Atajos de teclado
- ✅ Validaciones de formulario
- ✅ Mejoras en el diseño responsive
- ✅ Animaciones y feedback visual
- ✅ Archivo AUDIT.html agregado
- ✅ Corrección de enlaces de escalas

---

## 👨‍⚕️ Autor

**Dr. Mauricio Villamandos**  
Médico Especialista en Psiquiatría  
Matrícula Provincial: 07489  
Santa Ana, Corrientes – Argentina  
📧 infopsicodinamyc@gmail.com  
📞 3765 041832

---

## 📄 Licencia

Este software es propiedad de:
- **[HCPE] v2.0® © 2025**
- **[Historia Clínica Psiquiátrica Electrónica]**
- Dr. Mauricio Villamandos

**Uso exclusivo para práctica clínica profesional**

---

## 🤝 Contribuciones

Este es un proyecto privado de uso profesional. Para consultas o sugerencias, contacte al autor.

---

## ⚠️ Disclaimer

Este sistema es una herramienta de apoyo clínico. El profesional de la salud es responsable de:
- La veracidad de la información ingresada
- El cumplimiento de normativas locales
- La protección de datos del paciente
- Las decisiones clínicas tomadas

---

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: infopsicodinamyc@gmail.com
- 📞 Teléfono: 3765 041832
- 📍 Ubicación: Santa Ana, Corrientes, Argentina

---

**Última actualización**: Noviembre 2025  
**Versión**: 2.0  
**Estado**: Producción es una web diseñada para gestionar historias clinicas y procesos de evaluación en Salud Mental. Comenzó como un ejercicio de aprendizaje de programación.

Con el tiempo se plantea escalar hasta donde la imaginación y la tecnología acompañen.

