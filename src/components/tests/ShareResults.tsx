
import React from "react";
import { Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareResultsProps {
  testType: string;
  resultId: string;
}

const ShareResults = ({ testType, resultId }: ShareResultsProps) => {
  const shareLink = `${window.location.origin}/shared-results/${testType}/${resultId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Lien copié dans le presse-papier");
  };
  
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Résultats de mon test ${testType}`);
    const body = encodeURIComponent(`Découvrez mes résultats au test ${testType}: ${shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const handleShareSocial = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(`Découvrez mes résultats au test ${testType}`);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareLink)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
        break;
    }
    
    if (url) window.open(url, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>Copier le lien</DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareEmail}>Partager par email</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShareSocial('twitter')}>Twitter</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShareSocial('facebook')}>Facebook</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShareSocial('linkedin')}>LinkedIn</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareResults;
