// Configuration du lot post-bac. Toutes les valeurs proviennent de variables
// d'environnement Vite ; rien n'est code en dur ni calcule. Les fonctions
// relisent l'environnement a chaque appel pour rester testables.

export const isPostBacEnabled = (): boolean =>
  String(import.meta.env.VITE_POSTBAC_AUTO_V1_ENABLED ?? '').trim() === 'true';

export interface AdvisorChannels {
  whatsapp: string;
  formUrl: string;
  hasChannel: boolean;
}

// Canaux de contact conseiller. Un canal n'est actif que s'il est configure ;
// sinon l'interface affiche un etat honnete « accompagnement en preparation ».
export const advisorChannels = (): AdvisorChannels => {
  const whatsapp = String(import.meta.env.VITE_MAKOKI_ADVISOR_WHATSAPP ?? '').trim();
  const formUrl = String(import.meta.env.VITE_MAKOKI_ADVISOR_FORM_URL ?? '').trim();
  return { whatsapp, formUrl, hasChannel: Boolean(whatsapp || formUrl) };
};

// Nombre maximal de metiers prioritaires affiches dans le resume automatique.
export const MAX_PRIORITY_CAREERS = 6;
