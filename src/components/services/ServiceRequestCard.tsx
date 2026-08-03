import { FormEvent, useMemo, useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type LaunchService = 'emploi' | 'cv' | 'recrutement';

const labels: Record<LaunchService, string> = {
  emploi: 'Recherche d’opportunités',
  cv: 'Accompagnement CV',
  recrutement: 'Besoin de recrutement',
};

interface ServiceRequestCardProps {
  service: LaunchService;
  title: string;
  description: string;
  submitLabel?: string;
}

export function ServiceRequestCard({ service, title, description, submitLabel = 'Envoyer par WhatsApp' }: ServiceRequestCardProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [need, setNeed] = useState('');

  const message = useMemo(() => [
    'Bonjour MAKOKI,',
    '',
    'Service : ' + labels[service],
    'Nom : ' + (name.trim() || 'Non renseigné'),
    'Contact : ' + (contact.trim() || 'Non renseigné'),
    'Besoin : ' + (need.trim() || 'Non renseigné'),
    '',
    'Je souhaite être recontacté pour préciser les conditions, le délai et le tarif éventuel avant toute prestation.',
  ].join('\n'), [contact, name, need, service]);

  const emailHref = 'mailto:contact@makoki.org?subject='
    + encodeURIComponent(labels[service] + ' — demande depuis makoki.org')
    + '&body='
    + encodeURIComponent(message);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const url = 'https://wa.me/242055344253?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-emerald-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-base leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${service}-name`} className="mb-2 block text-sm font-medium">Nom ou organisation</label>
              <Input id={`${service}-name`} value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
            </div>
            <div>
              <label htmlFor={`${service}-contact`} className="mb-2 block text-sm font-medium">Téléphone ou e-mail</label>
              <Input id={`${service}-contact`} value={contact} onChange={(event) => setContact(event.target.value)} maxLength={160} required />
            </div>
          </div>
          <div>
            <label htmlFor={`${service}-need`} className="mb-2 block text-sm font-medium">Décris brièvement ton besoin</label>
            <textarea
              id={`${service}-need`}
              value={need}
              onChange={(event) => setNeed(event.target.value)}
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              maxLength={1500}
              required
            />
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Aucun document n’est téléversé sur cette page. Le message est envoyé uniquement lorsque tu choisis WhatsApp ou e-mail.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit"><MessageCircle className="mr-2 h-4 w-4" />{submitLabel}</Button>
            <Button type="button" variant="outline" asChild><a href={emailHref}><Mail className="mr-2 h-4 w-4" />Envoyer par e-mail</a></Button>
          </div>
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <Send className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            MAKOKI confirme ensuite le périmètre, la disponibilité et le tarif éventuel avant tout engagement.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default ServiceRequestCard;
