// Perplexity TOC Extension - Content Script
// Author: Enrique Cardoza
// Version: 1.0.0

// --- PASO 1: DECLARACIÓN DE ESTADO Y VARIABLES GLOBALES ---

let lastProcessedUrl = '';
let lastItemCount = 0;
let intersectionObserver;
let isClickNavigating = false;
let clickNavTimer;
let sidebarListElement = null;
let contentObserver = null;
let isSidebarCollapsed = false; // Nueva variable para estado del sidebar

// Configuración de debug
const DEBUG_MODE = false; // Cambiar a false en producción
const MAX_ID_RETRIES = 3;

// --- FUNCIONES DE DIAGNÓSTICO Y VALIDACIÓN ---

/**
 * Función de debug para inspeccionar el estado del TOC
 */
function debugTOC() {
    if (!DEBUG_MODE) return;
    
    console.group('🔍 TOC Debug Info');
    
    const conversationElements = document.querySelectorAll(
        '.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2'
    );
    
    const links = document.querySelectorAll('#perplexity-index-sidebar a');
    
    console.log('📊 Total elements found:', conversationElements.length);
    console.log('🔗 Total links created:', links.length);
    console.log('📍 Current URL:', window.location.href);
    
    // Verificar integridad ID por ID
    let brokenLinks = 0;
    conversationElements.forEach((element, index) => {
        const expectedId = `pp-toc-item-${index}`;
        const actualId = element.id;
        
        if (expectedId !== actualId) {
            console.error(`❌ ID mismatch at index ${index}: expected "${expectedId}", got "${actualId}"`);
        } else if (DEBUG_MODE) {
            console.log(`✅ ID correct at index ${index}: "${actualId}"`);
        }
        
        // Verificar si existe el enlace correspondiente
        const correspondingLink = document.querySelector(`#perplexity-index-sidebar a[href="#${actualId}"]`);
        if (!correspondingLink) {
            console.error(`❌ No link found for element with ID: ${actualId}`);
            brokenLinks++;
        }
    });
    
    // Verificar enlaces rotos
    links.forEach((link, index) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            console.error(`❌ Broken link found at index ${index}: target "${targetId}" not found`);
            brokenLinks++;
        }
    });
    
    if (brokenLinks > 0) {
        console.warn(`⚠️ Found ${brokenLinks} integrity issues in TOC`);
    } else {
        console.log('✅ TOC integrity verified - all links working');
    }
    
    console.groupEnd();
}

/**
 * Asigna ID con sistema de reintentos
 */
function assignIdWithRetry(element, uniqueId, maxRetries = MAX_ID_RETRIES) {
    let retries = 0;
    
    while (retries < maxRetries) {
        element.id = uniqueId;
        
        // Verificar que el ID se asignó correctamente
        if (element.id === uniqueId) {
            if (DEBUG_MODE && retries > 0) {
                console.log(`✅ ID assigned successfully on retry ${retries}: ${uniqueId}`);
            }
            return true;
        }
        
        retries++;
        if (DEBUG_MODE) {
            console.warn(`⚠️ Retry ${retries}/${maxRetries} for ID assignment: ${uniqueId}`);
        }
        
        // Pequeña pausa entre reintentos
        if (retries < maxRetries) {
            // Forzar un reflow para asegurar que el DOM esté actualizado
            element.offsetHeight;
        }
    }
    
    console.error(`❌ Failed to assign ID "${uniqueId}" after ${maxRetries} attempts`);
    return false;
}

/**
 * Verifica la integridad del TOC después de la creación
 */
function verifyTOCIntegrity() {
    const links = document.querySelectorAll('#perplexity-index-sidebar a');
    let brokenLinks = 0;
    let fixedLinks = 0;
    
    links.forEach(link => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            console.warn(`⚠️ Broken link found: ${targetId}`);
            link.classList.add('toc-broken-link');
            link.style.opacity = '0.5';
            // link.style.textDecoration = 'line-through';
            brokenLinks++;
        } else {
            link.classList.remove('toc-broken-link');
            link.style.opacity = '';
            link.style.textDecoration = '';
            fixedLinks++;
        }
    });
    
    if (DEBUG_MODE) {
        if (brokenLinks > 0) {
            console.warn(`⚠️ Integrity check: ${brokenLinks} broken links, ${fixedLinks} working links`);
        } else {
            console.log(`✅ Integrity check passed: all ${fixedLinks} links working`);
        }
    }
    
    return brokenLinks === 0;
}

/**
 * Busca elemento por contenido de texto como fallback
 */
function findElementByText(searchText) {
    const elements = document.querySelectorAll(
        '.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2'
    );
    
    for (let element of elements) {
        let elementText = element.textContent.trim();
        
        // Para prompts, truncar igual que en el TOC
        if (element.matches('.group\\/query') && elementText.length > 24) {
            elementText = elementText.substring(0, 24) + "...";
        }
        
        if (elementText === searchText) {
            return element;
        }
    }
    
    return null;
}

/**
 * Función que crea el "esqueleto" del sidebar una sola vez por página.
 */
function createSidebarShell() {
    if (document.getElementById('perplexity-index-sidebar')) return;

    // Agregar estilos de debug dinámicamente si está habilitado
    const styleSheetId = 'perplexity-toc-debug-styles';
    if (DEBUG_MODE && !document.getElementById(styleSheetId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleSheetId;
        styleSheet.innerText = `
            /* Debug: highlighting para elementos con IDs TOC */
            [id^="pp-toc-item-"]:before {
                content: "TOC:" attr(id);
                position: absolute;
                top: -20px;
                left: 0;
                font-size: 10px;
                background: #fbbf24;
                color: #000;
                padding: 2px 4px;
                border-radius: 2px;
                z-index: 1000;
                opacity: 0.7;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    const sidebar = document.createElement('aside');
    sidebar.id = 'perplexity-index-sidebar';
    
    // Crear botón flotante (inicialmente oculto)
    const floatingBtn = document.createElement('button');
    floatingBtn.className = 'perplexity-toc-floating-btn';
    floatingBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    floatingBtn.title = 'Mostrar índice';
    floatingBtn.addEventListener('click', toggleSidebar);
    
    const sidebarInner = document.createElement('div');
    sidebarInner.className = 'perplexity-toc-inner';
    
    // Header con título y botón toggle
    const sidebarHeader = document.createElement('div');
    sidebarHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;';
    
    const sidebarTitle = document.createElement('h3');
    sidebarTitle.className = 'perplexity-toc-title';
    sidebarTitle.textContent = 'Índice del Hilo';
    sidebarTitle.style.marginBottom = '0';
    sidebarTitle.style.paddingBottom = '0';
    sidebarTitle.style.borderBottom = 'none';
    
    // Botón toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'perplexity-toc-toggle';
    toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    toggleBtn.title = 'Ocultar índice';
    toggleBtn.addEventListener('click', toggleSidebar);
    
    // Separador
    const separator = document.createElement('div');
    separator.style.cssText = 'border-bottom: 1px solid #d0d2d5; margin-bottom: 15px;';
    
    sidebarHeader.appendChild(sidebarTitle);
    sidebarHeader.appendChild(toggleBtn);
    
    sidebarListElement = document.createElement('ul');
    sidebarListElement.className = 'perplexity-toc-list';

    sidebarListElement.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        let element = document.getElementById(targetId);

        if (element) {
            if (DEBUG_MODE) {
                console.log(`🎯 Navigating to element with ID: ${targetId}`);
            }
            
            isClickNavigating = true;
            document.querySelectorAll('#perplexity-index-sidebar a').forEach(l => l.classList.remove('toc-active-link'));
            link.classList.add('toc-active-link');
            element.scrollIntoView({ behavior: 'smooth' });
            clearTimeout(clickNavTimer);
            clickNavTimer = setTimeout(() => { isClickNavigating = false; }, 1000);
        } else {
            // FALLBACK: Intentar encontrar el elemento por texto
            console.warn(`⚠️ Element with ID "${targetId}" not found, trying fallback...`);
            
            const fallbackElement = findElementByText(link.textContent);
            if (fallbackElement) {
                console.log(`✅ Fallback successful, found element by text: "${link.textContent}"`);
                
                // Asignar el ID correcto al elemento encontrado
                fallbackElement.id = targetId;
                
                isClickNavigating = true;
                document.querySelectorAll('#perplexity-index-sidebar a').forEach(l => l.classList.remove('toc-active-link'));
                link.classList.add('toc-active-link');
                fallbackElement.scrollIntoView({ behavior: 'smooth' });
                clearTimeout(clickNavTimer);
                clickNavTimer = setTimeout(() => { isClickNavigating = false; }, 1000);
            } else {
                console.error(`❌ Cannot navigate to: ${targetId}. Element not found even with fallback.`);
                
                // Marcar el enlace como roto
                link.classList.add('toc-broken-link');
                link.style.opacity = '0.5';
                
                // Intentar regenerar el TOC
                setTimeout(() => {
                    console.log('🔄 Attempting to regenerate TOC due to navigation failure...');
                    updateSidebarContent();
                }, 100);
            }
        }
    });

    sidebarInner.appendChild(sidebarHeader);
    sidebarInner.appendChild(separator);
    sidebarInner.appendChild(sidebarListElement);
    sidebar.appendChild(sidebarInner);
    sidebar.appendChild(floatingBtn);
    document.body.appendChild(sidebar);
    
    // Restaurar estado colapsado si estaba guardado
    const savedState = localStorage.getItem('perplexity-toc-collapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        isSidebarCollapsed = true;
    }
}

/**
 * Función para alternar el estado del sidebar
 */
function toggleSidebar() {
    const sidebar = document.getElementById('perplexity-index-sidebar');
    if (!sidebar) return;
    
    isSidebarCollapsed = !isSidebarCollapsed;
    
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        localStorage.setItem('perplexity-toc-collapsed', 'true');
        
        if (DEBUG_MODE) {
            console.log('📌 Sidebar collapsed');
        }
    } else {
        sidebar.classList.remove('collapsed');
        localStorage.setItem('perplexity-toc-collapsed', 'false');
        
        if (DEBUG_MODE) {
            console.log('📌 Sidebar expanded');
        }
    }
}

/**
 * Actualiza el CONTENIDO del sidebar, garantizando la vinculación correcta de los IDs.
 */
function updateSidebarContent() {
    if (!sidebarListElement) {
        console.error('❌ Sidebar list element not found');
        return;
    }

    if (DEBUG_MODE) {
        console.log('🔄 Starting sidebar content update...');
    }

    // Desconectar observer anterior si existe
    if (intersectionObserver) intersectionObserver.disconnect();
    
    // Limpiar contenido actual
    sidebarListElement.innerHTML = '';

    // Buscar todos los elementos de conversación con filtrado mejorado
    const allElements = document.querySelectorAll(
        '.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2'
    );
    
    // Filtrar elementos válidos
    const conversationElements = Array.from(allElements).filter(element => {
        // Verificar que el elemento sea visible y tenga contenido
        return element.offsetParent !== null && // Elemento visible
               element.textContent.trim().length > 0 && // Tiene contenido
               !element.closest('[style*="display: none"]'); // No está en contenedor oculto
    });
    
    if (DEBUG_MODE) {
        console.log(`📊 Found ${allElements.length} total elements, ${conversationElements.length} valid elements`);
    }
    
    lastItemCount = conversationElements.length;

    if (conversationElements.length === 0) {
        console.warn('⚠️ No valid conversation elements found');
        return;
    }

    let successfulBindings = 0;
    let failedBindings = 0;

    // Recorremos los elementos del hilo usando un bucle con índice.
    conversationElements.forEach((element, index) => {
        // *** ASIGNACIÓN DE ID CON VALIDACIÓN ***
        const uniqueId = `pp-toc-item-${index}`;
        
        // Verificar si ya tiene un ID válido
        if (element.id && element.id.startsWith('pp-toc-item-')) {
            if (DEBUG_MODE) {
                console.log(`🔄 Element already has valid ID: ${element.id}, keeping it`);
            }
            // Mantener el ID existente si es válido, pero asegurar consistencia
            if (element.id !== uniqueId) {
                // Solo reasignar si es necesario para mantener orden
                if (!assignIdWithRetry(element, uniqueId)) {
                    console.error(`❌ Failed to reassign ID for consistency: ${uniqueId}`);
                    failedBindings++;
                    return; // Saltar este elemento si no se puede asignar ID
                }
            }
        } else {
            // Asignar nuevo ID con reintentos
            if (!assignIdWithRetry(element, uniqueId)) {
                console.error(`❌ Skipping element at index ${index} due to ID assignment failure`);
                failedBindings++;
                return; // Saltar este elemento si no se puede asignar ID
            }
        }

        // VALIDACIÓN POST-ASIGNACIÓN
        const verificationElement = document.getElementById(uniqueId);
        if (!verificationElement) {
            console.error(`❌ Post-assignment verification failed for ID: ${uniqueId}`);
            failedBindings++;
            return;
        }

        if (verificationElement !== element) {
            console.error(`❌ ID conflict detected: ${uniqueId} points to different element`);
            failedBindings++;
            return;
        }

        // Determinamos el tipo de elemento para el estilo y el texto.
        const isPrompt = element.matches('.group\\/query');
        const type = isPrompt ? 'prompt' : (element.tagName === 'H2' ? 'response-subtitle' : 'response-title');
        let textContent = element.textContent.trim();

        if (isPrompt && textContent.length > 24) {
            textContent = textContent.substring(0, 24) + "...";
        }

        // Validar que tenemos contenido para mostrar
        if (!textContent) {
            console.warn(`⚠️ Empty text content for element with ID: ${uniqueId}`);
            textContent = `[Empty ${type}]`;
        }

        // Creamos el elemento del índice (<li> y <a>).
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // El 'href' apunta al ID único que acabamos de asignar. La sincronización es perfecta.
        a.href = '#' + uniqueId;
        a.textContent = textContent;
        a.className = 'perplexity-toc-link';
        
        // Agregar atributo data para debugging
        if (DEBUG_MODE) {
            a.setAttribute('data-target-id', uniqueId);
            a.setAttribute('data-element-type', type);
        }
        
        // Aplicar clases específicas según el tipo
        if (type === 'prompt') {
            a.classList.add('perplexity-toc-prompt');
            li.classList.add('perplexity-toc-prompt-item');
        } else if (type === 'response-subtitle') {
            li.classList.add('perplexity-toc-subtitle');
        }
        
        li.appendChild(a);
        sidebarListElement.appendChild(li);
        
        successfulBindings++;
        
        if (DEBUG_MODE) {
            console.log(`✅ Successfully bound element ${index}: "${textContent}" -> #${uniqueId}`);
        }
    });

    // Configurar el Intersection Observer para tracking de scroll
    setupIntersectionObserver(conversationElements);
    
    // Verificar integridad después de la creación
    setTimeout(() => {
        const integrityPassed = verifyTOCIntegrity();
        
        if (DEBUG_MODE) {
            console.log(`📋 TOC Update Summary:`);
            console.log(`  - Successful bindings: ${successfulBindings}`);
            console.log(`  - Failed bindings: ${failedBindings}`);
            console.log(`  - Integrity check: ${integrityPassed ? 'PASSED' : 'FAILED'}`);
            
            // Ejecutar debug detallado
            debugTOC();
        }
        
        // Si hay problemas de integridad, intentar una regeneración
        if (!integrityPassed && failedBindings === 0) {
            console.warn('⚠️ Integrity issues detected despite successful bindings, scheduling retry...');
            setTimeout(() => updateSidebarContent(), 500);
        }
    }, 100);
}

/**
 * Configura el Intersection Observer para detectar qué sección está visible
 */
function setupIntersectionObserver(elementsToWatch) {
    const options = { 
        root: null, 
        rootMargin: '-20% 0px -80% 0px', 
        threshold: 0 
    };
    
    intersectionObserver = new IntersectionObserver((entries) => {
        // No actualizar durante navegación por click
        if (isClickNavigating) return;
        
        entries.forEach(entry => {
            const link = document.querySelector(
                `#perplexity-index-sidebar a[href="#${entry.target.id}"]`
            );
            
            if (link && entry.isIntersecting) {
                // Remover clase activa de todos los enlaces
                document.querySelectorAll('#perplexity-index-sidebar a').forEach(l => 
                    l.classList.remove('toc-active-link')
                );
                
                // Agregar clase activa al enlace de la sección visible
                link.classList.add('toc-active-link');
                
                // Hacer scroll suave del enlace en el sidebar si es necesario
                link.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        });
    }, options);
    
    // Observar todos los elementos
    elementsToWatch.forEach(el => intersectionObserver.observe(el));
}

/**
 * Configura observer para elementos dinámicos
 */
function setupContentObserver() {
    // Limpiar observer anterior si existe
    if (contentObserver) {
        contentObserver.disconnect();
    }
    
    contentObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        let elementsRemoved = false;
        
        mutations.forEach(mutation => {
            // Detectar elementos removidos con IDs TOC
            mutation.removedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.id && node.id.startsWith('pp-toc-item-')) {
                        if (DEBUG_MODE) {
                            console.log(`🗑️ Element with TOC ID removed: ${node.id}`);
                        }
                        elementsRemoved = true;
                        shouldUpdate = true;
                    }
                    
                    // Buscar elementos con IDs TOC dentro del nodo removido
                    const tocElements = node.querySelectorAll ? node.querySelectorAll('[id^="pp-toc-item-"]') : [];
                    if (tocElements.length > 0) {
                        if (DEBUG_MODE) {
                            console.log(`🗑️ ${tocElements.length} TOC elements removed within parent node`);
                        }
                        elementsRemoved = true;
                        shouldUpdate = true;
                    }
                }
            });
            
            // Detectar nuevos elementos de conversación añadidos
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const isConversationElement = node.matches && node.matches('.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2');
                    const containsConversationElements = node.querySelectorAll ? node.querySelectorAll('.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2').length > 0 : false;
                    
                    if (isConversationElement || containsConversationElements) {
                        if (DEBUG_MODE) {
                            console.log('➕ New conversation elements detected');
                        }
                        shouldUpdate = true;
                    }
                }
            });
        });
        
        if (shouldUpdate) {
            if (DEBUG_MODE) {
                console.log(`🔄 Content change detected, scheduling TOC update (elements removed: ${elementsRemoved})`);
            }
            
            // Debounce para evitar actualizaciones excesivas
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (elementsRemoved) {
                    // Si se removieron elementos, hacer una regeneración completa
                    console.log('🔄 Performing full TOC regeneration due to element removal');
                    handlePageUpdate();
                } else {
                    // Solo actualizar contenido
                    updateSidebarContent();
                }
            }, 200);
        }
    });
    
    // Observar cambios en el contenido principal
    const mainContent = document.querySelector('main') || document.body;
    contentObserver.observe(mainContent, {
        childList: true,
        subtree: true,
        attributes: false
    });
    
    if (DEBUG_MODE) {
        console.log('👁️ Content observer setup complete');
    }
}

/**
 * Maneja las actualizaciones de página y decide si mostrar/ocultar el sidebar
 */
function handlePageUpdate() {
    const currentUrl = window.location.href;
    const currentItemCount = document.querySelectorAll(
        '.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2'
    ).length;

    if (DEBUG_MODE) {
        console.log(`🔄 Page update check - URL: ${currentUrl}, Items: ${currentItemCount}`);
    }

    // Evitar procesamiento innecesario si no hay cambios
    if (currentUrl === lastProcessedUrl && currentItemCount === lastItemCount) {
        if (DEBUG_MODE) {
            console.log('⏭️ No changes detected, skipping update');
        }
        return;
    }

    lastProcessedUrl = currentUrl;
    const currentPath = window.location.pathname;
    
    // Determinar si debe mostrar el sidebar
    // Solo en páginas de búsqueda con contenido
    const shouldShowSidebar = currentPath.startsWith('/search/') && currentPath.length > 8 && currentItemCount > 0;

    if (DEBUG_MODE) {
        console.log(`📍 Path: ${currentPath}, Should show sidebar: ${shouldShowSidebar}`);
    }

    if (shouldShowSidebar) {
        try {
            createSidebarShell();
            updateSidebarContent();
            setupContentObserver();
            
            if (DEBUG_MODE) {
                console.log('✅ Sidebar successfully created and configured');
            }
        } catch (error) {
            console.error('❌ Error during sidebar setup:', error);
        }
    } else {
        removeSidebarIfExists();
        lastItemCount = 0;
        sidebarListElement = null;
        
        if (DEBUG_MODE) {
            console.log('🗑️ Sidebar removed - not needed for current page');
        }
    }
}

/**
 * Remueve el sidebar y limpia recursos
 */
function removeSidebarIfExists() {
    if (DEBUG_MODE) {
        console.log('🧹 Cleaning up TOC resources...');
    }
    
    const existingSidebar = document.getElementById('perplexity-index-sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
        if (DEBUG_MODE) {
            console.log('🗑️ Sidebar element removed');
        }
    }
    
    if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
        if (DEBUG_MODE) {
            console.log('👁️ Intersection observer disconnected');
        }
    }
    
    if (contentObserver) {
        contentObserver.disconnect();
        contentObserver = null;
        if (DEBUG_MODE) {
            console.log('👁️ Content observer disconnected');
        }
    }
    
    // Limpiar elementos con IDs TOC si es necesario (cleanup preventivo)
    const tocElements = document.querySelectorAll('[id^="pp-toc-item-"]');
    if (tocElements.length > 0 && DEBUG_MODE) {
        console.log(`🧹 Found ${tocElements.length} elements with TOC IDs remaining`);
        // No los removemos aquí porque podrían ser necesarios para otras funcionalidades
    }
    
    if (DEBUG_MODE) {
        console.log('✅ TOC cleanup completed');
    }
}

// --- MECANISMO DE ACTIVACIÓN ---

let debounceTimer;

// Observer principal para cambios generales en la página
const mainObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handlePageUpdate, 100);
});

/**
 * Inicializar el sistema TOC
 */
function initializeTOC() {
    if (DEBUG_MODE) {
        console.log('🚀 Initializing Perplexity TOC Extension...');
    }
    
    // Observar cambios generales en el DOM
    mainObserver.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: false 
    });
    
    // Ejecutar inmediatamente al cargar
    handlePageUpdate();
    
    // Manejar navegación SPA (Single Page Application)
    window.addEventListener('popstate', () => {
        if (DEBUG_MODE) {
            console.log('🔄 Navigation detected (popstate)');
        }
        handlePageUpdate();
    });
    
    window.addEventListener('pushstate', () => {
        if (DEBUG_MODE) {
            console.log('🔄 Navigation detected (pushstate)');
        }
        handlePageUpdate();
    });
    
    window.addEventListener('replacestate', () => {
        if (DEBUG_MODE) {
            console.log('🔄 Navigation detected (replacestate)');
        }
        handlePageUpdate();
    });
    
    // Cleanup al descargar la página
    window.addEventListener('beforeunload', () => {
        if (DEBUG_MODE) {
            console.log('🔄 Page unloading, cleaning up TOC...');
        }
        removeSidebarIfExists();
        mainObserver.disconnect();
    });
    
    if (DEBUG_MODE) {
        console.log('✅ TOC Extension initialized successfully');
        
        // Agregar función de debug global para debugging manual
        window.debugPerplexityTOC = () => {
            console.log('🔧 Manual TOC Debug triggered');
            debugTOC();
            verifyTOCIntegrity();
        };
        
        window.regeneratePerplexityTOC = () => {
            console.log('🔄 Manual TOC regeneration triggered');
            updateSidebarContent();
        };
        
        console.log('🔧 Debug functions available:');
        console.log('  - window.debugPerplexityTOC() - Run diagnostic');
        console.log('  - window.regeneratePerplexityTOC() - Force regeneration');
    }
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTOC);
} else {
    initializeTOC();
}