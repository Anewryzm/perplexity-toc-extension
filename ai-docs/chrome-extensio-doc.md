# Guía Completa para Crear una Extensión de Chrome

Una extensión de Chrome es un programa pequeño que personaliza y mejora la experiencia de navegación. Están construidas usando tecnologías web estándar como **HTML**, **CSS** y **JavaScript**, lo que las hace accesibles para cualquier desarrollador web[1][2].

## Requisitos Previos

Para desarrollar extensiones de Chrome necesitas conocimientos básicos de:
- **HTML, CSS y JavaScript**: tecnologías fundamentales del desarrollo web[1]
- **Editor de código**: Visual Studio Code es altamente recomendado[3]
- **Navegador Google Chrome**: para testing y desarrollo[2]
- **Node.js y npm** (opcional): si planeas usar TypeScript o herramientas de construcción[4][5]

## Estructura Básica del Proyecto

Para una extensión que modifica páginas agregando un sidebar, necesitarás esta estructura de archivos:

```
mi-extension/
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── styles.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Archivo Manifest.json

El **manifest.json** es el corazón de cualquier extensión de Chrome. Define las capacidades, permisos y configuración de tu extensión[6][7][8]:

```json
{
  "manifest_version": 3,
  "name": "Mi Sidebar Extension",
  "version": "1.0",
  "description": "Agrega un sidebar personalizado a las páginas web",
  
  "permissions": ["activeTab", "storage"],
  
  "content_scripts": [
    {
      "matches": [""],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    }
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### Campos Importantes del Manifest

- **manifest_version**: Usa siempre la versión 3 (la más actual)[6][9]
- **name**: Nombre de tu extensión (máximo 45 caracteres)[10]
- **version**: Versión actual de la extensión[11]
- **permissions**: Permisos necesarios para el funcionamiento[11]
- **content_scripts**: Scripts que se ejecutan en páginas web[9][12]
- **action**: Configuración del popup y icono de la extensión[6]

## Content Scripts para Sidebar

Los **content scripts** son archivos JavaScript que se ejecutan en el contexto de las páginas web, permitiendo interactuar con el DOM[13][12]. Para crear un sidebar:

**content.js**:
```javascript
// Verificar si el sidebar ya existe
if (!document.getElementById('mi-sidebar')) {
  // Crear el elemento sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'mi-sidebar';
  sidebar.innerHTML = `
    
      Mi Sidebar
      &times;
    
    
      Contenido personalizado aquí
      
        Sección 1
        Sección 2
      
    
  `;
  
  // Agregar el sidebar al body
  document.body.appendChild(sidebar);
  
  // Funcionalidad para cerrar
  document.getElementById('close-sidebar').addEventListener('click', () => {
    sidebar.style.display = 'none';
  });
  
  // Ajustar el contenido principal
  document.body.style.marginLeft = '300px';
}
```

**styles.css**:
```css
#mi-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: #f5f5f5;
  border-right: 2px solid #ddd;
  z-index: 10000;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.sidebar-header {
  background: #333;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-content {
  padding: 20px;
}

#close-sidebar {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

body {
  transition: margin-left 0.3s ease;
}
```

## Popup de la Extensión

**popup.html**:
```html



  
    body {
      width: 200px;
      padding: 15px;
    }
    
    button {
      width: 100%;
      padding: 10px;
      margin: 5px 0;
      border: none;
      background: #4285f4;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background: #3367d6;
    }
  


  Sidebar Control
  Mostrar/Ocultar Sidebar
  


```

**popup.js**:
```javascript
document.getElementById('toggle-sidebar').addEventListener('click', () => {
  // Inyectar script para toggle del sidebar
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: toggleSidebar
    });
  });
});

function toggleSidebar() {
  const sidebar = document.getElementById('mi-sidebar');
  if (sidebar) {
    if (sidebar.style.display === 'none') {
      sidebar.style.display = 'block';
      document.body.style.marginLeft = '300px';
    } else {
      sidebar.style.display = 'none';
      document.body.style.marginLeft = '0';
    }
  }
}
```

## Configuración con TypeScript (Avanzado)

Para proyectos más robustos, puedes usar **TypeScript**[4][5][14]:

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "es6", 
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "typeRoots": ["node_modules/@types"]
  },
  "include": ["src/**/*"]
}
```

**Dependencias**:
```bash
npm install --save-dev typescript webpack webpack-cli ts-loader copy-webpack-plugin @types/chrome
```

## Carga y Testing de la Extensión

### Cargar Extensión No Empaquetada

1. Abre Chrome y ve a `chrome://extensions`[6][15]
2. Activa el **Modo desarrollador** en la esquina superior derecha[16][17]
3. Haz clic en **"Cargar extensión descomprimida"**[18][19]
4. Selecciona la carpeta que contiene tu `manifest.json`[6]

### Debugging y Herramientas de Desarrollo

Para debuggear tu extensión[17][20]:

- **Errores del manifest**: aparecen en la página de extensiones
- **Content scripts**: usa DevTools de la página web (F12)
- **Popup**: clic derecho en el icono → "Inspeccionar popup"
- **Service worker**: clic en "service worker" en la página de extensiones

### Debugging en VS Code

Puedes configurar VS Code para debuggear extensiones[21]:

**launch.json**:
```json
{
  "type": "chrome",
  "request": "launch", 
  "name": "Debug Extension",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}"
}
```

## Publicación en Chrome Web Store

### Preparación para Publicación

1. **Crea iconos** en múltiples tamaños: 16x16, 48x48, 128x128 píxeles[22][19]
2. **Comprime tu extensión** en un archivo ZIP[18][22]
3. **Prepara capturas de pantalla** y descripciones[22]

### Proceso de Publicación

1. Ve al **Chrome Developer Dashboard**[19]
2. Paga la tarifa única de registro ($5 USD)[22]
3. Sube tu archivo ZIP[19]
4. Completa la información del store listing[19]
5. Configura políticas de privacidad[19]
6. Envía para revisión[19]

El proceso de revisión puede tomar hasta 30 días, aunque típicamente es más rápido[22].

## Service Workers (Opcional)

Para funcionalidades en segundo plano, puedes agregar un **service worker**[23][24]:

**manifest.json**:
```json
{
  "background": {
    "service_worker": "background.js"
  }
}
```

**background.js**:
```javascript
// Evento cuando se instala la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensión instalada');
});

// Manejar clics en el icono de acción
chrome.action.onClicked.addListener((tab) => {
  // Ejecutar script en la pestaña activa
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: toggleSidebar
  });
});
```

## Mejores Prácticas

### Seguridad
- Solicita solo los **permisos mínimos necesarios**[11]
- Valida todas las entradas del usuario[14]
- Usa **Content Security Policy (CSP)**[25]

### Performance
- Minimiza el impacto en el rendimiento de las páginas[26]
- Usa **event listeners** eficientes[12]
- Evita código bloqueante en content scripts[13]

### UX/UI
- Mantén el diseño **consistente** con Chrome[27]
- Proporciona feedback visual para acciones del usuario[28]
- Haz la extensión **accesible** y responsive[29]

### Mantenimiento
- Usa **versionado semántico** (1.0.0, 1.1.0, etc.)[10]
- Documenta tu código adecuadamente[14]
- Implementa **testing automatizado** cuando sea posible[30]

## Herramientas de Desarrollo Útiles

Extensiones recomendadas para desarrolladores[29][31]:
- **Chrome DevTools**: herramientas nativas de debugging[32]
- **Web Developer**: herramientas adicionales para desarrollo web[33]
- **ColorZilla**: selector de colores[31] 
- **Wappalyzer**: identificar tecnologías web[31]
- **React Developer Tools**: si usas React[29]

## Recursos Adicionales

- **Documentación oficial**: [developer.chrome.com/docs/extensions][27]
- **Ejemplos en GitHub**: repositorios con código de ejemplo[3][34]
- **Chrome Web Store**: para explorar extensiones existentes[35][36]
- **Comunidades**: foros y grupos de desarrolladores[21]

Con esta guía completa, tienes todo lo necesario para crear, desarrollar, testear y publicar tu extensión de Chrome que agrega un sidebar a las páginas web. Recuerda empezar con una funcionalidad simple y expandir gradualmente las características según tus necesidades.

[1] https://faztweb.com/contenido/crea-tu-primer-extension-de-google-chrome
[2] https://kinsta.com/es/blog/crear-extension-chrome/
[3] https://dev.to/voodu/chrome-extension-101-environment-setup-4536
[4] https://www.youtube.com/watch?v=GGi7Brsf7js
[5] https://betterprogramming.pub/creating-chrome-extensions-with-typescript-914873467b65
[6] https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world
[7] https://dev.to/kjdowns/chrome-extensions-manifest-file-47he
[8] https://developer.chrome.com/docs/extensions/reference/manifest
[9] https://dev.to/azadshukor/simplest-chrome-extension-tutorial-for-2024-using-manifest-v3-h3m
[10] https://betterprogramming.pub/the-ultimate-guide-to-building-a-chrome-extension-4c01834c63ec?gi=77357f660a39
[11] https://dev.to/scriptjsh/a-guide-to-chrome-extension-configuration-manifestjson-file-15kn
[12] https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
[13] https://www.dre.vanderbilt.edu/~schmidt/android/android-4.0/external/chromium/chrome/common/extensions/docs/content_scripts.html
[14] https://dev.to/cendekia/crafting-a-chrome-extension-typescript-webpack-and-best-practices-3g9c
[15] https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=es-419
[16] https://code.tutsplus.com/developing-google-chrome-extensions--net-33076t
[17] https://www.youtube.com/watch?v=Ta-YTDhiBIQ
[18] https://neilpatel.com/es/blog/como-crear-una-extension-de-chrome/
[19] https://developer.chrome.com/docs/webstore/publish
[20] https://developer.chrome.com/docs/extensions/get-started/tutorial/debug
[21] https://www.reddit.com/r/webdev/comments/1isc40x/debugging_chrome_extensions_in_vscode_what_is_the/
[22] https://www.youtube.com/watch?v=Y4thMnSlnZo
[23] https://www.youtube.com/watch?v=CmU_xwwYLDc
[24] https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics
[25] https://developer.chrome.com/docs/extensions/mv2/manifest
[26] https://deriv.com/ar/derivtech/feed/about-chrome-extension-service-workers
[27] https://developer.chrome.com/docs/extensions/get-started
[28] https://daily.dev/es/blog/writing-extensions-for-chrome-a-developers-guide
[29] https://clickup.com/es-ES/blog/51703/mejores-extensiones-de-cromo-para-desarrolladores/
[30] https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing
[31] https://www.youtube.com/watch?v=fbfBflajYXM
[32] https://developer.chrome.com/docs/devtools
[33] https://developers.google.com/search/blog/2010/05/chrome-extensions-for-web-development
[34] https://github.com/chibat/chrome-extension-typescript-starter
[35] https://chromewebstore.google.com/category/extensions
[36] https://chromewebstore.google.com
[37] https://www.youtube.com/watch?v=26CBwMaCFA0
[38] https://www.youtube.com/watch?v=V8Zvmbu310g
[39] https://www.youtube.com/watch?v=Gx3VCX43I7Q
[40] https://www.youtube.com/watch?v=0n809nd4Zu4
[41] https://www.youtube.com/watch?v=D-PDksr4n1Q
[42] https://www.youtube.com/watch?v=6H-duTo-gYs
[43] https://chromium.googlesource.com/chromium/src/+/lkgr/content/browser/service_worker/README.md
[44] https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
[45] https://www.youtube.com/watch?v=O4zaF-QHVb0
[46] https://chromewebstore.google.com/detail/service-worker-detector/ofdigdofloanabjcaijfidkogmejlmjc
[47] https://www.youtube.com/watch?v=ezhJezGX5ak
[48] https://codimite.ai/blog/service-workers-in-chrome-extensions-mv3-powering-background-functionality/
[49] https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts
[50] https://chromewebstore.google.com/detail/typescript-editor/amljndfnogpalkfjcfohnepgnhfcpamk?page=1
[51] https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
[52] https://support.convert.com/hc/en-us/articles/204506699-chrome-debugger-extension-for-convert-experiences
[53] https://support.google.com/chrome/a/answer/2714278
[54] https://chromewebstore.google.com/detail/testing-playground/hejbmebodbijjdhflfknehhcgaklhano
[55] https://developer.chrome.com/docs/webstore
[56] https://www.shopify.com/es/blog/mejores-extensiones-chrome
[57] https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna
[58] https://support.google.com/chrome_webstore/answer/2664769
[59] https://support.google.com/campaignmanager/answer/2828688