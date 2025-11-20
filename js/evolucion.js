// =====================================================
// SISTEMA DE EVOLUCIONES / SEGUIMIENTO
// =====================================================

let pacienteActual = null;

// =====================================================
// WEB SPEECH API - RECONOCIMIENTO DE VOZ Y SÍNTESIS
// =====================================================
let reconocimiento = null;
let sintesis = window.speechSynthesis;
let campoActual = null;
let vozActual = null;

// Inicializar reconocimiento de voz
function inicializarReconocimientoVoz() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        reconocimiento = new SpeechRecognition();
        reconocimiento.continuous = false;
        reconocimiento.interimResults = false;
        reconocimiento.lang = 'es-AR';
        reconocimiento.maxAlternatives = 1;

        reconocimiento.onresult = function(event) {
            const texto = event.results[0][0].transcript;
            if (campoActual) {
                const campo = document.getElementById(campoActual);
                if (campo) {
                    campo.value += (campo.value ? ' ' : '') + texto;
                    autoAjustarTextarea(campo);
                }
            }
        };

        reconocimiento.onerror = function(event) {
            console.error('Error de reconocimiento:', event.error);
            if (campoActual) {
                const campo = document.getElementById(campoActual);
                if (campo) campo.classList.remove('campo-grabando');
            }
        };

        reconocimiento.onend = function() {
            if (campoActual) {
                const campo = document.getElementById(campoActual);
                if (campo) campo.classList.remove('campo-grabando');
            }
            campoActual = null;
        };

        console.log('✓ Reconocimiento de voz inicializado');
    } else {
        console.warn('⚠️ Reconocimiento de voz no disponible en este navegador');
    }
}

// Inicializar síntesis de voz
function inicializarSintesisVoz() {
    if ('speechSynthesis' in window) {
        const cargarVoces = () => {
            const voces = sintesis.getVoices();
            const vozEspanol = voces.find(voz => voz.lang.startsWith('es'));
            if (vozEspanol) {
                vozActual = vozEspanol;
            }
        };

        if (sintesis.onvoiceschanged !== undefined) {
            sintesis.onvoiceschanged = cargarVoces;
        }
        cargarVoces();

        console.log('✓ Síntesis de voz inicializada');
    } else {
        console.warn('⚠️ Síntesis de voz no disponible en este navegador');
    }
}

// Función para iniciar el dictado
function iniciarDictado(campoId) {
    if (!reconocimiento) {
        alert('⚠️ El reconocimiento de voz no está disponible en este navegador.\nUse Chrome o Edge para esta función.');
        return;
    }

    const campo = document.getElementById(campoId);
    if (!campo) return;

    campoActual = campoId;
    campo.classList.add('campo-grabando');

    try {
        reconocimiento.start();
    } catch (error) {
        console.error('Error al iniciar dictado:', error);
        campo.classList.remove('campo-grabando');
    }
}

// Función para leer el contenido del campo
function leerCampo(campoId) {
    const campo = document.getElementById(campoId);
    if (!campo || !campo.value) {
        alert('⚠️ No hay texto para leer');
        return;
    }

    if (!sintesis) {
        alert('⚠️ La síntesis de voz no está disponible en este navegador');
        return;
    }

    // Detener cualquier lectura anterior
    sintesis.cancel();

    const utterance = new SpeechSynthesisUtterance(campo.value);
    utterance.lang = 'es-AR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (vozActual) {
        utterance.voice = vozActual;
    }

    utterance.onstart = function() {
        campo.classList.add('leyendo');
    };

    utterance.onend = function() {
        campo.classList.remove('leyendo');
    };

    utterance.onerror = function(event) {
        console.error('Error en síntesis:', event);
        campo.classList.remove('leyendo');
    };

    sintesis.speak(utterance);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Sistema de Evoluciones cargado');
    
    // Inicializar Web Speech API
    inicializarReconocimientoVoz();
    inicializarSintesisVoz();
    
    // Establecer fecha y hora actual
    const ahora = new Date();
    const fechaHoraLocal = ahora.toISOString().slice(0, 16);
    document.getElementById('fechaSesion').value = fechaHoraLocal;
    
    // Inicializar textareas auto-expandibles
    inicializarTextareas();
    
    // Verificar si se debe cargar un paciente desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const dniParam = urlParams.get('dni');
    const verHistorial = urlParams.get('ver');
    
    if (dniParam) {
        document.getElementById('dniPaciente').value = dniParam;
        buscarYCargarPaciente();
        
        if (verHistorial === 'historial') {
            setTimeout(() => verHistorialEvoluciones(), 1000);
        }
    }
    
    console.log('✓ Sistema de evoluciones inicializado');
});

// =====================================================
// FUNCIONES DE TEXTAREA AUTO-EXPANDIBLE
// =====================================================
function inicializarTextareas() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        autoAjustarTextarea(textarea);
        
        textarea.addEventListener('input', function() {
            autoAjustarTextarea(this);
        });
    });
}

function autoAjustarTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// =====================================================
// BÚSQUEDA Y CARGA DE PACIENTE
// =====================================================
function buscarYCargarPaciente() {
    const dni = document.getElementById('dniPaciente')?.value?.trim();
    
    if (!dni) {
        alert('⚠️ Ingrese el DNI del paciente');
        return;
    }
    
    // Buscar historia clínica del paciente
    const key = `hcpe_${dni}`;
    const datos = localStorage.getItem(key);
    
    if (!datos) {
        alert(`No se encontró historia clínica para DNI: ${dni}\n\n¿Desea crear una nueva historia clínica?`);
        if (confirm('Abrir formulario de Historia Clínica')) {
            window.location.href = `hcpe.html?dni=${dni}`;
        }
        return;
    }
    
    try {
        const paciente = JSON.parse(datos);
        pacienteActual = paciente;
        
        // Cargar todos los datos del paciente en la Sección 1
        // Los campos vienen con el ID del campo en hcpe.html
        const campos = paciente.campos || {};
        
        // 1A-1D: Datos de la consulta
        if (!document.getElementById('lugarEvaluacion').value) {
            document.getElementById('lugarEvaluacion').value = campos.lugarEvaluacion || 'Resistencia, Chaco';
        }
        document.getElementById('codigoPaciente').value = campos.codigoPaciente || '';
        
        // 1E-1H: Datos personales
        document.getElementById('nombre').value = campos.nombre || '';
        document.getElementById('apellido').value = campos.apellido || '';
        document.getElementById('nacionalidad').value = campos.nacionalidad || '';
        
        // 1I-1L: Datos demográficos
        document.getElementById('sexo').value = campos.sexo || '';
        document.getElementById('fechaNacimiento').value = campos.fechaNacimiento || '';
        document.getElementById('edadPaciente').value = campos.edad || '';
        document.getElementById('estadoCivil').value = campos.estadoCivil || '';
        
        // 1M-1P: Datos de contacto
        document.getElementById('domicilio').value = campos.domicilio || '';
        document.getElementById('codigoPostal').value = campos.codigoPostal || '';
        document.getElementById('telefono').value = campos.telefono || '';
        document.getElementById('email').value = campos.email || '';
        
        console.log('✓ Paciente cargado:', campos.nombre + ' ' + campos.apellido);
        
    } catch (error) {
        console.error('Error al cargar paciente:', error);
        alert('❌ Error al cargar los datos del paciente');
    }
}

function abrirHistoriaClinica() {
    const dni = document.getElementById('dniPaciente')?.value?.trim();
    
    if (!dni) {
        alert('⚠️ Ingrese el DNI del paciente');
        return;
    }
    
    window.location.href = `hcpe.html?dni=${dni}`;
}

// =====================================================
// GUARDAR EVOLUCIÓN
// =====================================================
function guardarEvolucion() {
    const dni = document.getElementById('dniPaciente')?.value?.trim();
    
    if (!dni) {
        alert('⚠️ Debe ingresar el DNI del paciente');
        return;
    }
    
    if (!pacienteActual) {
        alert('⚠️ Debe buscar y cargar el paciente primero');
        return;
    }
    
    // Recolectar datos de la evolución
    const fechaSesion = document.getElementById('fechaSesion').value;
    const timestamp = new Date(fechaSesion).getTime();
    
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const nombreCompleto = `${apellido}, ${nombre}`;
    
    const evolucion = {
        dni: dni,
        nombreCompleto: nombreCompleto,
        fechaSesion: fechaSesion,
        timestamp: timestamp,
        
        // Sección 1: Datos del paciente
        lugarEvaluacion: document.getElementById('lugarEvaluacion').value,
        modalidad: document.getElementById('modalidad').value,
        codigoPaciente: document.getElementById('codigoPaciente').value,
        nombre: nombre,
        apellido: apellido,
        nacionalidad: document.getElementById('nacionalidad').value,
        sexo: document.getElementById('sexo').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        edad: document.getElementById('edadPaciente').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        domicilio: document.getElementById('domicilio').value,
        codigoPostal: document.getElementById('codigoPostal').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        
        // Sección 2: Motivo de consulta
        motivoConsulta: document.getElementById('motivoConsulta').value,
        
        // Sección 3: Estado clínico
        estadoAnimo: document.getElementById('estadoAnimo').value,
        sintomas: {
            insomnio: document.getElementById('sint_insomnio').checked,
            anhedonia: document.getElementById('sint_anhedonia').checked,
            irritabilidad: document.getElementById('sint_irritabilidad').checked,
            fatiga: document.getElementById('sint_fatiga').checked,
            ansiedad: document.getElementById('sint_ansiedad').checked,
            panico: document.getElementById('sint_panico').checked,
            ideacion_suicida: document.getElementById('sint_ideacion_suicida').checked,
            alucinaciones: document.getElementById('sint_alucinaciones').checked,
            delirios: document.getElementById('sint_delirios').checked,
            desorganizacion: document.getElementById('sint_desorganizacion').checked,
            alteracion_apetito: document.getElementById('sint_alteracion_apetito').checked,
            otros: document.getElementById('sint_otros').checked
        },
        observacionesClinicas: document.getElementById('observacionesClinics').value,
        
        // Sección 4: Tratamiento
        adherencia: document.getElementById('adherencia').value,
        respuestaTratamiento: document.getElementById('respuestaTratamiento').value,
        efectosAdversos: {
            ninguno: document.getElementById('ea_ninguno').checked,
            somnolencia: document.getElementById('ea_somnolencia').checked,
            insomnio: document.getElementById('ea_insomnio').checked,
            nauseas: document.getElementById('ea_nauseas').checked,
            cefalea: document.getElementById('ea_cefalea').checked,
            mareos: document.getElementById('ea_mareos').checked,
            disfuncion_sexual: document.getElementById('ea_disfuncion_sexual').checked,
            aumento_peso: document.getElementById('ea_aumento_peso').checked,
            temblor: document.getElementById('ea_temblor').checked,
            otros: document.getElementById('ea_otros').checked
        },
        // Tratamiento farmacológico (tabla estructurada)
        medicamentos: [],
        ajustesTratamiento: document.getElementById('ajustesTratamiento').value,
        
        // Sección 5: Plan
        proximaCita: document.getElementById('proximaCita').value,
        intervaloSeguimiento: document.getElementById('intervaloSeguimiento').value,
        indicaciones: document.getElementById('indicaciones').value,
        observacionesAdicionales: document.getElementById('observacionesAdicionales').value
    };
    
    // Recoger medicamentos de la tabla
    for (let i = 1; i <= 5; i++) {
        const med = document.getElementById(`med${i}`)?.value;
        if (med && med.trim()) {
            evolucion.medicamentos.push({
                nombre: med,
                manana: document.getElementById(`med${i}_manana`)?.value || '',
                tarde: document.getElementById(`med${i}_tarde`)?.value || '',
                noche: document.getElementById(`med${i}_noche`)?.value || '',
                refuerzo: document.getElementById(`med${i}_refuerzo`)?.value || ''
            });
        }
    }
    
    // Guardar en localStorage
    const clave = `evol_${dni}_${timestamp}`;
    localStorage.setItem(clave, JSON.stringify(evolucion));
    
    alert(`✓ Evolución guardada exitosamente\n\nPaciente: ${evolucion.nombreCompleto}\nFecha: ${new Date(fechaSesion).toLocaleString()}`);
    
    console.log('💾 Evolución guardada:', clave);
}

// =====================================================
// HISTORIAL DE EVOLUCIONES
// =====================================================
function verHistorialEvoluciones() {
    const dni = document.getElementById('dniPaciente')?.value?.trim();
    
    if (!dni) {
        alert('⚠️ Ingrese el DNI del paciente');
        return;
    }
    
    const evoluciones = obtenerEvolucionesPaciente(dni);
    
    if (evoluciones.length === 0) {
        alert('No hay evoluciones registradas para este paciente.');
        return;
    }
    
    const listaHistorial = document.getElementById('listaHistorial');
    let html = '<div class="list-group">';
    
    evoluciones.forEach((evol, index) => {
        const fecha = new Date(evol.fechaSesion).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Sesión ${evoluciones.length - index} - ${fecha}</h6>
                        <p class="mb-1 small"><strong>Motivo:</strong> ${evol.motivoConsulta || 'No registrado'}</p>
                        <p class="mb-0 small"><strong>Estado:</strong> ${evol.estadoAnimo || 'No registrado'} | 
                        <strong>Adherencia:</strong> ${evol.adherencia || 'No registrado'}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary" onclick="cargarEvolucion('${evol.key}')">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarEvolucion('${evol.key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Agregar botón de exportar todo
    html += `
        <div class="mt-3">
            <button class="btn btn-success" onclick="exportarTodasEvoluciones('${dni}')">
                <i class="fas fa-file-word"></i> Exportar Todas las Evoluciones a Word
            </button>
        </div>
    `;
    
    listaHistorial.innerHTML = html;
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('historialModal'));
    modal.show();
}

function obtenerEvolucionesPaciente(dni) {
    const evoluciones = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`evol_${dni}_`)) {
            try {
                const datos = JSON.parse(localStorage.getItem(key));
                datos.key = key;
                evoluciones.push(datos);
            } catch (error) {
                console.error('Error al leer evolución:', key);
            }
        }
    }
    
    // Ordenar por fecha (más reciente primero)
    return evoluciones.sort((a, b) => b.timestamp - a.timestamp);
}

function cargarEvolucion(key) {
    try {
        const datos = JSON.parse(localStorage.getItem(key));
        
        // Cargar todos los campos
        document.getElementById('dniPaciente').value = datos.dni;
        document.getElementById('nombreCompletoPaciente').value = datos.nombreCompleto;
        document.getElementById('fechaSesion').value = datos.fechaSesion;
        
        document.getElementById('motivoConsulta').value = datos.motivoConsulta || '';
        
        document.getElementById('estadoAnimo').value = datos.estadoAnimo || '';
        document.getElementById('nivelAnsiedad').value = datos.nivelAnsiedad || 0;
        document.getElementById('valorAnsiedad').textContent = datos.nivelAnsiedad || 0;
        
        // Síntomas
        Object.keys(datos.sintomas || {}).forEach(sintoma => {
            const checkbox = document.getElementById(`sint_${sintoma}`);
            if (checkbox) checkbox.checked = datos.sintomas[sintoma];
        });
        
        document.getElementById('observacionesClinics').value = datos.observacionesClinicas || '';
        
        document.getElementById('adherencia').value = datos.adherencia || '';
        document.getElementById('respuestaTratamiento').value = datos.respuestaTratamiento || '';
        
        // Efectos adversos
        Object.keys(datos.efectosAdversos || {}).forEach(efecto => {
            const checkbox = document.getElementById(`ea_${efecto}`);
            if (checkbox) checkbox.checked = datos.efectosAdversos[efecto];
        });
        
        // Cargar medicamentos de la tabla
        if (datos.medicamentos && Array.isArray(datos.medicamentos)) {
            datos.medicamentos.forEach((med, index) => {
                const i = index + 1;
                if (i <= 5) {
                    document.getElementById(`med${i}`).value = med.nombre || '';
                    document.getElementById(`med${i}_manana`).value = med.manana || '';
                    document.getElementById(`med${i}_tarde`).value = med.tarde || '';
                    document.getElementById(`med${i}_noche`).value = med.noche || '';
                    document.getElementById(`med${i}_refuerzo`).value = med.refuerzo || '';
                }
            });
        }
        
        document.getElementById('ajustesTratamiento').value = datos.ajustesTratamiento || '';
        
        document.getElementById('proximaCita').value = datos.proximaCita || '';
        document.getElementById('intervaloSeguimiento').value = datos.intervaloSeguimiento || '';
        document.getElementById('indicaciones').value = datos.indicaciones || '';
        document.getElementById('observacionesAdicionales').value = datos.observacionesAdicionales || '';
        
        // Ajustar textareas
        inicializarTextareas();
        
        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('historialModal'))?.hide();
        
        console.log('✓ Evolución cargada');
        
    } catch (error) {
        console.error('Error al cargar evolución:', error);
        alert('❌ Error al cargar la evolución');
    }
}

function eliminarEvolucion(key) {
    const datos = JSON.parse(localStorage.getItem(key));
    const fecha = new Date(datos.fechaSesion).toLocaleString();
    
    const confirmar = confirm(`¿Está seguro de eliminar esta evolución?\n\nFecha: ${fecha}\n\n⚠️ Esta acción NO se puede deshacer.`);
    
    if (confirmar) {
        localStorage.removeItem(key);
        alert('✓ Evolución eliminada');
        verHistorialEvoluciones(); // Recargar listado
    }
}

// =====================================================
// FUNCIONES AUXILIARES PARA EXPORTACIÓN
// =====================================================
function generarTablaMedicamentosWord() {
    let tabla = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">';
    tabla += '<tr style="background-color: #28a745; color: white;">';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Medicamento</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Mañana</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Tarde</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Noche</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Refuerzo</th>';
    tabla += '</tr>';
    
    let hayMedicamentos = false;
    for (let i = 1; i <= 5; i++) {
        const med = document.getElementById(`med${i}`)?.value;
        if (med && med.trim()) {
            hayMedicamentos = true;
            tabla += '<tr>';
            tabla += `<td style="border: 1px solid #000; padding: 4px;">${med}</td>`;
            tabla += `<td style="border: 1px solid #000; padding: 4px;">${document.getElementById(`med${i}_manana`)?.value || '-'}</td>`;
            tabla += `<td style="border: 1px solid #000; padding: 4px;">${document.getElementById(`med${i}_tarde`)?.value || '-'}</td>`;
            tabla += `<td style="border: 1px solid #000; padding: 4px;">${document.getElementById(`med${i}_noche`)?.value || '-'}</td>`;
            tabla += `<td style="border: 1px solid #000; padding: 4px;">${document.getElementById(`med${i}_refuerzo`)?.value || '-'}</td>`;
            tabla += '</tr>';
        }
    }
    
    tabla += '</table>';
    return hayMedicamentos ? tabla : 'No registrado';
}

function generarTablaMedicamentosHistorial(medicamentos) {
    if (!medicamentos || medicamentos.length === 0) return 'No registrado';
    
    let tabla = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">';
    tabla += '<tr style="background-color: #28a745; color: white;">';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Medicamento</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Mañana</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Tarde</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Noche</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Refuerzo</th>';
    tabla += '</tr>';
    
    medicamentos.forEach(med => {
        tabla += '<tr>';
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.nombre}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.manana || '-'}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.tarde || '-'}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.noche || '-'}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.refuerzo || '-'}</td>`;
        tabla += '</tr>';
    });
    
    tabla += '</table>';
    return tabla;
}

function generarTablaMedicamentosHistorial(medicamentos) {
    if (!medicamentos || medicamentos.length === 0) {
        return 'No registrado';
    }
    
    let tabla = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">';
    tabla += '<tr style="background-color: #28a745; color: white;">';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Medicamento</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Mañana</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Tarde</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Noche</th>';
    tabla += '<th style="border: 1px solid #000; padding: 5px;">Refuerzo</th>';
    tabla += '</tr>';
    
    medicamentos.forEach(med => {
        tabla += '<tr>';
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.nombre || ''}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.manana || '-'}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.tarde || '-'}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.noche || '-'}</td>`;
        tabla += `<td style="border: 1px solid #000; padding: 4px;">${med.refuerzo || '-'}</td>`;
        tabla += '</tr>';
    });
    
    tabla += '</table>';
    return tabla;
}

// =====================================================
// EXPORTAR A WORD
// =====================================================
function exportarEvolucionWord() {
    const dni = document.getElementById('dniPaciente')?.value?.trim();
    
    if (!dni) {
        alert('⚠️ Debe ingresar el DNI del paciente');
        return;
    }
    
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const nombreCompleto = `${apellido}, ${nombre}`;
    const fechaSesion = new Date(document.getElementById('fechaSesion').value).toLocaleString();
    
    let contenido = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Evolución</title>
        <style>
            @page { margin: 1cm; }
            body { font-family: 'Times New Roman'; font-size: 10pt; line-height: 1.4; margin: 0; }
            h1 { font-size: 13pt; font-weight: bold; text-align: center; margin-bottom: 10px; }
            h2 { font-size: 11pt; font-weight: bold; color: #0066cc; margin-top: 12px; margin-bottom: 8px; }
            .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #0066cc; padding-bottom: 8px; }
            .header p { margin: 2px 0; font-size: 9pt; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
            table td { border: 1px solid #666; padding: 3px 5px; vertical-align: top; }
            table td.label { background: #e8e8e8; font-weight: bold; width: 25%; }
            .campo { margin-bottom: 8px; }
            .label { font-weight: bold; color: #333; }
            .sintomas, .efectos { font-size: 9pt; line-height: 1.6; }
        </style>
        </head>
        <body>
            <div class="header">
                <h1>EVOLUCIÓN / SEGUIMIENTO CLÍNICO</h1>
                <p><strong>Dr. Mauricio Villamandos - Médico Especialista en Psiquiatría</strong></p>
                <p>M.N.: 134131 - Resistencia, Chaco - Argentina</p>
            </div>
            
            <table>
                <tr>
                    <td class="label">Apellido y Nombre</td>
                    <td colspan="3">${nombreCompleto}</td>
                </tr>
                <tr>
                    <td class="label">DNI</td>
                    <td>${dni}</td>
                    <td class="label">Edad</td>
                    <td>${document.getElementById('edadPaciente').value || '-'}</td>
                </tr>
                <tr>
                    <td class="label">Fecha Nacimiento</td>
                    <td>${document.getElementById('fechaNacimiento').value || '-'}</td>
                    <td class="label">Sexo</td>
                    <td>${document.getElementById('sexo').value || '-'}</td>
                </tr>
                <tr>
                    <td class="label">Estado Civil</td>
                    <td>${document.getElementById('estadoCivil').value || '-'}</td>
                    <td class="label">Nacionalidad</td>
                    <td>${document.getElementById('nacionalidad').value || '-'}</td>
                </tr>
                <tr>
                    <td class="label">Domicilio</td>
                    <td colspan="3">${document.getElementById('domicilio').value || '-'}</td>
                </tr>
                <tr>
                    <td class="label">Teléfono</td>
                    <td>${document.getElementById('telefono').value || '-'}</td>
                    <td class="label">Email</td>
                    <td>${document.getElementById('email').value || '-'}</td>
                </tr>
                <tr>
                    <td class="label">Fecha de Sesión</td>
                    <td>${fechaSesion}</td>
                    <td class="label">Modalidad</td>
                    <td>${document.getElementById('modalidad').value || 'Presencial'}</td>
                </tr>
                <tr>
                    <td class="label">Lugar</td>
                    <td colspan="3">${document.getElementById('lugarEvaluacion').value || '-'}</td>
                </tr>
            </table>
            
            <h2>Motivo de Consulta</h2>
            <div class="campo">
                ${document.getElementById('motivoConsulta').value || 'No registrado'}
            </div>
            
            <h2>Estado Clínico Actual</h2>
            <div class="campo">
                <span class="label">Estado de ánimo:</span> ${document.getElementById('estadoAnimo').value || 'No registrado'}
            </div>
            <div class="campo">
                <span class="label">Síntomas presentes:</span>
                <div class="sintomas">
                    ${obtenerCheckboxesTexto('sint_')}
                </div>
            </div>
            <div class="campo">
                <span class="label">Observaciones clínicas:</span><br>
                ${document.getElementById('observacionesClinics').value || 'No registrado'}
            </div>
            
            <h2>Evaluación del Tratamiento</h2>
            <div class="campo">
                <span class="label">Adherencia:</span> ${document.getElementById('adherencia').value || 'No registrado'}
            </div>
            <div class="campo">
                <span class="label">Respuesta al tratamiento:</span> ${document.getElementById('respuestaTratamiento').value || 'No registrado'}
            </div>
            <div class="campo">
                <span class="label">Efectos adversos:</span>
                <div class="efectos">
                    ${obtenerCheckboxesTexto('ea_')}
                </div>
            </div>
            <div class="campo">
                <span class="label">Tratamiento farmacológico actual:</span><br>
                ${generarTablaMedicamentosWord()}
            </div>
            <div class="campo">
                <span class="label">Ajustes realizados:</span><br>
                ${document.getElementById('ajustesTratamiento').value || 'No registrado'}
            </div>
            
            <h2>Plan para Próxima Sesión</h2>
            <div class="campo">
                <span class="label">Próxima cita:</span> ${document.getElementById('proximaCita').value || 'No registrado'}
            </div>
            <div class="campo">
                <span class="label">Intervalo:</span> ${document.getElementById('intervaloSeguimiento').value || 'No registrado'}
            </div>
            <div class="campo">
                <span class="label">Indicaciones:</span><br>
                ${document.getElementById('indicaciones').value || 'No registrado'}
            </div>
            <div class="campo">
                <span class="label">Observaciones adicionales:</span><br>
                ${document.getElementById('observacionesAdicionales').value || ''}
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <p>_______________________________</p>
                <p><strong>Dr. Mauricio Villamandos</strong></p>
                <p>Médico Especialista en Psiquiatría - M.N.: 134131</p>
            </div>
        </body>
        </html>
    `;
    
    const blob = new Blob(['\ufeff', contenido], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Evolucion_${nombreCompleto}_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    
    console.log('📄 Evolución exportada a Word');
}

function obtenerCheckboxesTexto(prefijo) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][id^="${prefijo}"]`);
    const seleccionados = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) {
                seleccionados.push(`• ${label.textContent}`);
            }
        }
    });
    
    return seleccionados.length > 0 ? seleccionados.join('<br>') : '<em>Ninguno</em>';
}

function exportarTodasEvoluciones(dni) {
    const evoluciones = obtenerEvolucionesPaciente(dni);
    
    if (evoluciones.length === 0) {
        alert('No hay evoluciones para exportar');
        return;
    }
    
    const nombreCompleto = evoluciones[0].nombreCompleto;
    
    let contenido = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Historial de Evoluciones</title>
        <style>
            body { font-family: 'Times New Roman'; font-size: 10pt; line-height: 1.5; margin: 2cm; }
            h1 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
            h2 { font-size: 12pt; font-weight: bold; color: #0066cc; margin-top: 20px; margin-bottom: 10px; page-break-before: always; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            .evolucion { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
            .campo { margin-bottom: 8px; }
            .label { font-weight: bold; color: #333; }
        </style>
        </head>
        <body>
            <div class="header">
                <h1>HISTORIAL DE EVOLUCIONES</h1>
                <p><strong>Dr. Mauricio Villamandos - M.N.: 134131</strong></p>
                <p>Resistencia, Chaco</p>
            </div>
            
            <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px;">
                <p><span class="label">Paciente:</span> ${nombreCompleto}</p>
                <p><span class="label">DNI:</span> ${dni}</p>
                <p><span class="label">Total de evoluciones:</span> ${evoluciones.length}</p>
            </div>
    `;
    
    // Invertir orden para mostrar cronológicamente (más antigua primero)
    evoluciones.reverse().forEach((evol, index) => {
        const fecha = new Date(evol.fechaSesion).toLocaleString();
        const sintomas = Object.keys(evol.sintomas || {}).filter(k => evol.sintomas[k]).join(', ') || 'Ninguno';
        const efectosAdversos = Object.keys(evol.efectosAdversos || {}).filter(k => evol.efectosAdversos[k]).join(', ') || 'Ninguno';
        
        contenido += `
            <div class="evolucion">
                <h2>Sesión ${index + 1} - ${fecha}</h2>
                
                <div class="campo"><span class="label">Motivo:</span> ${evol.motivoConsulta || 'No registrado'}</div>
                <div class="campo"><span class="label">Estado de ánimo:</span> ${evol.estadoAnimo || 'No registrado'}</div>
                <div class="campo"><span class="label">Nivel de ansiedad:</span> ${evol.nivelAnsiedad || 0}/10</div>
                <div class="campo"><span class="label">Síntomas:</span> ${sintomas}</div>
                <div class="campo"><span class="label">Observaciones clínicas:</span> ${evol.observacionesClinicas || 'No registrado'}</div>
                
                <div class="campo"><span class="label">Adherencia:</span> ${evol.adherencia || 'No registrado'}</div>
                <div class="campo"><span class="label">Respuesta:</span> ${evol.respuestaTratamiento || 'No registrado'}</div>
                <div class="campo"><span class="label">Efectos adversos:</span> ${efectosAdversos}</div>
                <div class="campo"><span class="label">Tratamiento farmacológico:</span><br>${generarTablaMedicamentosHistorial(evol.medicamentos)}</div>
                <div class="campo"><span class="label">Ajustes:</span> ${evol.ajustesTratamiento || 'No'}</div>
                
                <div class="campo"><span class="label">Próxima cita:</span> ${evol.proximaCita || 'No registrado'}</div>
                <div class="campo"><span class="label">Indicaciones:</span> ${evol.indicaciones || 'No registrado'}</div>
            </div>
        `;
    });
    
    contenido += `
        </body>
        </html>
    `;
    
    const blob = new Blob(['\ufeff', contenido], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historial_Evoluciones_${nombreCompleto}_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    
    console.log('📄 Historial completo exportado a Word');
}

// =====================================================
// NUEVA EVOLUCIÓN
// =====================================================
function nuevaEvolucion() {
    const confirmar = confirm('¿Desea crear una nueva evolución?\n\nSe perderán los datos actuales si no los ha guardado.');
    
    if (confirmar) {
        // Mantener DNI y datos del paciente
        const dni = document.getElementById('dniPaciente').value;
        const nombreCompleto = document.getElementById('nombreCompletoPaciente').value;
        const edad = document.getElementById('edadPaciente').value;
        
        // Limpiar formulario
        document.getElementById('evolucionForm').reset();
        
        // Limpiar tabla de medicamentos
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`med${i}`).value = '';
            document.getElementById(`med${i}_manana`).value = '';
            document.getElementById(`med${i}_tarde`).value = '';
            document.getElementById(`med${i}_noche`).value = '';
            document.getElementById(`med${i}_refuerzo`).value = '';
        }
        
        // Restaurar datos del paciente
        document.getElementById('dniPaciente').value = dni;
        document.getElementById('nombreCompletoPaciente').value = nombreCompleto;
        document.getElementById('edadPaciente').value = edad;
        
        // Establecer fecha y hora actual
        const ahora = new Date();
        document.getElementById('fechaSesion').value = ahora.toISOString().slice(0, 16);
        
        console.log('📄 Nueva evolución creada');
    }
}

// =====================================================
// BACKUP Y RESTORE DEL SISTEMA COMPLETO
// =====================================================
function exportarBackupDesdeEvol() {
    try {
        const backup = {
            version: '2.0',
            fecha: new Date().toISOString(),
            datos: {}
        };
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('hcpe_') || key.startsWith('evol_'))) {
                backup.datos[key] = localStorage.getItem(key);
            }
        }
        
        const totalHistorias = Object.keys(backup.datos).filter(k => k.startsWith('hcpe_') && k !== 'hcpe_indice_pacientes' && k !== 'hcpe_autosave' && k !== 'hcpe_cargar_ultimo').length;
        const totalEvoluciones = Object.keys(backup.datos).filter(k => k.startsWith('evol_')).length;
        
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `HCPE_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        alert(`✓ Backup exportado exitosamente\n\n📊 Contenido:\n- ${totalHistorias} historias clínicas\n- ${totalEvoluciones} evoluciones`);
        
    } catch (error) {
        console.error('Error al exportar backup:', error);
        alert('❌ Error al exportar backup.');
    }
}

function importarBackupDesdeEvol(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const confirmar = confirm(`⚠️ ¿Importar backup?\n\nEsto puede sobrescribir pacientes existentes.\n\n¿Continuar?`);
    if (!confirmar) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (!backup.version || !backup.datos) {
                throw new Error('Formato inválido');
            }
            
            const totalHistorias = Object.keys(backup.datos).filter(k => k.startsWith('hcpe_') && k !== 'hcpe_indice_pacientes' && k !== 'hcpe_autosave' && k !== 'hcpe_cargar_ultimo').length;
            const totalEvoluciones = Object.keys(backup.datos).filter(k => k.startsWith('evol_')).length;
            
            for (const key in backup.datos) {
                localStorage.setItem(key, backup.datos[key]);
            }
            
            alert(`✓ Backup importado\n\n- ${totalHistorias} historias clínicas\n- ${totalEvoluciones} evoluciones\n\nRecargue la página.`);
            
        } catch (error) {
            console.error('Error al importar:', error);
            alert('❌ Error al importar backup.');
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}
