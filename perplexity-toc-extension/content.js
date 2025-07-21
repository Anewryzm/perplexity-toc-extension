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

/**
 * Función que crea el "esqueleto" del sidebar una sola vez por página.
 */
function createSidebarShell() {
    if (document.getElementById('perplexity-index-sidebar')) return;

    const sidebar = document.createElement('aside');
    sidebar.id = 'perplexity-index-sidebar';
    
    const sidebarInner = document.createElement('div');
    sidebarInner.className = 'perplexity-toc-inner';
    
    const sidebarTitle = document.createElement('h3');
    sidebarTitle.className = 'perplexity-toc-title';
    sidebarTitle.textContent = 'Índice del Hilo';
    
    sidebarListElement = document.createElement('ul');
    sidebarListElement.className = 'perplexity-toc-list';

    sidebarListElement.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const element = document.getElementById(targetId);

        if (element) {
            isClickNavigating = true;
            document.querySelectorAll('#perplexity-index-sidebar a').forEach(l => l.classList.remove('toc-active-link'));
            link.classList.add('toc-active-link');
            element.scrollIntoView({ behavior: 'smooth' });
            clearTimeout(clickNavTimer);
            clickNavTimer = setTimeout(() => { isClickNavigating = false; }, 1000);
        }
    });

    sidebarInner.appendChild(sidebarTitle);
    sidebarInner.appendChild(sidebarListElement);
    sidebar.appendChild(sidebarInner);
    document.body.appendChild(sidebar);
}

/**
 * Actualiza el CONTENIDO del sidebar, garantizando la vinculación correcta de los IDs.
 */
function updateSidebarContent() {
    if (!sidebarListElement) return;

    // Desconectar observer anterior si existe
    if (intersectionObserver) intersectionObserver.disconnect();
    
    // Limpiar contenido actual
    sidebarListElement.innerHTML = '';

    // Buscar todos los elementos de conversación
    const conversationElements = document.querySelectorAll(
        '.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2'
    );
    
    lastItemCount = conversationElements.length;

    // Recorremos los elementos del hilo usando un bucle con índice.
    conversationElements.forEach((element, index) => {
        // *** LA CLAVE DE LA SOLUCIÓN: ID DETERMINISTA ***
        // Generamos un ID único y predecible basado en la posición del elemento en el hilo.
        // Se lo asignamos al elemento del contenido en cada actualización para garantizar que esté presente.
        const uniqueId = `pp-toc-item-${index}`;
        element.id = uniqueId;

        // Determinamos el tipo de elemento para el estilo y el texto.
        const isPrompt = element.matches('.group\\/query');
        const type = isPrompt ? 'prompt' : (element.tagName === 'H2' ? 'response-subtitle' : 'response-title');
        let textContent = element.textContent.trim();

        if (isPrompt && textContent.length > 16) {
            textContent = textContent.substring(0, 16) + "...";
        }

        // Creamos el elemento del índice (<li> y <a>).
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // El 'href' apunta al ID único que acabamos de asignar. La sincronización es perfecta.
        a.href = '#' + uniqueId;
        a.textContent = textContent;
        a.className = 'perplexity-toc-link';
        
        // Aplicar clases específicas según el tipo
        if (type === 'prompt') {
            a.classList.add('perplexity-toc-prompt');
            li.classList.add('perplexity-toc-prompt-item');
        } else if (type === 'response-subtitle') {
            li.classList.add('perplexity-toc-subtitle');
        }
        
        li.appendChild(a);
        sidebarListElement.appendChild(li);
    });

    // Configurar el Intersection Observer para tracking de scroll
    setupIntersectionObserver(conversationElements);
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
 * Maneja las actualizaciones de página y decide si mostrar/ocultar el sidebar
 */
function handlePageUpdate() {
    const currentUrl = window.location.href;
    const currentItemCount = document.querySelectorAll(
        '.group\\/query, div[id^="markdown-content"] h1, div[id^="markdown-content"] h2'
    ).length;

    // Evitar procesamiento innecesario si no hay cambios
    if (currentUrl === lastProcessedUrl && currentItemCount === lastItemCount) {
        return;
    }

    lastProcessedUrl = currentUrl;
    const currentPath = window.location.pathname;
    
    // Determinar si debe mostrar el sidebar
    // Solo en páginas de búsqueda con contenido
    const shouldShowSidebar = currentPath.startsWith('/search/') && currentPath.length > 8;

    if (shouldShowSidebar) {
        createSidebarShell();
        updateSidebarContent();
    } else {
        removeSidebarIfExists();
        lastItemCount = 0;
        sidebarListElement = null;
    }
}

/**
 * Remueve el sidebar y limpia recursos
 */
function removeSidebarIfExists() {
    const existingSidebar = document.getElementById('perplexity-index-sidebar');
    if (existingSidebar) {
        existingSidebar.remove();
    }
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
}

// --- MECANISMO DE ACTIVACIÓN ---
// Usar debounce para evitar procesamiento excesivo
let debounceTimer;
const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handlePageUpdate, 100);
});

// Observar cambios en el DOM
observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    attributes: false 
});

// Ejecutar inmediatamente al cargar
handlePageUpdate();

// Manejar navegación SPA (Single Page Application)
window.addEventListener('popstate', handlePageUpdate);
window.addEventListener('pushstate', handlePageUpdate);
window.addEventListener('replacestate', handlePageUpdate);