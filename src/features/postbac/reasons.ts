import type { RiasecDimensionCode } from '@/types/riasec';
import type { CareerMatch } from '@/types/career';
import { careerFitBand } from '@/lib/careerPresentation';
import { DIMENSION_COPY, isDimensionCode } from './dimensions';

// Construit une raison de recommandation UNIQUEMENT a partir de donnees deja
// calculees par l'API :
//  - les dimensions dominantes de l'utilisateur (deja classees) ;
//  - le code d'interets du metier (occupationCode) ;
//  - la proximite d'interets deja renvoyee (fitScore -> bande qualitative).
// Aucun score n'est calcule ici. Aucune promesse de reussite n'est produite.

const dominantCodesFromUser = (userTopCodes: RiasecDimensionCode[]) =>
  new Set(userTopCodes);

const occupationCodes = (match: CareerMatch): RiasecDimensionCode[] => {
  const raw = String(match.occupationCode || match.userCode || '');
  return raw
    .split('')
    .filter(isDimensionCode) as RiasecDimensionCode[];
};

export interface CareerReason {
  text: string;
  sharedDimensions: RiasecDimensionCode[];
  proximityLabel: string;
}

export const buildCareerReason = (
  match: CareerMatch,
  userTopCodes: RiasecDimensionCode[],
): CareerReason => {
  const userSet = dominantCodesFromUser(userTopCodes);
  const shared = occupationCodes(match).filter((code) => userSet.has(code));
  const band = careerFitBand(match.fitScore); // reutilise, ne recalcule pas

  const activities = shared.map((code) => DIMENSION_COPY[code].activity);

  let text: string;
  if (activities.length > 0) {
    const list = activities.length === 1
      ? activities[0]
      : `${activities.slice(0, -1).join(', ')} et ${activities[activities.length - 1]}`;
    text = `Ce métier mobilise ${list} qui correspondent à vos intérêts dominants.`;
  } else {
    text = 'Ce métier partage une proximité d’intérêts avec votre profil, '
      + 'd’après la comparaison des dimensions déjà calculées.';
  }

  // La proximite est qualitative et provient de la bande deja fournie.
  return {
    text,
    sharedDimensions: shared,
    proximityLabel: `Proximité d’intérêts ${band.label.toLowerCase()}`,
  };
};
