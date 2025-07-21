# Perplexity TOC - Table of Contents Extension

**Autor:** Enrique Cardoza  
**Versión:** 1.0.0

## 📝 Descripción

Extensión de Chrome que agrega una **tabla de contenidos interactiva** en las páginas de búsqueda de Perplexity.ai. Facilita la navegación por conversaciones largas y mejora la experiencia de usuario al proporcionar un índice visual y funcional del contenido.

## ✨ Características

- ✅ **Generación automática** de tabla de contenidos
- ✅ **Resaltado dinámico** de la sección actual mientras navegas
- ✅ **Navegación suave** con scroll animado
- ✅ **Actualización en tiempo real** cuando se agrega nuevo contenido
- ✅ **Activación inteligente** solo en páginas de búsqueda (/search/)
- ✅ **Diseño responsive** que se adapta al contenido
- ✅ **Soporte para modo oscuro**
- ✅ **IDs deterministas** para navegación consistente
- ✅ **Intersection Observer** para tracking eficiente del scroll

## 🎯 Funcionalidad

### Elementos detectados:
- **Prompts del usuario** (`.group\/query`)
- **Títulos de respuesta** (`h1` en contenido markdown)  
- **Subtítulos de respuesta** (`h2` en contenido markdown)

### Características técnicas:
- **MutationObserver** con debounce para detectar cambios
- **Intersection Observer** para tracking de scroll
- **Navegación por clicks** con feedback visual
- **Limpieza automática** de recursos al cambiar de página

## 🚀 Instalación

### Método 1: Carga como extensión sin empaquetar (desarrollo)

1. **Descargar** o clonar este repositorio:
   ```bash
   git clone [url-del-repositorio]
   cd perplexity-toc-extension
   ```

2. **Abrir Chrome** y navegar a `chrome://extensions`

3. **Activar** el "Modo desarrollador" (toggle en la esquina superior derecha)

4. **Hacer clic** en "Cargar extensión sin empaquetar"

5. **Seleccionar** la carpeta `perplexity-toc-extension`

6. **¡Listo!** La extensión estará instalada y activa

### Método 2: Instalar desde archivo .crx (cuando esté disponible)

1. Descargar el archivo `.crx` de la release
2. Arrastrar el archivo a `chrome://extensions`
3. Confirmar la instalación

## 📖 Uso

1. **Navegar** a [perplexity.ai](https://www.perplexity.ai)
2. **Realizar** una búsqueda que genere una conversación
3. **La tabla de contenidos aparecerá automáticamente** en el lado derecho
4. **Hacer clic** en cualquier elemento del índice para navegar
5. **El elemento activo se resalta** mientras navegas por la página

## 📁 Estructura del Proyecto

```
perplexity-toc-extension/
├── manifest.json          # Configuración de la extensión
├── content.js             # Script principal con lógica del TOC
├── styles.css             # Estilos del sidebar
├── icons/                 # Iconos de la extensión
│   ├── icon16.png        # 16x16px para toolbar
│   ├── icon48.png        # 48x48px para extensions page
│   ├── icon128.png       # 128x128px para web store
│   └── README.md         # Guía para crear iconos
└── README.md             # Este archivo
```

## 🛠️ Desarrollo

### Tecnologías utilizadas:
- **Manifest V3** (Chrome Extensions)
- **Vanilla JavaScript** (ES6+)
- **CSS3** con variables personalizadas
- **Chrome APIs**: Content Scripts, Host Permissions

### APIs y técnicas:
- `MutationObserver` - Detección de cambios en DOM
- `IntersectionObserver` - Tracking eficiente de scroll  
- `querySelector/querySelectorAll` - Selección de elementos
- CSS Custom Properties - Temas y variables
- Event delegation - Manejo eficiente de eventos

### Para contribuir:

1. **Fork** el repositorio
2. **Crear** una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Abrir** un Pull Request

## 🐛 Resolución de Problemas

### El sidebar no aparece:
- ✅ Verificar que estás en una página de búsqueda (`/search/...`)
- ✅ Verificar que hay contenido en la página
- ✅ Revisar la consola de DevTools por errores
- ✅ Recargar la página

### El sidebar no se actualiza:
- ✅ Esperar unos segundos (hay un debounce de 100ms)
- ✅ Verificar que el contenido nuevo coincide con los selectores
- ✅ Recargar la extensión en `chrome://extensions`

### Problemas de navegación:
- ✅ Verificar que los elementos tienen IDs correctos
- ✅ Comprobar que no hay conflictos con otras extensiones
- ✅ Limpiar caché del navegador

## 🔒 Privacidad y Permisos

Esta extensión:
- ✅ **NO requiere permisos especiales** más allá del acceso a perplexity.ai
- ✅ **NO recopila datos** personales
- ✅ **NO envía información** a servidores externos
- ✅ **Solo funciona** en páginas de Perplexity.ai
- ✅ **Todo el procesamiento es local** en tu navegador

### Permisos solicitados:
- `host_permissions: ["https://www.perplexity.ai/*"]` - Solo para acceso a Perplexity

## 📊 Rendimiento

- ⚡ **Lightweight**: < 10KB total
- ⚡ **Efficient**: Usa Intersection Observer para tracking
- ⚡ **Debounced**: Evita procesamiento excesivo (100ms debounce)
- ⚡ **Clean**: Limpia recursos al cambiar de página
- ⚡ **Optimized**: Solo se activa cuando es necesario

## 🎨 Personalización

Puedes modificar `styles.css` para cambiar:
- **Colores** del sidebar y enlaces
- **Posición** y tamaño del sidebar  
- **Fuentes** y tipografía
- **Animaciones** y transiciones
- **Soporte para modo oscuro**

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Implementación inicial
- ✅ Generación automática de TOC
- ✅ Navegación por clicks
- ✅ Tracking de scroll con Intersection Observer
- ✅ Soporte responsive
- ✅ Modo oscuro
- ✅ IDs deterministas

## 🤝 Créditos

**Desarrollado por:** Enrique Cardoza

**Inspirado en:** La necesidad de mejor navegación en conversaciones largas de Perplexity.ai

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🌟 ¿Te gusta el proyecto?

Si encuentras útil esta extensión:
- ⭐ Dale una estrella al repositorio
- 🐛 Reporta bugs o sugiere mejoras
- 💡 Contribuye con nuevas funcionalidades
- 📢 Compártelo con otros usuarios de Perplexity

---

**¡Disfruta navegando por tus conversaciones de Perplexity de manera más eficiente!** 🚀