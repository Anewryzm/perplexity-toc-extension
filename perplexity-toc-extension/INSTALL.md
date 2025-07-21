# 🚀 Guía de Instalación - Perplexity TOC Extension

**Autor:** Enrique Cardoza  
**Versión:** 1.0.0

## ⚡ Instalación Rápida

### 1. Preparar los Iconos (Obligatorio)

Antes de instalar, necesitas crear 3 archivos PNG en la carpeta `icons/`:

```
icons/
├── icon16.png   (16x16 píxeles)
├── icon48.png   (48x48 píxeles)  
└── icon128.png  (128x128 píxeles)
```

**Opciones rápidas para crear iconos:**
- **Online**: [favicon.io](https://favicon.io/), [canva.com](https://canva.com)
- **Software**: GIMP, Photoshop, Figma
- **Color sugerido**: #1d717c (azul verdoso de Perplexity)
- **Diseño**: Líneas horizontales simulando una lista/índice

### 2. Instalar en Chrome

1. **Abrir extensiones:**
   ```
   chrome://extensions
   ```

2. **Activar modo desarrollador:**
   - Toggle en la esquina superior derecha

3. **Cargar extensión:**
   - "Cargar extensión sin empaquetar"
   - Seleccionar carpeta `perplexity-toc-extension`

4. **Verificar instalación:**
   - Debe aparecer "Perplexity TOC - Table of Contents"
   - Sin errores en rojo

## ✅ Verificar Funcionamiento

### Prueba Básica:
1. Ve a [perplexity.ai](https://www.perplexity.ai)
2. Haz una búsqueda
3. El sidebar debe aparecer a la derecha
4. Haz clic en los enlaces del índice
5. Verifica la navegación suave

## 🛠️ Validación Automática

Ejecuta el script de validación:

```bash
cd perplexity-toc-extension
node scripts/validate.js
```

O simplemente:
```bash
npm run validate
```

## 📋 Checklist Pre-Instalación

- [ ] Todos los archivos principales presentes
- [ ] Los 3 iconos PNG creados
- [ ] `manifest.json` válido
- [ ] Chrome en modo desarrollador
- [ ] Carpeta de extensión lista

## 🐛 Solución de Problemas

### "Error al cargar extensión"
- ✅ Verificar que `manifest.json` existe y es válido
- ✅ Todos los archivos referenciados están presentes
- ✅ Iconos PNG en carpeta `icons/`

### "Sidebar no aparece"
- ✅ Navegar a una URL de búsqueda: `/search/...`
- ✅ Revisar consola (F12) por errores
- ✅ Recargar la página
- ✅ Verificar que la extensión está habilitada

### "Enlaces no funcionan"  
- ✅ Verificar que hay contenido en la página
- ✅ Esperar a que cargue completamente
- ✅ Revisar DevTools por errores JavaScript

## 🔧 Desarrollo y Debug

### Recargar después de cambios:
1. Modificar `content.js` o `styles.css`
2. Ir a `chrome://extensions`
3. Clic en ⟲ (recargar) en la extensión
4. Refrescar página de Perplexity

### Ver logs:
1. `chrome://extensions` > Detalles de la extensión
2. "Inspeccionar vistas" (si disponible)
3. O usar DevTools en la página (F12)

## 📱 Compatibilidad

- ✅ **Chrome**: Versión 88+
- ✅ **Edge**: Versión 88+ (basado en Chromium)
- ✅ **Brave**: Versión reciente
- ❌ **Firefox**: No compatible (usa Manifest V3)
- ❌ **Safari**: No compatible

## 🎯 Solo funciona en:

- `https://www.perplexity.ai/search/*`
- Páginas con conversaciones generadas
- Contenido con elementos `.group\/query`, `h1`, `h2`

## 📞 Soporte

Si tienes problemas:
1. Ejecutar `npm run validate`
2. Revisar consola de DevTools
3. Verificar que estás en la URL correcta
4. Crear issue en el repositorio

---

**✨ ¡Disfruta de una navegación mejorada en Perplexity!**

*Desarrollado por Enrique Cardoza*