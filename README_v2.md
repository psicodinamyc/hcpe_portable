# 🏥 HCPE - Historia Clínica Psiquiátrica Electrónica

**Sistema completo de gestión de historias clínicas psiquiátricas y seguimiento de pacientes**  
Versión 2.0 - 2025

---

## 📋 Descripción

HCPE es un sistema web offline completo para la gestión de historias clínicas psiquiátricas y seguimiento de pacientes. Funciona 100% sin internet, no requiere servidor ni base de datos externa, y permite gestionar múltiples pacientes de forma organizada.

---

## ✨ Características Principales

### Sistema Multi-Paciente
- ✅ **Gestión por DNI**: Cada paciente identificado de forma única
- ✅ **Múltiples pacientes**: Capacidad ilimitada
- ✅ **Búsqueda rápida**: Por DNI, nombre o apellido
- ✅ **Historial completo**: Todas las evoluciones organizadas por paciente

### Tres Módulos Integrados

#### 1️⃣ Historia Clínica (hcpe.html)
- Formulario completo de primera consulta
- 11 secciones + examen mental detallado (8A-8O)
- Auto-guardado cada 30 segundos por DNI
- Búsqueda de paciente existente
- Exportación profesional a Word/PDF

#### 2️⃣ Evoluciones (evolucion.html)
- Formulario simplificado para seguimiento
- Carga automática de datos del paciente
- Historial completo de sesiones
- Exportación individual o cronológica
- Evaluación de tratamiento y adherencia

#### 3️⃣ Listado de Pacientes (pacientes.html)
- Vista centralizada de todos los pacientes
- Estadísticas en tiempo real
- Búsqueda instantánea
- Acceso rápido a HC y evoluciones
- Eliminación segura con confirmación

### Tecnologías Integradas
- 🎤 **Dictado por Voz**: Transcripción automática (Web Speech API)
- 🔊 **Lectura de Texto**: Síntesis de voz para revisión
- 💾 **localStorage**: Persistencia offline total
- 📝 **Exportación Word**: Documentos profesionales
- 🖨️ **Impresión optimizada**: CSS específico para print
- 📱 **Responsive**: Funciona en desktop, tablet y móvil

---

## 🚀 Uso del Sistema

### Primera Vez - Crear Paciente

1. **Opción A - Desde listado**:
   - Abrir `pacientes.html`
   - Clic en "Nueva Historia Clínica"

2. **Opción B - Directa**:
   - Abrir `hcpe.html`
   - Ingresar DNI del paciente
   - Clic en botón buscar (🔍)
   - Si no existe, confirmar creación
   - Completar formulario
   - Guardar automáticamente

### Paciente Existente - Cargar

1. **Desde pacientes.html**:
   - Buscar paciente en el listado
   - Clic en "Abrir HC" o "Evolución"

2. **Desde hcpe.html**:
   - Ingresar DNI
   - Clic en buscar (🔍)
   - Se carga automáticamente

3. **Desde evolucion.html**:
   - Ingresar DNI
   - Clic en buscar (🔍)
   - Completar evolución

### Crear Evolución

1. Ir a `evolucion.html`
2. Ingresar DNI del paciente
3. Completar evolución (3-5 minutos)
4. Guardar
5. Ver historial completo con botón "Ver Historial"

---

## 📁 Estructura de Archivos

```
hcpe_portable/
│
├── hcpe.html              # Historia clínica principal
├── evolucion.html         # Formulario de evoluciones
├── pacientes.html         # Listado y gestión
├── README.md              # Este archivo
│
├── css/
│   └── style.css         # Estilos + print media queries
│
├── js/
│   ├── script.js         # Lógica HC principal
│   └── evolucion.js      # Lógica evoluciones
│
├── images/
│   ├── firma_digital.png # Firma para documentos
│   └── logo.png
│
└── escalas/              # Instrumentos psicométricos
    ├── scl90r.html
    ├── ham_d.html
    ├── ham_a.html
    ├── moca.html
    ├── mmse.html
    ├── panss.html
    ├── whoqol_breef.html
    ├── audit.html
    ├── dast.html
    ├── barrero_s.html
    └── bprs_18.html
```

---

## 💾 Sistema de Almacenamiento (localStorage)

### Estructura de Datos

```javascript
// Historia Clínica
hcpe_[DNI] = {
    timestamp: "2025-11-19T14:30:00.000Z",
    dni: "12345678",
    nombreCompleto: "Pérez, Juan",
    campos: {
        nombre: "Juan",
        apellido: "Pérez",
        edad: "35",
        // ... todos los campos
    }
}

// Evoluciones (múltiples por paciente)
evol_[DNI]_[timestamp] = {
    dni: "12345678",
    nombreCompleto: "Pérez, Juan",
    fechaSesion: "2025-11-19T14:30",
    timestamp: 1700406600000,
    motivoConsulta: "Control periódico",
    estadoAnimo: "eutimico",
    // ... campos específicos de evolución
}

// Índice de Pacientes (para búsqueda rápida)
hcpe_indice_pacientes = {
    "12345678": {
        dni: "12345678",
        apellido: "Pérez",
        nombre: "Juan",
        nombreCompleto: "Pérez, Juan",
        ultimaModificacion: "2025-11-19T14:30:00.000Z"
    }
}
```

---

## 🔧 Funciones Principales

### Historia Clínica (script.js)

| Función | Descripción |
|---------|-------------|
| `guardarFormulario()` | Guarda HC usando DNI como clave |
| `cargarFormulario(dni)` | Carga HC existente por DNI |
| `buscarPacientePorDNI()` | Busca paciente o crea nuevo |
| `exportarAWord()` | Exporta HC completa a Word |
| `autoGuardar()` | Guardado automático cada 30s |
| `actualizarIndicePacientes()` | Mantiene índice actualizado |

### Evoluciones (evolucion.js)

| Función | Descripción |
|---------|-------------|
| `guardarEvolucion()` | Guarda evolución con timestamp único |
| `buscarYCargarPaciente()` | Carga datos del paciente desde HC |
| `verHistorialEvoluciones()` | Muestra todas las evoluciones en modal |
| `cargarEvolucion(key)` | Abre evolución específica |
| `exportarEvolucionWord()` | Exporta evolución individual |
| `exportarTodasEvoluciones(dni)` | Exporta historial cronológico completo |

### Listado de Pacientes (pacientes.html)

| Función | Descripción |
|---------|-------------|
| `cargarListadoPacientes()` | Muestra todos los pacientes |
| `filtrarPacientes(termino)` | Búsqueda en tiempo real |
| `abrirHistoriaClinica(dni)` | Redirecciona a HC |
| `abrirEvolucion(dni)` | Redirecciona a evoluciones |
| `eliminarPaciente(dni)` | Elimina paciente y sus evoluciones |

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + S` | Guardar formulario |
| `Ctrl/Cmd + O` | Cargar formulario |
| `Ctrl/Cmd + P` | Imprimir |
| `Ctrl/Cmd + N` | Nuevo formulario |

---

## 📱 Características Avanzadas

### Navegación Inteligente
- ✅ Carga automática desde URL: `?dni=12345678`
- ✅ Navegación fluida entre módulos
- ✅ Botones contextuales según estado

### UX Optimizada
- ✅ Textareas auto-expandibles sin scroll
- ✅ Feedback visual en todas las acciones
- ✅ Confirmaciones antes de eliminar
- ✅ Búsqueda instantánea sin lag

### Exportación Profesional
- ✅ Word con formato Times New Roman
- ✅ Tablas con bordes y alternancia de colores
- ✅ Firma digital embebida (200pt)
- ✅ Header/footer con credenciales
- ✅ Historial cronológico completo

---

## 🔒 Privacidad y Seguridad

- ✅ **100% Local**: No se envían datos a servidores
- ✅ **Sin Internet**: Funciona completamente offline
- ✅ **Sin Base de Datos**: No hay registro centralizado
- ✅ **Control Total**: Usuario mantiene todos los datos
- ⚠️ **Backup Manual**: Exportar regularmente a Word
- ⚠️ **Navegador**: Datos se pierden si se limpia caché

### Recomendaciones de Seguridad
1. Exportar historias clínicas regularmente
2. No limpiar caché del navegador
3. Hacer backup del directorio completo
4. Usar en dispositivo seguro y privado

---

## 🐛 Solución de Problemas

### El dictado por voz no funciona
- ✅ Usar Chrome o Edge (mejor compatibilidad)
- ✅ Otorgar permisos de micrófono
- ✅ Firefox no soporta dictado actualmente

### Los datos no se guardan
- ✅ Verificar que DNI esté ingresado
- ✅ No usar modo incógnito/privado
- ✅ Revisar espacio disponible (F12 > Console)

### No aparecen pacientes en listado
- ✅ Verificar que historias tengan DNI válido
- ✅ Revisar localStorage en DevTools (F12 > Application)
- ✅ Intentar guardar nuevamente con DNI

### Exportación a Word incompleta
- ✅ Completar campos con IDs correctos
- ✅ Revisar consola (F12) para errores
- ✅ Actualizar navegador a última versión

---

## 📊 Instrumentos de Evaluación Incluidos

| Escala | Descripción | Archivo |
|--------|-------------|---------|
| **SCL-90-R** | Inventario de Síntomas (web externa) | - |
| **HAM-D** | Escala de Depresión de Hamilton | ham_d.html |
| **HAM-A** | Escala de Ansiedad de Hamilton | ham_a.html |
| **MoCA** | Montreal Cognitive Assessment | moca.html |
| **MMSE** | Mini-Mental State Examination | mmse.html |
| **PANSS** | Escala de Síntomas Positivos y Negativos | panss.html |
| **WHOQOL-BREEF** | Calidad de Vida OMS | whoqol_breef.html |
| **AUDIT** | Test Identificación Alcohol | audit.html |
| **DAST** | Test Detección Abuso Drogas | dast.html |
| **Barrero/S** | Escala Barrero | barrero_s.html |
| **BPRS-18** | Brief Psychiatric Rating Scale | bprs_18.html |

---

## 🌐 Compatibilidad

### Navegadores Soportados

| Navegador | Versión | localStorage | Dictado | Síntesis |
|-----------|---------|--------------|---------|----------|
| Chrome | 90+ | ✅ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ | ✅ |
| Firefox | 90+ | ✅ | ❌ | ✅ |
| Opera | 76+ | ✅ | ✅ | ✅ |

### Dispositivos
- 💻 **Desktop**: Funcionalidad completa
- 📱 **Tablet**: Funcionalidad completa
- 📱 **Móvil**: Funcionalidad completa (UI adaptada)

---

## 👨‍⚕️ Autor

**Dr. Mauricio Villamandos**  
Médico Especialista en Psiquiatría  
M.N.: 134131  
Resistencia, Chaco – Argentina

📧 infopsicodinamyc@gmail.com  
📞 3765 041832

---

## 📄 Licencia

**[HCPE] v2.0® © 2025**  
**Psi.Co.Di.Na.M.& C.**  
Psiquiatría Convencional Dinámica Natural Metódica y Científica

Uso exclusivo para práctica clínica profesional.

---

## ⚠️ Disclaimer

Este sistema es una herramienta de apoyo clínico. El profesional es responsable de:
- La veracidad de la información ingresada
- El cumplimiento de normativas locales de salud
- La protección de datos del paciente (Ley 25.326)
- Las decisiones clínicas tomadas

---

## 📝 Notas de Versión

### v2.0 (Noviembre 2025)
- ✅ Sistema multi-paciente con gestión por DNI
- ✅ Módulo de evoluciones simplificado
- ✅ Listado centralizado de pacientes
- ✅ Historial completo de evoluciones por paciente
- ✅ Exportación cronológica de evoluciones
- ✅ Navegación inteligente con parámetros URL
- ✅ Textareas auto-expandibles
- ✅ Auto-guardado mejorado (solo con DNI)
- ✅ Búsqueda en tiempo real
- ✅ Estadísticas en listado de pacientes
- ✅ Confirmaciones de seguridad antes de eliminar

### v1.0 (2025)
- ✅ Formulario completo de HC psiquiátrica
- ✅ Dictado por voz con Web Speech API
- ✅ Síntesis de voz para lectura
- ✅ Exportación a Word/PDF
- ✅ Guardado en localStorage
- ✅ Auto-guardado cada 30 segundos

---

## 📞 Soporte

Para consultas técnicas o sugerencias:

📧 **Email**: infopsicodinamyc@gmail.com  
📞 **Teléfono**: 3765 041832  
📍 **Ubicación**: Resistencia, Chaco, Argentina

---

**Última actualización**: Noviembre 19, 2025  
**Versión**: 2.0  
**Estado**: Producción
