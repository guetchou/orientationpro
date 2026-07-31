import type { AdvisorRiasecProfile } from './advisor-types';
import { topRiasecDimensions } from './riasec-profile';

export interface GuestCareerFamily {
  dimension: keyof AdvisorRiasecProfile['scores'];
  title: string;
  examples: string[];
  searchQuery: string;
}

const families: Record<keyof AdvisorRiasecProfile['scores'], Omit<GuestCareerFamily, 'dimension'>> = {
  R: {
    title: 'Technique, terrain et fabrication',
    examples: ['maintenance', 'construction', 'agriculture', 'logistique'],
    searchQuery: 'technicien',
  },
  I: {
    title: 'Sciences, analyse et résolution de problèmes',
    examples: ['santé', 'informatique', 'recherche', 'ingénierie'],
    searchQuery: 'ingénieur',
  },
  A: {
    title: 'Création, expression et communication',
    examples: ['design', 'médias', 'culture', 'communication'],
    searchQuery: 'communication',
  },
  S: {
    title: 'Aide, éducation et accompagnement',
    examples: ['enseignement', 'soins', 'service social', 'conseil'],
    searchQuery: 'éducateur',
  },
  E: {
    title: 'Initiative, commerce et leadership',
    examples: ['vente', 'entrepreneuriat', 'gestion', 'négociation'],
    searchQuery: 'commercial',
  },
  C: {
    title: 'Organisation, données et administration',
    examples: ['comptabilité', 'gestion', 'banque', 'administration'],
    searchQuery: 'comptable',
  },
};

export const guestCareerFamilies = (profile: AdvisorRiasecProfile): GuestCareerFamily[] =>
  topRiasecDimensions(profile).map(({ dimension }) => ({
    dimension,
    ...families[dimension],
  }));
