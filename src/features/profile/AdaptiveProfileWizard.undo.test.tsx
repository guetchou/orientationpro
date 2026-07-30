import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/ui/sonner';
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

const basePayload = {
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
  education: [{
    id: 'edu-1',
    education_level: 'licence' as const,
    status: 'completed' as const,
    diploma_name: 'Licence en informatique',
    field_of_study: null,
    institution: null,
    country_code: 'CG',
    start_year: null,
    end_year: null,
  }],
  skills: [{
    id: 'skill-1',
    label: 'Analyse de données',
    esco_uri: null,
    proficiency: 'intermediate' as const,
    source: 'declared' as const,
    confirmation_status: 'confirmed' as const,
  }],
  hypotheses: [],
};

describe('AdaptiveProfileWizard — issue #153, suppression réversible avec Annuler', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(api.getAdaptiveProfile).mockResolvedValue(basePayload);
  });

  it('retire une formation immédiatement puis la restaure via le bouton Annuler du toast', async () => {
    render(<><Toaster /><AdaptiveProfileWizard /></>);
    await waitFor(() => expect(api.getAdaptiveProfile).toHaveBeenCalledTimes(1));

    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalledTimes(1));
    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('heading', { name: 'Études' })).toBeInTheDocument();

    expect(screen.getByDisplayValue('Licence en informatique')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retirer/i }));

    // Suppression immédiate, sans confirmation préalable.
    expect(screen.queryByDisplayValue('Licence en informatique')).not.toBeInTheDocument();

    const undoButton = await screen.findByRole('button', { name: 'Annuler' });
    fireEvent.click(undoButton);
    expect(await screen.findByDisplayValue('Licence en informatique')).toBeInTheDocument();
  });

  it('retire une compétence immédiatement puis la restaure via le bouton Annuler du toast', async () => {
    render(<><Toaster /><AdaptiveProfileWizard /></>);
    await waitFor(() => expect(api.getAdaptiveProfile).toHaveBeenCalledTimes(1));

    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalledTimes(1));
    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer/i }));
    await waitFor(() => expect(api.saveProfileDetails).toHaveBeenCalledTimes(2));
    fireEvent.click(await screen.findByRole('button', { name: /enregistrer et continuer|passer et continuer/i }));
    await waitFor(() => expect(screen.getByText(/étape \d sur \d/i)).toBeInTheDocument());
    expect(await screen.findByRole('heading', { name: 'Compétences' })).toBeInTheDocument();

    expect(screen.getByText('Analyse de données')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retirer analyse de données/i }));

    expect(screen.queryByText('Analyse de données')).not.toBeInTheDocument();

    const undoButton = await screen.findByRole('button', { name: 'Annuler' });
    fireEvent.click(undoButton);
    expect(await screen.findByText('Analyse de données')).toBeInTheDocument();
  });
});
