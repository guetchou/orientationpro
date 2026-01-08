#!/bin/bash

# Script pour supprimer les footers des pages
echo "Suppression des footers des pages..."

# Liste des fichiers à traiter
files=(
    "src/pages/Actualites.tsx"
    "src/pages/Appointment.tsx"
    "src/pages/BlogPost.tsx"
    "src/pages/Blog.tsx"
    "src/pages/Conseillers.tsx"
    "src/pages/Contact.tsx"
    "src/pages/CounselorProfile.tsx"
    "src/pages/DataProtection.tsx"
    "src/pages/GuideEtudesCongo2024.tsx"
    "src/pages/Impressum.tsx"
    "src/pages/OrientationGuide.tsx"
    "src/pages/OrientationServices.tsx"
    "src/pages/Payment.tsx"
    "src/pages/Recrutement.tsx"
    "src/pages/Resources.tsx"
    "src/pages/Tests.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Traitement de $file..."
        
        # Supprimer l'import du Footer
        sed -i '/import.*Footer.*from.*@\/components\/Footer/d' "$file"
        
        # Supprimer les lignes contenant <Footer />
        sed -i '/<Footer/d' "$file"
        sed -i '/<\/Footer>/d' "$file"
        
        echo "✓ $file traité"
    else
        echo "⚠ $file non trouvé"
    fi
done

echo "Terminé !"
