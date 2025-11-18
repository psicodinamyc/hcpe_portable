// =====================================================
// SISTEMA DE GESTIÓN DE HISTORIA CLÍNICA PSIQUIÁTRICA
// =====================================================

// Variables globales para Web Speech API
let reconocimiento = null;
let sintesis = window.speechSynthesis;
let campoActual = null;
let vozActual = null;

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 HCPE - Sistema de Historia Clínica Psiquiátrica cargado');
    
    // Inicializar Web Speech API
    inicializarReconocimientoVoz();
    inicializarSintesisVoz();
    
    // Asignar IDs a botones de exportación
    asignarIDsBotones();
    
    // Auto-guardar cada 30 segundos
    setInterval(autoGuardar, 30000);
    
    // Cargar último formulario guardado si existe
    const cargarUltimo = localStorage.getItem('hcpe_cargar_ultimo');
    if (cargarUltimo === 'true') {
        cargarFormulario('autosave');
    }
    
    console.log('✓ Sistema inicializado correctamente');
});

// =====================================================
// WEB SPEECH API - RECONOCIMIENTO DE VOZ (DICTADO)
// =====================================================
function inicializarReconocimientoVoz() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        reconocimiento = new SpeechRecognition();
        
        reconocimiento.lang = 'es-AR'; // Español de Argentina
        reconocimiento.continuous = true;
        reconocimiento.interimResults = true;
        reconocimiento.maxAlternatives = 1;
        
        reconocimiento.onresult = function(event) {
            let transcripcion = '';
            let esFinal = false;
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const resultado = event.results[i];
                if (resultado.isFinal) {
                    transcripcion += resultado[0].transcript;
                    esFinal = true;
                } else {
                    transcripcion += resultado[0].transcript;
                }
            }
            
            if (campoActual) {
                const campo = document.getElementById(campoActual);
                if (campo) {
                    if (esFinal) {
                        // Agregar el texto final con un espacio
                        campo.value += transcripcion + ' ';
                    } else {
                        // Mostrar preview del texto temporal
                        campo.placeholder = transcripcion;
                    }
                }
            }
        };
        
        reconocimiento.onerror = function(event) {
            console.error('Error en reconocimiento de voz:', event.error);
            if (campoActual) {
                detenerDictado(campoActual);
            }
            
            if (event.error === 'no-speech') {
                alert('⚠️ No se detectó habla. Intente nuevamente.');
            } else if (event.error === 'not-allowed') {
                alert('❌ Permiso denegado. Active el micrófono en la configuración de su navegador.');
            }
        };
        
        reconocimiento.onend = function() {
            if (campoActual) {
                const campo = document.getElementById(campoActual);
                if (campo) {
                    campo.classList.remove('campo-grabando');
                    campo.placeholder = '';
                }
            }
        };
        
        console.log('✓ Reconocimiento de voz inicializado');
    } else {
        console.warn('⚠️ Web Speech API no soportada en este navegador');
    }
}

function iniciarDictado(idCampo) {
    if (!reconocimiento) {
        alert('❌ El reconocimiento de voz no está disponible en su navegador.\n\nUse Chrome, Edge o Safari para esta función.');
        return;
    }
    
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    
    // Si ya está grabando, detener
    if (campoActual === idCampo) {
        detenerDictado(idCampo);
        return;
    }
    
    // Detener cualquier grabación anterior
    if (campoActual) {
        detenerDictado(campoActual);
    }
    
    // Iniciar nueva grabación
    campoActual = idCampo;
    campo.classList.add('campo-grabando');
    
    try {
        reconocimiento.start();
        console.log('🎤 Dictado iniciado para:', idCampo);
    } catch (error) {
        console.error('Error al iniciar dictado:', error);
        detenerDictado(idCampo);
    }
}

function detenerDictado(idCampo) {
    if (reconocimiento && campoActual) {
        try {
            reconocimiento.stop();
        } catch (error) {
            console.error('Error al detener dictado:', error);
        }
        
        const campo = document.getElementById(idCampo);
        if (campo) {
            campo.classList.remove('campo-grabando');
            campo.placeholder = '';
        }
        
        campoActual = null;
        console.log('⏹️ Dictado detenido');
    }
}

// =====================================================
// WEB SPEECH API - SÍNTESIS DE VOZ (LECTURA)
// =====================================================
function inicializarSintesisVoz() {
    if ('speechSynthesis' in window) {
        // Cargar voces disponibles
        let voces = sintesis.getVoices();
        
        if (voces.length === 0) {
            // Algunos navegadores necesitan esperar a que se carguen
            sintesis.onvoiceschanged = function() {
                voces = sintesis.getVoices();
                seleccionarVozEspañol(voces);
            };
        } else {
            seleccionarVozEspañol(voces);
        }
        
        console.log('✓ Síntesis de voz inicializada');
    } else {
        console.warn('⚠️ Síntesis de voz no soportada en este navegador');
    }
}

function seleccionarVozEspañol(voces) {
    // Buscar voz en español (prioridad: es-AR, es-ES, es-MX, cualquier es-*)
    vozActual = voces.find(voz => voz.lang === 'es-AR') ||
                voces.find(voz => voz.lang === 'es-ES') ||
                voces.find(voz => voz.lang.startsWith('es-')) ||
                voces[0];
    
    console.log('🔊 Voz seleccionada:', vozActual?.name || 'Predeterminada');
}

function leer(idCampo) {
    if (!sintesis) {
        alert('❌ La síntesis de voz no está disponible en su navegador.');
        return;
    }
    
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    
    // Si ya está leyendo, detener
    if (sintesis.speaking) {
        sintesis.cancel();
        campo.classList.remove('leyendo');
        return;
    }
    
    const texto = campo.value.trim();
    if (!texto) {
        alert('⚠️ El campo está vacío. No hay nada que leer.');
        return;
    }
    
    // Crear utterance
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-AR';
    utterance.rate = 0.9; // Velocidad un poco más lenta para mejor comprensión
    utterance.pitch = 1;
    utterance.volume = 1;
    
    if (vozActual) {
        utterance.voice = vozActual;
    }
    
    // Eventos
    utterance.onstart = function() {
        campo.classList.add('leyendo');
        console.log('🔊 Lectura iniciada:', idCampo);
    };
    
    utterance.onend = function() {
        campo.classList.remove('leyendo');
        console.log('⏹️ Lectura finalizada');
    };
    
    utterance.onerror = function(event) {
        console.error('Error en lectura:', event.error);
        campo.classList.remove('leyendo');
        alert('❌ Error al leer el texto.');
    };
    
    // Iniciar lectura
    sintesis.speak(utterance);
}

// =====================================================
// CÁLCULO DE EDAD
// =====================================================
function calcularEdad(fechaNac) {
    if (!fechaNac) return;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    document.getElementById('edad').value = edad;
}

// =====================================================
// EXPORTACIÓN A PDF
// =====================================================
function exportarAPDF() {
    try {
        // Mostrar indicador de carga
        mostrarCarga('btnPDF', 'Generando PDF...');
        
        // Obtener el elemento principal del formulario
        const elemento = document.querySelector('main');
        
        // Usar html2canvas para capturar el contenido
        html2canvas(elemento, {
            scale: 2, // Mejor calidad
            useCORS: true,
            logging: false
        }).then(canvas => {
            // Crear PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Obtener dimensiones
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // Ancho A4 en mm
            const pageHeight = 295; // Alto A4 en mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // Agregar primera página
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Agregar páginas adicionales si es necesario
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Generar nombre de archivo
            const nombrePaciente = document.getElementById('nombre')?.value || 'Paciente';
            const apellidoPaciente = document.getElementById('apellido')?.value || '';
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `Historia_Clinica_${nombrePaciente}_${apellidoPaciente}_${fecha}.pdf`;
            
            // Descargar PDF
            pdf.save(nombreArchivo);
            
            // Ocultar indicador de carga
            ocultarCarga('btnPDF', '<i class="fas fa-file-pdf"></i> Exportar a PDF');
            
            alert('✓ PDF generado exitosamente');
            
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            ocultarCarga('btnPDF', '<i class="fas fa-file-pdf"></i> Exportar a PDF');
            alert('❌ Error al generar el PDF. Intente nuevamente.');
        });
        
    } catch (error) {
        console.error('Error en exportarAPDF:', error);
        ocultarCarga('btnPDF', '<i class="fas fa-file-pdf"></i> Exportar a PDF');
        alert('❌ Error al generar el PDF. Verifique que haya completado al menos algunos campos del formulario.');
    }
}

// =====================================================
// EXPORTACIÓN A WORD (FORMATO HTML COMPATIBLE)
// =====================================================
function exportarAWord() {
    try {
        mostrarCarga('btnWord', 'Generando Word...');
        
        // Función auxiliar para obtener valor de campo
        function obtenerValor(id) {
            const elem = document.getElementById(id);
            return elem ? (elem.value || '').trim() : '';
        }
        
        // Función para obtener texto de opción seleccionada en select
        function obtenerSelectText(selector) {
            const select = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!select) return '';
            const selectedOption = select.options[select.selectedIndex];
            return selectedOption ? selectedOption.text : '';
        }
        
        // Función para obtener checkboxes seleccionados
        function obtenerCheckboxes(name) {
            if (Array.isArray(name)) {
                // Si es un array de nombres/ids, buscar cada uno
                const resultados = name.map(n => {
                    const checkbox = document.getElementById(n);
                    return checkbox && checkbox.checked ? n : null;
                }).filter(n => n !== null);
                return resultados.length > 0 ? resultados.join(', ') : '';
            } else {
                // Comportamiento original para string
                const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
                const valores = Array.from(checkboxes).map(cb => {
                    const label = cb.parentElement.textContent || cb.value;
                    return label.trim();
                });
                return valores.length > 0 ? valores.join(', ') : '';
            }
        }
        
        // Función para obtener radio button seleccionado
        function obtenerRadio(name) {
            const radio = document.querySelector(`input[name="${name}"]:checked`);
            if (!radio) return '';
            const label = radio.parentElement.textContent || radio.value;
            return label.trim();
        }
        
        // Función para obtener todos los selects de una sección
        function obtenerTodosSelects(contenedorId) {
            const contenedor = document.getElementById(contenedorId);
            if (!contenedor) return '';
            const selects = contenedor.querySelectorAll('select');
            const valores = Array.from(selects).map(select => {
                if (select.selectedIndex > 0) {
                    const label = select.previousElementSibling?.textContent || '';
                    const valor = select.options[select.selectedIndex].text;
                    return `${label}: ${valor}`;
                }
            }).filter(v => v);
            return valores.join('; ');
        }
        
        // Función auxiliar para escapar HTML
        function escaparHTML(texto) {
            if (!texto) return '';
            return texto.replace(/&/g, '&amp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;')
                       .replace(/"/g, '&quot;')
                       .replace(/'/g, '&#39;')
                       .replace(/\n/g, '<br>');
        }
        
        // Función auxiliar para combinar valores de select y observación
        function combinarValorSelectObservacion(selectValor, observacionValor) {
            const select = selectValor || '';
            const obs = observacionValor || '';
            if (select && obs) {
                return select + ' - ' + obs;
            } else if (select) {
                return select;
            } else if (obs) {
                return obs;
            }
            return '';
        }
        
        // Función auxiliar para obtener valor seguro
        function valorSeguro(valor) {
            return valor || '';
        }
        
        // Función para crear tabla de campos
        function crearGridDatos(campos) {
            let html = '<table class="datos-table"><tbody><tr>';
            campos.forEach((campo, index) => {
                html += `<td class="dato-cell">${campo}</td>`;
                if ((index + 1) % 3 === 0 && index < campos.length - 1) {
                    html += '</tr><tr>';
                }
            });
            // Fill remaining cells if needed
            const remainingCells = campos.length % 3;
            if (remainingCells > 0) {
                for (let i = remainingCells; i < 3; i++) {
                    html += '<td class="dato-cell"></td>';
                }
            }
            html += '</tr></tbody></table>';
            return html;
        }
        
        function crearTablaCampos(campos) {
            let html = '<table class="campos-table"><tbody>';
            campos.forEach(campo => {
                if (campo.valor && campo.valor.trim()) {
                    html += '<tr>';
                    html += `<td class="campo-label">${campo.label}:</td>`;
                    html += `<td class="campo-valor">${campo.esTextarea ? `<div class="text-block">${escaparHTML(campo.valor || '')}</div>` : escaparHTML(campo.valor || '')}</td>`;
                    html += '</tr>';
                }
            });
            html += '</tbody></table>';
            return html;
        }

        // Helper to create a field HTML snippet for Word export
        function agregarCampo(label, valor, esTextarea = false) {
            if (valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '')) return '';
            const safeValor = escaparHTML(valor);
            if (esTextarea) {
                return `<div class="field"><div class="text-block"><span class="label">${label ? label + ':' : ''}</span><div class="value">${safeValor}</div></div></div>`;
            }
            if (label) {
                return `<div class="field-inline"><span class="label">${label}:</span> <span class="value">${safeValor}</span></div>`;
            }
            return `<div class="field-inline"><span class="value">${safeValor}</span></div>`;
        }
        
        // Recolectar todos los datos del formulario
        const datos = {
            // Sección 1: Datos Generales
            lugarEvaluacion: obtenerValor('lugarEvaluacion'),
            fechaEvaluacion: obtenerValor('fechaEvaluacion'),
            modalidad: obtenerSelectText('#modalidad'),
            codigoPaciente: obtenerValor('codigoPaciente'),
            nombre: obtenerValor('nombre'),
            apellido: obtenerValor('apellido'),
            dni: obtenerValor('dni'),
            edad: obtenerValor('edad'),
            fechaNacimiento: obtenerValor('fechaNacimiento'),
            sexo: obtenerSelectText('#sexo'),
            estadoCivil: obtenerSelectText('#estadoCivil'),
            nacionalidad: obtenerSelectText('#nacionalidad'),
            domicilio: obtenerValor('domicilio'),
            codigoPostal: obtenerValor('codigoPostal'),
            telefono: obtenerValor('telefono'),
            email: obtenerValor('email'),
            ocupacion: obtenerValor('ocupacion'),
            nivelEducativo: obtenerSelectText('#nivelEducativo'),
            obraSocial: obtenerValor('obraSocial'),
            numeroAfiliado: obtenerValor('numeroAfiliado'),
            contactoEmergencia: obtenerValor('contactoEmergencia'),
            telefonoEmergencia: obtenerValor('telefonoEmergencia'),
            relacionEmergencia: obtenerValor('relacionEmergencia'),
            psicologo: obtenerValor('psicologo'),
            observacionesGenerales: obtenerValor('observaciones-generales'),
            
            // Sección 2: Motivo de Consulta
            motivoConsulta: obtenerValor('motivoConsulta'),
            
            // Sección 3: Antecedentes de Enfermedad Actual
            antecedentesEnfermedad: obtenerValor('antecedentesEnfermedad'),
            
            // Sección 4: Antecedentes Psiquiátricos
            diagnosticosPrevios: obtenerValor('diagnosticosPrevios'),
            hospitalizacionesSelect: obtenerSelectText('#hospitalizacionesSelect'),
            hospitalizacionesDetalle: obtenerValor('hospitalizacionesDetalle'),
            intentosSuicidio: obtenerSelectText('#intentosSuicidio'),
            numeroIntentos: obtenerValor('numeroIntentos'),
            metodoSuicidio: obtenerValor('metodoSuicidio'),
            ultimoIntento: obtenerValor('ultimoIntento'),
            tratamientosPrevios: obtenerValor('tratamientosPrevios'),
            medicacionEsquemas: obtenerValor('medicacionEsquemas'),
            otrosTratamientos: obtenerValor('otrosTratamientos'),
            
            // Sección 5: Antecedentes Médicos
            enfermedades: obtenerSelectText('#enfermedades'),
            enfermedadesAgudas: obtenerValor('enfermedadesAgudas'),
            cirugias: obtenerSelectText('#cirugias'),
            cirugiasPrevias: obtenerValor('cirugiasPrevias'),
            alergiasSelect: obtenerSelectText('#alergiasSelect'),
            alergias: obtenerValor('alergias'),
            consumoSustancias: obtenerSelectText('#consumoSustancias'),
            alcoholSelect: obtenerSelectText('#alcoholSelect'),
            opiaceosSelect: obtenerSelectText('#opiaceosSelect'),
            marihuanaSelect: obtenerSelectText('#marihuanaSelect'),
            cocainaSelect: obtenerSelectText('#cocainaSelect'),
            sinteticasSelect: obtenerSelectText('#sinteticasSelect'),
            drogasilicitas: obtenerValor('drogasilicitas'),
            antecedentesGineco: obtenerValor('antecedentesGineco'),
            
            // Sección 6: Antecedentes Familiares
            historiaFamiliarPsiquiatrica: obtenerValor('historiaFamiliarPsiquiatrica'),
            historiaSuicidioFamiliar: obtenerValor('historiaSuicidioFamiliar'),
            parentescoSuicidio: obtenerValor('parentescoSuicidio'),
            historiaConsumoFamiliar: obtenerValor('historiaConsumoFamiliar'),
            parentescoConsumo: obtenerValor('parentescoConsumo'),
            
            // Sección 7: Historia Psicosocial
            dinamicaFamiliar: obtenerValor('dinamicaFamiliar'),
            redApoyo: obtenerValor('redApoyo'),
            eventosEstresantes: obtenerValor('eventosEstresantes'),
            
            // Sección 8: Exploración Psicopatológica
            higiene: obtenerSelectText('#higiene'),
            observacionHigiene: obtenerValor('observacionHigiene'),
            actitud: obtenerSelectText('#actitud'),
            observacionActitud: obtenerValor('observacionActitud'),
            expresion: obtenerSelectText('#expresion'),
            observacionExpresion: obtenerValor('observacionExpresion'),
            conducta: obtenerSelectText('#conducta'),
            observacionConducta: obtenerValor('observacionConducta'),
            estadoAnimo: obtenerSelectText('#estadoAnimo'),
            observacionEstadoAnimo: obtenerValor('observacionEstadoAnimo'),
            afecto: obtenerSelectText('#afecto'),
            observacionAfecto: obtenerValor('observacionAfecto'),
            formaPensamiento: obtenerSelectText('#formaPensamiento'),
            observacionFormaPensamiento: obtenerValor('observacionFormaPensamiento'),
            velocidadPensamiento: obtenerSelectText('#velocidadPensamiento'),
            observacionVelocidadPensamiento: obtenerValor('observacionVelocidadPensamiento'),
            cursoPensamiento: obtenerSelectText('#cursoPensamiento'),
            observacionCursoPensamiento: obtenerValor('observacionCursoPensamiento'),
            contenidoPensamiento: obtenerSelectText('#contenidoPensamiento'),
            observacionContenidoPensamiento: obtenerValor('observacionContenidoPensamiento'),
            alucinaciones: obtenerSelectText('#alucinaciones'),
            observacionAlucinaciones: obtenerValor('observacionAlucinaciones'),
            pseudoalucinaciones: obtenerRadio('pseudoalucinaciones'),
            observacionPseudoalucinaciones: obtenerValor('observacionPseudoalucinaciones'),
            ilusiones: obtenerRadio('ilusiones'),
            observacionIlusiones: obtenerValor('observacionIlusiones'),
            despersonalizacion: obtenerRadio('despersonalizacion'),
            observacionDespersonalizacion: obtenerValor('observacionDespersonalizacion'),
            desrealizacion: obtenerRadio('desrealizacion'),
            observacionDesrealizacion: obtenerValor('observacionDesrealizacion'),
            orientacionTiempo: obtenerRadio('orientacion_tiempo'),
            observacionOrientacionTiempo: obtenerValor('observacionOrientacionTiempo'),
            orientacionEspacio: obtenerRadio('orientacion_espacio'),
            observacionOrientacionEspacio: obtenerValor('observacionOrientacionEspacio'),
            orientacionPersonal: obtenerRadio('orientacion_personal'),
            observacionOrientacionPersonal: obtenerValor('observacionOrientacionPersonal'),
            orientacionSocial: obtenerRadio('orientacion_social'),
            observacionOrientacionSocial: obtenerValor('observacionOrientacionSocial'),
            atencion: obtenerRadio('atencion'),
            observacionAtencion: obtenerValor('observacionAtencion'),
            concentracion: obtenerRadio('concentracion'),
            observacionConcentracion: obtenerValor('observacionConcentracion'),
            memoriaInmediata: obtenerRadio('memoria_inmediata'),
            observacionMemoriaInmediata: obtenerValor('observacionMemoriaInmediata'),
            memoriaReciente: obtenerRadio('memoria_reciente'),
            observacionMemoriaReciente: obtenerValor('observacionMemoriaReciente'),
            memoriaRemota: obtenerRadio('memoria_remota'),
            observacionMemoriaRemota: obtenerValor('observacionMemoriaRemota'),
            iniciativa: obtenerRadio('iniciativa'),
            observacionIniciativa: obtenerValor('observacionIniciativa'),
            perseverancia: obtenerRadio('perseverancia'),
            observacionPerseverancia: obtenerValor('observacionPerseverancia'),
            interes: obtenerRadio('interes'),
            observacionInteres: obtenerValor('observacionInteres'),
            actividadMotora: obtenerRadio('actividad_motora'),
            observacionActividadMotora: obtenerValor('observacionActividadMotora'),
            postura: obtenerRadio('postura'),
            observacionPostura: obtenerValor('observacionPostura'),
            movimientosInvoluntarios: obtenerSelectText('#movimientosInvoluntarios'),
            observacionMovimientos: obtenerValor('observacionMovimientos'),
            juicio: obtenerRadio('juicio'),
            observacionJuicio: obtenerValor('observacionJuicio'),
            tiposJuicio: obtenerCheckboxes('tipos_juicio'),
            observacionTiposJuicio: obtenerValor('observacionTiposJuicio'),
            introspeccion: obtenerRadio('introspeccion'),
            observacionIntrospeccion: obtenerValor('observacionIntrospeccion'),
            
            // Sección 9: Diagnóstico Multiaxial
            codigoCIE10Eje1: obtenerValor('codigoCIE10Eje1'),
            diagnosticoEje1: obtenerValor('diagnosticoEje1'),
            codigoCIE10Eje2: obtenerValor('codigoCIE10Eje2'),
            diagnosticoEje2: obtenerValor('diagnosticoEje2'),
            codigoCIE10Eje3: obtenerValor('codigoCIE10Eje3'),
            diagnosticoEje3: obtenerValor('diagnosticoEje3'),
            codigoCIE10Eje4: obtenerValor('codigoCIE10Eje4'),
            diagnosticoEje4: obtenerValor('diagnosticoEje4'),
            puntajeGAF: obtenerValor('puntajeGAF'),
            escalaGAF: obtenerSelectText('#escalaGAF'),
            diagnosticoEje5: obtenerValor('diagnosticoEje5'),
            
            // Sección 10: Plan de Tratamiento
            planTratamiento: obtenerValor('planTratamiento'),
            tiposTratamiento: obtenerCheckboxes(['psicofarmacos', 'psicoterapia', 'otrosTratamiento']),
            frecuenciaSeguimiento: obtenerCheckboxes(['frecuenciaSemanal', 'frecuenciaQuincenal', 'frecuenciaMensual', 'frecuenciaOtros']),
            evolucion: obtenerValor('evolucion'),
            pronostico: obtenerRadio('pronostico'),
            pronosticoObservacion: obtenerValor('pronosticoObservacion'),
            reevaluacion: obtenerRadio('reevaluacion'),
            reevaluacionObservacion: obtenerValor('reevaluacionObservacion'),
            fechaProximaConsulta: obtenerValor('fechaProximaConsulta'),
            proximaConsultaObservacion: obtenerValor('proximaConsultaObservacion')
        };
        
        // Crear contenido HTML del documento
        let htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>Historia Clínica Psiquiátrica</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: Arial, Calibri, sans-serif; font-size: 8pt; line-height: 1.05; margin: 0; padding: 0; }
        h1 { font-size: 11pt; font-weight: bold; text-align: center; margin: 0 0 3pt 0; color: #000; }
        h2 { font-size: 9.5pt; font-weight: bold; color: #000; margin: 4pt 0 2pt 0; border-bottom: 1pt solid #000; padding-bottom: 1pt; }
        h3 { font-size: 8.5pt; font-weight: bold; color: #000; margin: 3pt 0 1pt 0; }
        p { margin: 1pt 0; line-height: 1.05; }
        .header { text-align: center; margin-bottom: 4pt; padding-bottom: 2pt; border-bottom: 1pt solid #000; }
        .doctor-info { font-size: 7pt; margin-top: 1pt; line-height: 1; }
        .datos-grid { display: table; width: 100%; margin: 2pt 0; }
        .datos-row { display: table-row; }
        .datos-cell { display: table-cell; width: 20%; padding: 0.5pt 1pt; vertical-align: top; font-size: 7pt; }
        .datos-table { width: 100%; border-collapse: collapse; margin: 2pt 0; font-size: 7pt; }
        .dato-cell { padding: 1pt 3pt; border: none; vertical-align: top; width: 33.33%; }
        .campos-table { width: 100%; border-collapse: collapse; margin: 2pt 0; font-size: 7pt; }
        .campo-label { font-weight: bold; padding: 1pt 3pt; width: 30%; vertical-align: top; }
        .campo-valor { padding: 1pt 3pt; vertical-align: top; }
        .field { margin: 1pt 0; }
        .field-inline { display: inline-block; margin-right: 4pt; }
        .label { font-weight: bold; font-size: 7pt; }
        .value { font-size: 7pt; margin-left: 2pt; }
        .text-block { margin: 2pt 0; padding: 2pt; background-color: #f9f9f9; }
        .text-block .label { display: block; font-weight: bold; margin-bottom: 1pt; }
        .text-block .value { display: block; }
        .signature { margin-top: 10pt; text-align: center; page-break-inside: avoid; }
        .signature-line { border-top: 1px solid black; width: 200pt; margin: 8pt auto 3pt; }
        .footer-info { text-align: center; margin-top: 8pt; font-size: 7pt; font-style: italic; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HCPE - Historia Clínica Psiquiátrica</h1>
        <div class="doctor-info">
            <p><strong>Dr. Mauricio Villamandos - Médico Especialista en Psiquiatría - M.P.: 07489</strong></p>
            <p>Santa Ana, Corrientes – Argentina | infopsicodinamyc@gmail.com | Tel: 3765 041832</p>
        </div>
    </div>`;
        
        // Sección 1: DATOS GENERALES
        htmlContent += '<h2>1. DATOS GENERALES</h2>';
        
        // Datos personales en grid de 4 columnas
        const datosPersonales = [];
        if (datos.lugarEvaluacion) datosPersonales.push(agregarCampo('Lugar', datos.lugarEvaluacion));
        if (datos.fechaEvaluacion) datosPersonales.push(agregarCampo('Fecha', datos.fechaEvaluacion));
        if (datos.modalidad) datosPersonales.push(agregarCampo('Modalidad', datos.modalidad));
        if (datos.codigoPaciente) datosPersonales.push(agregarCampo('Código', datos.codigoPaciente));
        if (datos.nombre) datosPersonales.push(agregarCampo('Nombre', datos.nombre));
        if (datos.apellido) datosPersonales.push(agregarCampo('Apellido', datos.apellido));
        if (datos.dni) datosPersonales.push(agregarCampo('DNI', datos.dni));
        if (datos.edad) datosPersonales.push(agregarCampo('Edad', datos.edad));
        if (datos.fechaNacimiento) datosPersonales.push(agregarCampo('F. Nac', datos.fechaNacimiento));
        if (datos.sexo) datosPersonales.push(agregarCampo('Sexo', datos.sexo));
        if (datos.estadoCivil) datosPersonales.push(agregarCampo('E. Civil', datos.estadoCivil));
        if (datos.nacionalidad) datosPersonales.push(agregarCampo('Nacionalidad', datos.nacionalidad));
        if (datos.domicilio) datosPersonales.push(agregarCampo('Domicilio', datos.domicilio));
        if (datos.codigoPostal) datosPersonales.push(agregarCampo('Cód. Postal', datos.codigoPostal));
        if (datos.telefono) datosPersonales.push(agregarCampo('Teléfono', datos.telefono));
        if (datos.email) datosPersonales.push(agregarCampo('Email', datos.email));
        if (datos.ocupacion) datosPersonales.push(agregarCampo('Ocupación', datos.ocupacion));
        if (datos.nivelEducativo) datosPersonales.push(agregarCampo('Educación', datos.nivelEducativo));
        if (datos.obraSocial) datosPersonales.push(agregarCampo('O. Social', datos.obraSocial));
        if (datos.numeroAfiliado) datosPersonales.push(agregarCampo('N° Afiliado', datos.numeroAfiliado));
        if (datos.contactoEmergencia) datosPersonales.push(agregarCampo('Contacto Emerg', datos.contactoEmergencia));
        if (datos.telefonoEmergencia) datosPersonales.push(agregarCampo('Tel Emerg', datos.telefonoEmergencia));
        if (datos.relacionEmergencia) datosPersonales.push(agregarCampo('Relación', datos.relacionEmergencia));
        if (datos.psicologo) datosPersonales.push(agregarCampo('Psicólogo', datos.psicologo));
        
        htmlContent += crearGridDatos(datosPersonales);
        htmlContent += agregarCampo('Observaciones', datos.observacionesGenerales, true);
        
        // Sección 2: MOTIVO DE CONSULTA
        if (datos.motivoConsulta) {
            htmlContent += '<h2>2. MOTIVO DE CONSULTA</h2>';
            htmlContent += agregarCampo('', datos.motivoConsulta, true);
        }
        
        // Sección 3: ANTECEDENTES DE ENFERMEDAD ACTUAL
        if (datos.antecedentesEnfermedad) {
            htmlContent += '<h2>3. ANTECEDENTES DE ENFERMEDAD ACTUAL</h2>';
            htmlContent += agregarCampo('', datos.antecedentesEnfermedad, true);
        }
        
        // Sección 4: ANTECEDENTES PSIQUIÁTRICOS
        const seccion4Campos = [
            agregarCampo('Diagnósticos previos', datos.diagnosticosPrevios, true),
            agregarCampo('Hospitalizaciones', datos.hospitalizacionesSelect === 'Sí' ? datos.hospitalizacionesDetalle : datos.hospitalizacionesSelect, true),
            agregarCampo('Intentos de suicidio', datos.intentosSuicidio === 'Sí' ? `Sí - Número: ${datos.numeroIntentos}, Método: ${datos.metodoSuicidio}, Último: ${datos.ultimoIntento}` : datos.intentosSuicidio),
            agregarCampo('Tratamientos previos', datos.tratamientosPrevios, true),
            agregarCampo('Medicación y esquemas', datos.medicacionEsquemas, true),
            agregarCampo('Otros tratamientos', datos.otrosTratamientos, true)
        ].filter(Boolean).join('');

        if (seccion4Campos) {
            htmlContent += '<h2>4. ANTECEDENTES PSIQUIÁTRICOS</h2>';
            htmlContent += seccion4Campos;
        }
        
        // Sección 5: ANTECEDENTES MÉDICOS
        const seccion5Campos = [
            agregarCampo('Enfermedades', datos.enfermedades === 'Sí' ? datos.enfermedadesAgudas : datos.enfermedades, true),
            agregarCampo('Cirugías', datos.cirugias === 'Sí' ? datos.cirugiasPrevias : datos.cirugias, true),
            agregarCampo('Alergias', datos.alergiasSelect === 'Sí' ? datos.alergias : datos.alergiasSelect, true),
            agregarCampo('Consumo de sustancias', datos.consumoSustancias),
            datos.consumoSustancias === 'Sí' ? agregarCampo('Alcohol', datos.alcoholSelect) : '',
            datos.consumoSustancias === 'Sí' ? agregarCampo('Opioides', datos.opiaceosSelect) : '',
            datos.consumoSustancias === 'Sí' ? agregarCampo('Marihuana', datos.marihuanaSelect) : '',
            datos.consumoSustancias === 'Sí' ? agregarCampo('Cocaína', datos.cocainaSelect) : '',
            datos.consumoSustancias === 'Sí' ? agregarCampo('Sintéticas', datos.sinteticasSelect) : '',
            datos.consumoSustancias === 'Sí' ? agregarCampo('Otras drogas', datos.drogasilicitas, true) : '',
            agregarCampo('Ginecoobstétricos', datos.antecedentesGineco, true)
        ].filter(Boolean).join('');

        if (seccion5Campos) {
            htmlContent += '<h2>5. ANTECEDENTES MÉDICOS</h2>';
            htmlContent += seccion5Campos;
        }
        
        // Sección 6: ANTECEDENTES FAMILIARES
        if (datos.historiaFamiliarPsiquiatrica || datos.historiaSuicidioFamiliar || datos.historiaConsumoFamiliar || datos.parentescoSuicidio || datos.parentescoConsumo) {
            htmlContent += '<h2>6. ANTECEDENTES FAMILIARES</h2>';
            htmlContent += agregarCampo('Historia psiquiátrica', datos.historiaFamiliarPsiquiatrica, true);
            htmlContent += agregarCampo('Historia suicidio', datos.historiaSuicidioFamiliar, true);
            htmlContent += agregarCampo('Parentesco suicidio', datos.parentescoSuicidio);
            htmlContent += agregarCampo('Historia consumo', datos.historiaConsumoFamiliar, true);
            htmlContent += agregarCampo('Parentesco consumo', datos.parentescoConsumo);
        }
        
        // Sección 7: HISTORIA PSICOSOCIAL
        if (datos.dinamicaFamiliar || datos.redApoyo || datos.eventosEstresantes) {
            htmlContent += '<h2>7. HISTORIA PSICOSOCIAL</h2>';
            htmlContent += agregarCampo('Dinámica familiar', datos.dinamicaFamiliar, true);
            htmlContent += agregarCampo('Red de apoyo', datos.redApoyo, true);
            htmlContent += agregarCampo('Eventos estresantes', datos.eventosEstresantes, true);
        }
        
        // Sección 8: EXPLORACIÓN PSICOPATOLÓGICA
        htmlContent += '<h2>8. EXPLORACIÓN PSICOPATOLÓGICA</h2>';
        
        // Apariencia y conducta
        if (datos.higiene || datos.observacionHigiene || datos.actitud || datos.observacionActitud || datos.expresion || datos.observacionExpresion || datos.conducta || datos.observacionConducta || datos.estadoAnimo || datos.observacionEstadoAnimo || datos.afecto || datos.observacionAfecto) {
            htmlContent += '<h3>Apariencia y conducta</h3>';
            const camposApariencia = [
                {label: 'Higiene', valor: combinarValorSelectObservacion(datos.higiene, datos.observacionHigiene)},
                {label: 'Actitud', valor: combinarValorSelectObservacion(datos.actitud, datos.observacionActitud)},
                {label: 'Expresión facial', valor: combinarValorSelectObservacion(datos.expresion, datos.observacionExpresion)},
                {label: 'Conducta', valor: combinarValorSelectObservacion(datos.conducta, datos.observacionConducta)},
                {label: 'Estado de ánimo', valor: combinarValorSelectObservacion(datos.estadoAnimo, datos.observacionEstadoAnimo)},
                {label: 'Afecto', valor: combinarValorSelectObservacion(datos.afecto, datos.observacionAfecto)}
            ];
            htmlContent += crearTablaCampos(camposApariencia);
        }
        
        // Pensamiento
        if (datos.formaPensamiento || datos.observacionFormaPensamiento || datos.velocidadPensamiento || datos.observacionVelocidadPensamiento || datos.cursoPensamiento || datos.observacionCursoPensamiento || datos.contenidoPensamiento || datos.observacionContenidoPensamiento) {
            htmlContent += '<h3>Pensamiento</h3>';
            const camposPensamiento = [
                {label: 'Forma', valor: combinarValorSelectObservacion(datos.formaPensamiento, datos.observacionFormaPensamiento)},
                {label: 'Velocidad', valor: combinarValorSelectObservacion(datos.velocidadPensamiento, datos.observacionVelocidadPensamiento)},
                {label: 'Curso', valor: combinarValorSelectObservacion(datos.cursoPensamiento, datos.observacionCursoPensamiento)},
                {label: 'Contenido', valor: combinarValorSelectObservacion(datos.contenidoPensamiento, datos.observacionContenidoPensamiento)}
            ];
            htmlContent += crearTablaCampos(camposPensamiento);
        }
        
        // Percepciones
        if (datos.alucinaciones || datos.observacionAlucinaciones || datos.pseudoalucinaciones || datos.observacionPseudoalucinaciones || datos.ilusiones || datos.observacionIlusiones || datos.despersonalizacion || datos.observacionDespersonalizacion || datos.desrealizacion || datos.observacionDesrealizacion) {
            htmlContent += '<h3>Percepciones</h3>';
            const camposPercepciones = [
                {label: 'Alucinaciones', valor: combinarValorSelectObservacion(datos.alucinaciones, datos.observacionAlucinaciones)},
                {label: 'Pseudoalucinaciones', valor: combinarValorSelectObservacion(datos.pseudoalucinaciones, datos.observacionPseudoalucinaciones)},
                {label: 'Ilusiones', valor: combinarValorSelectObservacion(datos.ilusiones, datos.observacionIlusiones)},
                {label: 'Despersonalización', valor: combinarValorSelectObservacion(datos.despersonalizacion, datos.observacionDespersonalizacion)},
                {label: 'Desrealización', valor: combinarValorSelectObservacion(datos.desrealizacion, datos.observacionDesrealizacion)}
            ];
            htmlContent += crearTablaCampos(camposPercepciones);
        }
        
        // Orientación
        if (datos.orientacionTiempo || datos.observacionOrientacionTiempo || datos.orientacionEspacio || datos.observacionOrientacionEspacio || datos.orientacionPersonal || datos.observacionOrientacionPersonal || datos.orientacionSocial || datos.observacionOrientacionSocial) {
            htmlContent += '<h3>Orientación</h3>';
            const camposOrientacion = [
                {label: 'Tiempo', valor: combinarValorSelectObservacion(datos.orientacionTiempo, datos.observacionOrientacionTiempo)},
                {label: 'Espacio', valor: combinarValorSelectObservacion(datos.orientacionEspacio, datos.observacionOrientacionEspacio)},
                {label: 'Personal', valor: combinarValorSelectObservacion(datos.orientacionPersonal, datos.observacionOrientacionPersonal)},
                {label: 'Social', valor: combinarValorSelectObservacion(datos.orientacionSocial, datos.observacionOrientacionSocial)}
            ];
            htmlContent += crearTablaCampos(camposOrientacion);
        }
        
        // Atención y concentración
        if (datos.atencion || datos.observacionAtencion || datos.concentracion || datos.observacionConcentracion) {
            htmlContent += '<h3>Atención y concentración</h3>';
            const camposAtencion = [
                {label: 'Atención', valor: combinarValorSelectObservacion(datos.atencion, datos.observacionAtencion)},
                {label: 'Concentración', valor: combinarValorSelectObservacion(datos.concentracion, datos.observacionConcentracion)}
            ];
            htmlContent += crearTablaCampos(camposAtencion);
        }
        
        // Memoria
        if (datos.memoriaInmediata || datos.observacionMemoriaInmediata || datos.memoriaReciente || datos.observacionMemoriaReciente || datos.memoriaRemota || datos.observacionMemoriaRemota) {
            htmlContent += '<h3>Memoria</h3>';
            const camposMemoria = [
                {label: 'Inmediata', valor: combinarValorSelectObservacion(datos.memoriaInmediata, datos.observacionMemoriaInmediata)},
                {label: 'Reciente', valor: combinarValorSelectObservacion(datos.memoriaReciente, datos.observacionMemoriaReciente)},
                {label: 'Remota', valor: combinarValorSelectObservacion(datos.memoriaRemota, datos.observacionMemoriaRemota)}
            ];
            htmlContent += crearTablaCampos(camposMemoria);
        }
        
        // Voluntad
        if (datos.iniciativa || datos.observacionIniciativa || datos.perseverancia || datos.observacionPerseverancia || datos.interes || datos.observacionInteres) {
            htmlContent += '<h3>Voluntad</h3>';
            const camposVoluntad = [
                {label: 'Iniciativa', valor: combinarValorSelectObservacion(datos.iniciativa, datos.observacionIniciativa)},
                {label: 'Perseverancia', valor: combinarValorSelectObservacion(datos.perseverancia, datos.observacionPerseverancia)},
                {label: 'Interés', valor: combinarValorSelectObservacion(datos.interes, datos.observacionInteres)}
            ];
            htmlContent += crearTablaCampos(camposVoluntad);
        }
        
        // Psicomotricidad
        if (datos.actividadMotora || datos.observacionActividadMotora || datos.postura || datos.observacionPostura || datos.movimientosInvoluntarios || datos.observacionMovimientos) {
            htmlContent += '<h3>Psicomotricidad</h3>';
            const camposPsicomotricidad = [
                {label: 'Actividad motora', valor: combinarValorSelectObservacion(datos.actividadMotora, datos.observacionActividadMotora)},
                {label: 'Postura', valor: combinarValorSelectObservacion(datos.postura, datos.observacionPostura)},
                {label: 'Movimientos involuntarios', valor: combinarValorSelectObservacion(datos.movimientosInvoluntarios, datos.observacionMovimientos)}
            ];
            htmlContent += crearTablaCampos(camposPsicomotricidad);
        }
        
        // Juicio e introspección
        if (datos.juicio || datos.observacionJuicio || datos.tiposJuicio || datos.observacionTiposJuicio || datos.introspeccion || datos.observacionIntrospeccion) {
            htmlContent += '<h3>Juicio e introspección</h3>';
            const camposJuicio = [
                {label: 'Juicio', valor: combinarValorSelectObservacion(datos.juicio, datos.observacionJuicio) + (datos.tiposJuicio ? ' (' + datos.tiposJuicio + ')' : '') + (datos.observacionTiposJuicio ? ' - ' + datos.observacionTiposJuicio : '')},
                {label: 'Introspección', valor: combinarValorSelectObservacion(datos.introspeccion, datos.observacionIntrospeccion)}
            ];
            htmlContent += crearTablaCampos(camposJuicio);
        }
        
        // Sección 9: DIAGNÓSTICO MULTIAXIAL
        htmlContent += '<h2>9. DIAGNÓSTICO MULTIAXIAL – CIE-10</h2>';
        if (datos.diagnosticoEje1 || datos.codigoCIE10Eje1) {
            htmlContent += '<h3>Eje I: Trastornos clínicos</h3>';
            const eje1 = [];
            if (datos.diagnosticoEje1) eje1.push(agregarCampo('Dx', datos.diagnosticoEje1));
            if (datos.codigoCIE10Eje1) eje1.push(agregarCampo('CIE-10', datos.codigoCIE10Eje1));
            htmlContent += eje1.join(' ');
        }
        
        if (datos.diagnosticoEje2 || datos.codigoCIE10Eje2) {
            htmlContent += '<h3>Eje II: Discapacidad mental</h3>';
            const eje2 = [];
            if (datos.diagnosticoEje2) eje2.push(agregarCampo('Dx', datos.diagnosticoEje2));
            if (datos.codigoCIE10Eje2) eje2.push(agregarCampo('CIE-10', datos.codigoCIE10Eje2));
            htmlContent += eje2.join(' ');
        }
        
        if (datos.diagnosticoEje3 || datos.codigoCIE10Eje3) {
            htmlContent += '<h3>Eje III: Enfermedades médicas</h3>';
            const eje3 = [];
            if (datos.diagnosticoEje3) eje3.push(agregarCampo('Dx', datos.diagnosticoEje3));
            if (datos.codigoCIE10Eje3) eje3.push(agregarCampo('CIE-10', datos.codigoCIE10Eje3));
            htmlContent += eje3.join(' ');
        }
        
        if (datos.diagnosticoEje4) {
            htmlContent += '<h3>Eje IV: Factores psicosociales</h3>';
            htmlContent += agregarCampo('', datos.diagnosticoEje4, true);
        }
        
        if (datos.diagnosticoEje5) {
            htmlContent += '<h3>Eje V: Funcionamiento global</h3>';
            htmlContent += agregarCampo('Diagnóstico', datos.diagnosticoEje5, true);
            if (datos.puntajeGAF) htmlContent += agregarCampo('Puntaje GAF', datos.puntajeGAF);
            if (datos.escalaGAF) htmlContent += agregarCampo('Escala GAF', datos.escalaGAF);
        }
        
        // Sección 10: PLAN DE TRATAMIENTO
        const seccion10Campos = [
            agregarCampo('Plan de tratamiento', datos.planTratamiento, true),
            agregarCampo('Psicofarmacológico', datos.tiposTratamiento.includes('psicofarmacos') ? 'Sí' : 'No'),
            agregarCampo('Psicoterapia', datos.tiposTratamiento.includes('psicoterapia') ? 'Sí' : 'No'),
            agregarCampo('Otros tratamientos', datos.tiposTratamiento.includes('otrosTratamiento') ? 'Sí' : 'No'),
            agregarCampo('Frecuencia de seguimiento', datos.frecuenciaSeguimiento, true)
        ].filter(Boolean).join('');

        if (seccion10Campos) {
            htmlContent += '<h2>10. PLAN DE TRATAMIENTO</h2>';
            htmlContent += seccion10Campos;
        }
        
        // Sección 11: PRONÓSTICO Y PLAN DE SEGUIMIENTO
        const seccion11Campos = [
            agregarCampo('Pronóstico', datos.pronostico),
            agregarCampo('Observación pronóstico', datos.pronosticoObservacion, true),
            agregarCampo('Reevaluación', datos.reevaluacion),
            agregarCampo('Observación reevaluación', datos.reevaluacionObservacion, true),
            agregarCampo('Fecha próxima consulta', datos.fechaProximaConsulta),
            agregarCampo('Observación próxima consulta', datos.proximaConsultaObservacion, true)
        ].filter(Boolean).join('');

        if (seccion11Campos) {
            htmlContent += '<h2>11. PRONÓSTICO Y PLAN DE SEGUIMIENTO</h2>';
            htmlContent += seccion11Campos;
        }
        
        // Firma y pie de página
        htmlContent += `
        <div class="signature">
            <div class="signature-line"></div>
            <p><strong>Dr. Mauricio Villamandos</strong></p>
            <p>Psiquiatra - M.P.: 07489</p>
        </div>
        
        <div class="footer-info">
            <p>[HCPE] v2.0® © 2025 - Dr. Mauricio Villamandos - Santa Ana, Corrientes - Argentina</p>
        </div>
    </body>
    </html>`;
    
        // Crear blob y descargar
        const blob = new Blob(['\ufeff' + htmlContent], { 
            type: 'application/msword' 
        });
        
        // Crear nombre de archivo
        const nombrePaciente = datos.nombre || 'Paciente';
        const apellidoPaciente = datos.apellido || '';
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Historia_Clinica_${nombrePaciente.replace(/\s+/g, '_')}_${apellidoPaciente.replace(/\s+/g, '_')}_${fecha}.doc`;
        
        // Descargar archivo
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        // Ocultar indicador de carga
        setTimeout(() => {
            ocultarCarga('btnWord', '<i class="fas fa-file-word"></i> Exportar a Word');
            alert('✓ Documento Word generado exitosamente\n\n📄 El archivo se puede editar en:\n• Microsoft Word\n• LibreOffice Writer\n• Google Docs');
        }, 500);
        
    } catch (error) {
        console.error('Error al generar documento Word:', error);
        ocultarCarga('btnWord', '<i class="fas fa-file-word"></i> Exportar a Word');
        alert('❌ Error al generar el documento Word.\n\nVerifique que haya completado al menos algunos campos.');
    }
}

// =====================================================
// IMPRESIÓN DIRECTA
// =====================================================
function imprimir() {
    // Guardar formulario antes de imprimir
    guardarFormulario('pre_impresion');
    
    // Aplicar clase de impresión al body
    document.body.classList.add('printing');
    
    // Esperar un momento para que se apliquen los estilos
    setTimeout(() => {
        window.print();
        
        // Remover clase después de imprimir
        document.body.classList.remove('printing');
    }, 300);
}

// =====================================================
// SISTEMA DE GUARDADO LOCAL (localStorage)
// =====================================================
function guardarFormulario(nombreGuardado = null) {
    try {
        const nombre = nombreGuardado || prompt('Ingrese un nombre para guardar este formulario:', 'Historia_' + new Date().toISOString().split('T')[0]);
        
        if (!nombre) return;
        
        // Recolectar todos los datos del formulario
        const datosFormulario = {
            timestamp: new Date().toISOString(),
            campos: {}
        };
        
        // Obtener todos los inputs, textareas y selects
        const campos = document.querySelectorAll('input, textarea, select');
        campos.forEach(campo => {
            if (campo.id && !campo.classList.contains('no-save')) {
                if (campo.type === 'checkbox') {
                    datosFormulario.campos[campo.id] = campo.checked;
                } else if (campo.type === 'radio') {
                    if (campo.checked) {
                        datosFormulario.campos[campo.name] = campo.value;
                    }
                } else {
                    datosFormulario.campos[campo.id] = campo.value;
                }
            }
        });
        
        // Guardar en localStorage
        localStorage.setItem('hcpe_' + nombre, JSON.stringify(datosFormulario));
        
        if (nombreGuardado !== 'autosave' && nombreGuardado !== 'pre_impresion') {
            alert('✓ Formulario guardado exitosamente como:\n"' + nombre + '"');
        }
        
        console.log('💾 Formulario guardado:', nombre);
        
    } catch (error) {
        console.error('Error al guardar formulario:', error);
        if (nombreGuardado !== 'autosave') {
            alert('❌ Error al guardar el formulario.\n\nVerifique que su navegador permita el almacenamiento local.');
        }
    }
}

function cargarFormulario(nombreGuardado = null) {
    try {
        let nombre = nombreGuardado;
        
        if (!nombre) {
            // Mostrar lista de formularios guardados
            const guardados = obtenerFormulariosGuardados();
            
            if (guardados.length === 0) {
                alert('No hay formularios guardados.');
                return;
            }
            
            let mensaje = 'Formularios guardados:\n\n';
            guardados.forEach((item, index) => {
                mensaje += `${index + 1}. ${item.nombre} (${item.fecha})\n`;
            });
            mensaje += '\nIngrese el nombre del formulario a cargar:';
            
            nombre = prompt(mensaje);
            if (!nombre) return;
            
            // Si ingresó un número, obtener el nombre correspondiente
            const numero = parseInt(nombre);
            if (!isNaN(numero) && numero > 0 && numero <= guardados.length) {
                nombre = guardados[numero - 1].nombre;
            }
        }
        
        // Cargar datos
        const key = nombre.startsWith('hcpe_') ? nombre : 'hcpe_' + nombre;
        const datos = localStorage.getItem(key);
        
        if (!datos) {
            alert('No se encontró el formulario "' + nombre + '"');
            return;
        }
        
        const datosFormulario = JSON.parse(datos);
        
        // Confirmar carga
        if (nombreGuardado !== 'autosave') {
            const confirmar = confirm(`¿Desea cargar el formulario "${nombre}"?\n\nGuardado el: ${new Date(datosFormulario.timestamp).toLocaleString()}\n\nEsto reemplazará los datos actuales.`);
            if (!confirmar) return;
        }
        
        // Cargar valores en los campos
        Object.keys(datosFormulario.campos).forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                const valor = datosFormulario.campos[id];
                
                if (campo.type === 'checkbox') {
                    campo.checked = valor;
                } else if (campo.type === 'radio') {
                    if (campo.value === valor) {
                        campo.checked = true;
                    }
                } else {
                    campo.value = valor;
                }
            }
        });
        
        if (nombreGuardado !== 'autosave') {
            alert('✓ Formulario cargado exitosamente');
        }
        
        console.log('📂 Formulario cargado:', nombre);
        
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        alert('❌ Error al cargar el formulario.');
    }
}

function obtenerFormulariosGuardados() {
    const guardados = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hcpe_')) {
            try {
                const datos = JSON.parse(localStorage.getItem(key));
                const nombre = key.replace('hcpe_', '');
                const fecha = new Date(datos.timestamp).toLocaleString();
                
                guardados.push({ nombre, fecha, key });
            } catch (error) {
                console.error('Error al leer formulario guardado:', key);
            }
        }
    }
    
    return guardados.sort((a, b) => b.nombre.localeCompare(a.nombre));
}

function autoGuardar() {
    // Solo auto-guardar si hay algún campo con contenido
    const campos = document.querySelectorAll('input, textarea, select');
    let hayContenido = false;
    
    for (let campo of campos) {
        if (campo.value && campo.value.trim() !== '') {
            hayContenido = true;
            break;
        }
    }
    
    if (hayContenido) {
        guardarFormulario('autosave');
        console.log('💾 Auto-guardado realizado');
    }
}

function nuevoFormulario() {
    const confirmar = confirm('¿Desea crear un nuevo formulario?\n\nSe perderán los datos actuales si no los ha guardado.\n\n¿Desea continuar?');
    
    if (confirmar) {
        // Limpiar todos los campos
        const campos = document.querySelectorAll('input, textarea, select');
        campos.forEach(campo => {
            if (campo.type === 'checkbox' || campo.type === 'radio') {
                campo.checked = false;
            } else if (campo.type !== 'button' && campo.type !== 'submit') {
                campo.value = '';
            }
        });
        
        // Establecer fecha actual
        const inputFecha = document.querySelector('input[type="date"]');
        if (inputFecha) {
            inputFecha.value = new Date().toISOString().split('T')[0];
        }
        
        console.log('📄 Nuevo formulario creado');
        alert('✓ Nuevo formulario creado');
    }
}

function eliminarFormulario() {
    const guardados = obtenerFormulariosGuardados();
    
    if (guardados.length === 0) {
        alert('No hay formularios guardados para eliminar.');
        return;
    }
    
    let mensaje = 'Formularios guardados:\n\n';
    guardados.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre} (${item.fecha})\n`;
    });
    mensaje += '\nIngrese el número o nombre del formulario a eliminar:';
    
    const entrada = prompt(mensaje);
    if (!entrada) return;
    
    let nombre = entrada;
    const numero = parseInt(entrada);
    if (!isNaN(numero) && numero > 0 && numero <= guardados.length) {
        nombre = guardados[numero - 1].nombre;
    }
    
    const key = nombre.startsWith('hcpe_') ? nombre : 'hcpe_' + nombre;
    
    if (localStorage.getItem(key)) {
        const confirmar = confirm(`¿Está seguro de eliminar el formulario "${nombre}"?\n\nEsta acción no se puede deshacer.`);
        
        if (confirmar) {
            localStorage.removeItem(key);
            alert('✓ Formulario eliminado exitosamente');
            console.log('🗑️ Formulario eliminado:', nombre);
        }
    } else {
        alert('No se encontró el formulario especificado.');
    }
}

// =====================================================
// VALIDACIÓN DE FORMULARIO
// =====================================================
function validarCamposObligatorios() {
    const camposObligatorios = [
        { id: 'nombre', label: 'Nombre del paciente' },
        { id: 'apellido', label: 'Apellido del paciente' },
        { id: 'dni', label: 'DNI' },
        { id: 'edad', label: 'Edad' }
    ];
    
    const camposFaltantes = [];
    
    camposObligatorios.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento && !elemento.value.trim()) {
            camposFaltantes.push(campo.label);
            elemento.style.borderColor = '#dc3545';
            elemento.style.borderWidth = '2px';
        } else if (elemento) {
            elemento.style.borderColor = '';
            elemento.style.borderWidth = '';
        }
    });
    
    if (camposFaltantes.length > 0) {
        alert('⚠️ Campos obligatorios faltantes:\n\n• ' + camposFaltantes.join('\n• '));
        return false;
    }
    
    return true;
}

// =====================================================
// UTILIDADES
// =====================================================
function mostrarCarga(botonId, textoCarga = 'Generando...') {
    const boton = document.getElementById(botonId);
    if (boton) {
        boton.disabled = true;
        boton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${textoCarga}`;
    }
}

function ocultarCarga(botonId, textoOriginal) {
    const boton = document.getElementById(botonId);
    if (boton) {
        boton.disabled = false;
        boton.innerHTML = textoOriginal;
    }
}

function asignarIDsBotones() {
    // Asignar IDs a los botones si no los tienen
    const botonesNav = document.querySelectorAll('.navbar button, .navbar a.btn');
    botonesNav.forEach(boton => {
        const texto = boton.textContent || boton.innerText;
        
        if (texto.includes('Imprimir') && !boton.id) {
            boton.id = 'btnImprimir';
            boton.onclick = imprimir;
        } else if (texto.includes('PDF') && !boton.id) {
            boton.id = 'btnPDF';
            boton.onclick = exportarAPDF;
        } else if (texto.includes('Word') && !boton.id) {
            boton.id = 'btnWord';
            boton.onclick = exportarAWord;
        } else if (texto.includes('Guardar') && !boton.id) {
            boton.id = 'btnGuardar';
            boton.onclick = () => guardarFormulario();
        } else if (texto.includes('Cargar') && !boton.id) {
            boton.id = 'btnCargar';
            boton.onclick = () => cargarFormulario();
        } else if (texto.includes('Nuevo') && !boton.id) {
            boton.id = 'btnNuevo';
            boton.onclick = nuevoFormulario;
        }
    });
    
    console.log('✓ IDs asignados a botones de navegación');
}

// =====================================================
// ATAJOS DE TECLADO
// =====================================================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S: Guardar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        guardarFormulario();
    }
    
    // Ctrl/Cmd + P: Imprimir
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        imprimir();
    }
    
    // Ctrl/Cmd + O: Cargar
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        cargarFormulario();
    }
    
    // Ctrl/Cmd + N: Nuevo
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        nuevoFormulario();
    }
});

// =====================================================
// ALERTA AL SALIR SIN GUARDAR
// =====================================================
window.addEventListener('beforeunload', function(e) {
    // Verificar si hay contenido sin guardar
    const campos = document.querySelectorAll('input, textarea, select');
    let hayContenido = false;
    
    for (let campo of campos) {
        if (campo.value && campo.value.trim() !== '') {
            hayContenido = true;
            break;
        }
    }
    
    if (hayContenido) {
        // Auto-guardar antes de salir
        guardarFormulario('autosave');
        
        // Algunos navegadores muestran un mensaje de confirmación
        e.preventDefault();
        e.returnValue = '¿Está seguro de salir? Los cambios se han guardado automáticamente.';
        return e.returnValue;
    }
});

console.log('✅ Sistema HCPE completamente inicializado');
console.log('📌 Atajos de teclado disponibles:');
console.log('   • Ctrl/Cmd + S: Guardar');
console.log('   • Ctrl/Cmd + P: Imprimir');
console.log('   • Ctrl/Cmd + O: Cargar');
console.log('   • Ctrl/Cmd + N: Nuevo');
