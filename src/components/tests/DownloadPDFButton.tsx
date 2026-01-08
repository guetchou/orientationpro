
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface DownloadPDFButtonProps {
  elementId: string;
  fileName: string;
  label?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

const DownloadPDFButton = ({
  elementId,
  fileName,
  label = "Télécharger en PDF",
  buttonVariant = "outline",
  buttonSize = "sm"
}: DownloadPDFButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error("Élément non trouvé");
      return;
    }

    setIsGenerating(true);
    try {
      // Notification de démarrage
      toast.loading("Génération du PDF en cours...");
      
      // Petit délai pour permettre à l'animation de toast de démarrer
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(element, {
        scale: 2, // Meilleure qualité
        useCORS: true, // Pour les images qui pourraient être cross-origin
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Créer le PDF au format A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Dimensions de la page A4 en mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Ajuster l'image pour qu'elle s'adapte à la largeur de la page en gardant les proportions
      const imgWidth = pdfWidth - 20; // marges de 10mm de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Si l'image est plus haute que la page, la redimensionner
      const imgRatio = imgHeight / imgWidth;
      const pageRatio = (pdfHeight - 20) / (pdfWidth - 20);
      
      let finalImgWidth = imgWidth;
      let finalImgHeight = imgHeight;
      
      if (imgRatio > pageRatio) {
        finalImgHeight = pdfHeight - 20;
        finalImgWidth = finalImgHeight / imgRatio;
      }
      
      // Ajouter l'image au PDF centré horizontalement
      const xPosition = (pdfWidth - finalImgWidth) / 2;
      pdf.addImage(imgData, 'PNG', xPosition, 10, finalImgWidth, finalImgHeight);
      
      // Sauvegarder le PDF
      pdf.save(`${fileName}.pdf`);
      
      // Notification de réussite
      toast.success("PDF généré avec succès!");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
};

export default DownloadPDFButton;
