#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la santé de l\'application Orientation Pro Congo...\n');

// Vérification des fichiers essentiels
const essentialFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/router/AppRouter.tsx',
  'src/components/layout/ProfessionalHeader.tsx',
  'src/components/home/HeroSection.tsx',
  'src/pages/Index.tsx',
  'src/lib/supabase.ts',
  'src/hooks/useSupabase.ts',
  'src/components/auth/AuthProvider.tsx',
  'src/components/auth/LoginForm.tsx',
  'src/components/auth/RegisterForm.tsx',
  'src/components/auth/ProtectedRoute.tsx',
  'package.json',
  'vite.config.ts',
  'tailwind.config.ts',
  '.env'
];

console.log('📁 Vérification des fichiers essentiels:');
let missingFiles = 0;

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    missingFiles++;
  }
});

// Vérification des composants UI
const uiComponents = [
  'src/components/ui/button.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/sonner.tsx'
];

console.log('\n🎨 Vérification des composants UI:');
uiComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - MANQUANT`);
    missingFiles++;
  }
});

// Vérification des Edge Functions
const edgeFunctions = [
  'supabase/functions/test-analysis',
  'supabase/functions/appointment-reminder',
  'supabase/functions/cv-optimizer',
  'supabase/functions/email-notifications'
];

console.log('\n⚡ Vérification des Edge Functions:');
edgeFunctions.forEach(func => {
  if (fs.existsSync(func)) {
    console.log(`✅ ${func}`);
  } else {
    console.log(`❌ ${func} - MANQUANT`);
    missingFiles++;
  }
});

// Vérification des hooks personnalisés
const customHooks = [
  'src/hooks/useAuth.tsx',
  'src/hooks/useSupabase.ts',
  'src/hooks/useTestState.ts',
  'src/hooks/useAppointments.ts'
];

console.log('\n🔗 Vérification des hooks personnalisés:');
customHooks.forEach(hook => {
  if (fs.existsSync(hook)) {
    console.log(`✅ ${hook}`);
  } else {
    console.log(`❌ ${hook} - MANQUANT`);
    missingFiles++;
  }
});

// Vérification des pages principales
const mainPages = [
  'src/pages/Index.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Tests.tsx',
  'src/pages/RiasecTest.tsx'
];

console.log('\n📄 Vérification des pages principales:');
mainPages.forEach(page => {
  if (fs.existsSync(page)) {
    console.log(`✅ ${page}`);
  } else {
    console.log(`❌ ${page} - MANQUANT`);
    missingFiles++;
  }
});

// Vérification de la configuration
console.log('\n⚙️ Vérification de la configuration:');
const configFiles = [
  'vite.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  'package.json',
  '.env'
];

configFiles.forEach(config => {
  if (fs.existsSync(config)) {
    console.log(`✅ ${config}`);
  } else {
    console.log(`❌ ${config} - MANQUANT`);
    missingFiles++;
  }
});

// Résumé
console.log('\n📊 RÉSUMÉ:');
if (missingFiles === 0) {
  console.log('🎉 Tous les fichiers essentiels sont présents !');
  console.log('✅ L\'application semble prête pour le développement.');
} else {
  console.log(`⚠️  ${missingFiles} fichier(s) manquant(s).`);
  console.log('🔧 Veuillez créer les fichiers manquants avant de continuer.');
}

// Vérification du package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Informations du package.json:');
  console.log(`   Nom: ${packageJson.name}`);
  console.log(`   Version: ${packageJson.version}`);
  console.log(`   Scripts disponibles: ${Object.keys(packageJson.scripts).join(', ')}`);
  
  // Vérification des dépendances importantes
  const importantDeps = ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'framer-motion'];
  console.log('\n🔧 Dépendances importantes:');
  importantDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MANQUANTE`);
    }
  });
} catch (error) {
  console.log('❌ Erreur lors de la lecture du package.json');
}

console.log('\n🚀 Application prête pour le développement !');
console.log('   Accédez à http://localhost:8045 pour voir l\'application.'); 