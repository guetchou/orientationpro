import { CalendarClock, MessageCircle, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { advisorChannels } from './config';

// CTA conseiller facultatif, pilote par configuration (aucun numero en dur).
// WhatsApp si configure, sinon formulaire, sinon etat honnete « en preparation ».
// Ne cree jamais de faux annuaire ni de faux conseiller.
export const AdvisorCta = ({ compact = false }: { compact?: boolean }) => {
  const { whatsapp, formUrl, hasChannel } = advisorChannels();

  if (!hasChannel) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" />
        <div>
          <p className="font-semibold text-stone-800">Accompagnement en préparation</p>
          <p className="mt-1">
            La prise de rendez-vous avec un conseiller sera bientôt disponible. En attendant, vous
            pouvez explorer les fiches métiers et le classement complet.
          </p>
        </div>
      </div>
    );
  }

  // WhatsApp prioritaire s'il est configure, sinon formulaire.
  const href = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`
    : formUrl;
  const label = whatsapp ? 'Parler à un conseiller sur WhatsApp' : 'Parler à un conseiller';

  return (
    <Button
      asChild
      size={compact ? 'default' : 'lg'}
      className="bg-emerald-700 hover:bg-emerald-800"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-2 h-5 w-5" /> {label}
      </a>
    </Button>
  );
};

// Icone exportee pour d'eventuels etats vides ailleurs (non utilisee ici).
export const NoAdvisorIcon = PhoneOff;
