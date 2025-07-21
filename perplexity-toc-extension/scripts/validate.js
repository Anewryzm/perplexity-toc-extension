#!/usr/bin/env node

/**
 * Script de validación para la extensión Perplexity TOC
 * Autor: Enrique Cardoza
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando estructura de la extensión...\n');

// Archivos requeridos
const requiredFiles = [
    'manifest.json',
    'content.js', 
    'styles.css',
    'README.md'
];

// Archivos de iconos requeridos
const requiredIcons = [
    'icons/icon16.png',
    'icons/icon48.png', 
    'icons/icon128.png'
];

let hasErrors = false;

// Validar archivos principales
console.log('📁 Verificando archivos principales:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - FALTA`);
        hasErrors = true;
    }
});

console.log('\n🎨 Verificando iconos:');
requiredIcons.forEach(icon => {
    if (fs.existsSync(icon)) {
        console.log(`  ✅ ${icon}`);
    } else {
        console.log(`  ⚠️ ${icon} - FALTA (necesario para publicación)`);
    }
});

// Validar manifest.json
console.log('\n📋 Validando manifest.json:');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    // Validaciones básicas
    const requiredFields = ['manifest_version', 'name', 'version', 'description'];
    requiredFields.forEach(field => {
        if (manifest[field]) {
            console.log(`  ✅ ${field}: ${manifest[field]}`);
        } else {
            console.log(`  ❌ ${field} - FALTA`);
            hasErrors = true;
        }
    });
    
    // Validar manifest version
    if (manifest.manifest_version === 3) {
        console.log('  ✅ Manifest V3 ✓');
    } else {
        console.log('  ⚠️ Se recomienda Manifest V3');
    }
    
    // Validar content scripts
    if (manifest.content_scripts && manifest.content_scripts.length > 0) {
        console.log('  ✅ Content scripts configurados');
    } else {
        console.log('  ❌ Content scripts no configurados');
        hasErrors = true;
    }
    
} catch (error) {
    console.log('  ❌ Error al leer manifest.json:', error.message);
    hasErrors = true;
}

// Validar tamaños de archivos
console.log('\n📏 Verificando tamaños de archivos:');
const fileSizes = {};
['content.js', 'styles.css'].forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(2);
        fileSizes[file] = sizeKB;
        console.log(`  📊 ${file}: ${sizeKB} KB`);
    }
});

// Verificar sintaxis JavaScript básica
console.log('\n🔧 Verificando sintaxis JavaScript:');
try {
    const contentJs = fs.readFileSync('content.js', 'utf8');
    
    // Verificaciones básicas
    const checks = [
        { name: 'Funciones principales', pattern: /function\s+(createSidebarShell|updateSidebarContent|handlePageUpdate)/ },
        { name: 'MutationObserver', pattern: /MutationObserver/ },
        { name: 'IntersectionObserver', pattern: /IntersectionObserver/ },
        { name: 'addEventListener', pattern: /addEventListener/ },
        { name: 'querySelector', pattern: /querySelector/ }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(contentJs)) {
            console.log(`  ✅ ${check.name}`);
        } else {
            console.log(`  ⚠️ ${check.name} - No encontrado`);
        }
    });
    
} catch (error) {
    console.log('  ❌ Error al leer content.js:', error.message);
    hasErrors = true;
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ VALIDACIÓN FALLIDA - Hay errores que corregir');
    process.exit(1);
} else {
    console.log('✅ VALIDACIÓN EXITOSA - La extensión está lista');
    
    const totalSize = Object.values(fileSizes).reduce((sum, size) => sum + parseFloat(size), 0);
    console.log(`📦 Tamaño total: ${totalSize.toFixed(2)} KB`);
    
    if (fs.existsSync('icons/icon16.png') && fs.existsSync('icons/icon48.png') && fs.existsSync('icons/icon128.png')) {
        console.log('🎉 ¡Lista para instalar en Chrome!');
    } else {
        console.log('⚠️  Recuerda crear los iconos PNG antes de publicar');
    }
}

console.log('\n👤 Desarrollado por: Enrique Cardoza');
console.log('🔗 Para instalar: chrome://extensions > Cargar extensión sin empaquetar');
console.log('');