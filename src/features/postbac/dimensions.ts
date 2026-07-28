import type { RiasecDimensionCode } from '@/types/riasec';

// Descriptions statiques et accessibles des six dimensions d'interets.
// Elles ne recalculent rien : elles servent uniquement a traduire en langage
// clair les dimensions deja calculees par le serveur, et a construire les
// raisons de recommandation. Le vocabulaire RIASEC reste reserve aux details.
export interface DimensionCopy {
  code: RiasecDimensionCode;
  name: string; // nom accessible
  technicalName: string; // nom RIASEC (details/methode)
  activity: string; // type d'activite, pour les raisons
  everyday: string; // formulation grand public
}

export const DIMENSION_COPY: Record<RiasecDimensionCode, DimensionCopy> = {
  R: {
    code: 'R',
    name: 'Concret et technique',
    technicalName: 'Réaliste',
    activity: 'des activités concrètes, techniques ou manuelles',
    everyday: 'agir sur des objets, des machines ou des environnements concrets',
  },
  I: {
    code: 'I',
    name: 'Analyse et recherche',
    technicalName: 'Investigateur',
    activity: 'des activités d’analyse et de résolution de problèmes',
    everyday: 'comprendre, analyser et résoudre des problèmes',
  },
  A: {
    code: 'A',
    name: 'Création et expression',
    technicalName: 'Artistique',
    activity: 'des activités créatives et d’expression',
    everyday: 'créer, imaginer et vous exprimer',
  },
  S: {
    code: 'S',
    name: 'Relation et aide',
    technicalName: 'Social',
    activity: 'des activités d’aide et de relation aux autres',
    everyday: 'accompagner, aider et transmettre',
  },
  E: {
    code: 'E',
    name: 'Initiative et gestion',
    technicalName: 'Entreprenant',
    activity: 'des activités d’initiative, de persuasion et de gestion',
    everyday: 'entreprendre, convaincre et diriger',
  },
  C: {
    code: 'C',
    name: 'Organisation et rigueur',
    technicalName: 'Conventionnel',
    activity: 'des activités d’organisation et de rigueur',
    everyday: 'organiser, structurer et fiabiliser',
  },
};

export const isDimensionCode = (value: string): value is RiasecDimensionCode =>
  value === 'R' || value === 'I' || value === 'A' || value === 'S'
  || value === 'E' || value === 'C';
