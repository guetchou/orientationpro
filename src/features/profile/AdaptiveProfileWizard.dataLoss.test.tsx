import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdaptiveProfileWizard from './AdaptiveProfileWizard';
import * as api from './profileApi';

vi.mock('./profileApi', async () => {
  const actual = await vi.importActual<typeof import('./profileApi')>('./profileApi');
  return {
    ...actual,
    getAdaptiveProfile: vi.fn(),
    saveProfileDetails: vi.fn(),
    saveEducationHistory: vi.fn(),
    saveDeclaredSkills: vi.fn(),
  };
});

const emptyPayload = {
  profile: {
    first_name: null,
    last_name: null,
    phone: null,
    city: null,
    country_code: 'CG',
    current_situation: 'student' as const,
    primary_goal: null,
    mobility_scope: null,
    profile_summary: null,
    completion_percent: 0,
  },
  education: [],
  skills: [],
  hypotheses: [],
};

describe('AdaptiveProfileWizard — issue #151, brouillon local intra-étape', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(api.getAdaptiveProfile).mockResolvedValue(emptyPayload);
  });

  it("préserve une saisie non enregistrée quand le composant est démonté puis remonté (fermeture d'onglet simulée)", async () => {
    // Premier montage : l'utilisateur arrive sur la page.
    const { unmount } = render(<AdaptiveProfileWizard />);
    await waitFor(() => expect(api.getAdaptiveProfile).toHaveBeenCalledTimes(1));

    // Avance jusqu'à l'étape « Études » (3e étape pour une situation « student »).
    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalledTimes(1));
    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('heading', { name: 'Études' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
    const diplomaInput = await screen.findByLabelText('Diplôme');
    fireEvent.change(diplomaInput, { target: { value: 'Licence en informatique' } });
    expect(screen.getByLabelText('Diplôme')).toHaveValue('Licence en informatique');

    // Laisse le temps à l'effet de brouillon (qui suit la saisie) de s'exécuter,
    // puis ferme l'onglet sans jamais cliquer sur « Enregistrer et continuer »
    // pour cette étape : aucun appel serveur n'a eu lieu.
    await waitFor(() => expect(localStorage.getItem('makoki.profile.draft.v1.anonymous')).toContain('Licence en informatique'));
    expect(api.saveEducationHistory).not.toHaveBeenCalled();
    unmount();

    // L'utilisateur revient : le composant est remonté, exactement comme un
    // rechargement d'onglet. Le serveur renvoie toujours le profil vide
    // d'origine puisque rien n'a été enregistré côté backend — seul le
    // brouillon local permet de retrouver la saisie.
    render(<AdaptiveProfileWizard />);
    await waitFor(() => expect(api.getAdaptiveProfile).toHaveBeenCalledTimes(2));

    expect(await screen.findByText('Brouillon local repris sur cet appareil.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Études' })).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Licence en informatique')).toBeInTheDocument();
  });

  it('efface le brouillon une fois le profil finalisé', async () => {
    vi.mocked(api.saveDeclaredSkills).mockResolvedValue(emptyPayload);
    render(<AdaptiveProfileWizard />);
    await waitFor(() => expect(api.getAdaptiveProfile).toHaveBeenCalledTimes(1));

    // identity -> objective -> education (passée, vide) -> skills (passée, vide)
    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer|passer et continuer/i }));
      await waitFor(() => expect(screen.getByText(/étape \d sur \d/i)).toBeInTheDocument());
    }
    expect(localStorage.getItem('makoki.profile.draft.v1.anonymous')).not.toBeNull();

    expect(await screen.findByRole('heading', { name: 'Synthèse' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /finaliser mon profil/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalled());

    expect(localStorage.getItem('makoki.profile.draft.v1.anonymous')).toBeNull();
  });
});
