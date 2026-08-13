import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { JobTargetStep } from '../JobTargetStep';

const DRAFT_KEY = 'makoki.cv-optimizer.job-target-draft.v1';
const baseProps = { fileName: 'mon-cv.pdf', onBack: vi.fn(), submitting: false };

describe('JobTargetStep — brouillon local de la description d’offre', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persiste la description saisie puis la restaure quand le composant est démonté et remonté", () => {
    const onSubmit = vi.fn();
    const { unmount } = render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: 'Comptable' } });
    fireEvent.change(screen.getByLabelText('Description de l’offre'), {
      target: { value: 'Gestion de la comptabilité générale et suivi de trésorerie.' },
    });

    expect(localStorage.getItem(DRAFT_KEY)).toContain('Gestion de la comptabilité');
    unmount();

    render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />);
    expect(screen.getByLabelText('Intitulé du poste')).toHaveValue('Comptable');
    expect(screen.getByLabelText('Description de l’offre')).toHaveValue('Gestion de la comptabilité générale et suivi de trésorerie.');
  });

  it('efface le brouillon une fois l’adéquation lancée', () => {
    const onSubmit = vi.fn();
    render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Description de l’offre'), { target: { value: 'Offre de test.' } });
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /analyser l’adéquation/i }));
    expect(onSubmit).toHaveBeenCalledWith({ jobTitle: undefined, jobDescription: 'Offre de test.' });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("ne réécrase pas une saisie utilisateur déjà présente par le brouillon restauré", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ jobTitle: 'Comptable', jobDescription: 'Ancienne description.' }));
    const onSubmit = vi.fn();
    render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Intitulé du poste')).toHaveValue('Comptable');

    fireEvent.change(screen.getByLabelText('Description de l’offre'), {
      target: { value: 'Nouvelle description tapée par l’utilisateur.' },
    });

    expect(screen.getByLabelText('Description de l’offre')).toHaveValue('Nouvelle description tapée par l’utilisateur.');
    expect(localStorage.getItem(DRAFT_KEY)).toContain('Nouvelle description tapée par l’utilisateur.');
    expect(localStorage.getItem(DRAFT_KEY)).not.toContain('Ancienne description.');
  });

  it('supprime la clé de brouillon dès que les deux champs redeviennent vides', () => {
    const onSubmit = vi.fn();
    render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: 'Comptable' } });
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: '' } });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('ignore une valeur de brouillon corrompue en localStorage sans planter et nettoie la clé', () => {
    localStorage.setItem(DRAFT_KEY, '{ceci nest pas du json valide');
    const onSubmit = vi.fn();

    expect(() => render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />)).not.toThrow();

    expect(screen.getByLabelText('Intitulé du poste')).toHaveValue('');
    expect(screen.getByLabelText('Description de l’offre')).toHaveValue('');
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("reste fonctionnel quand localStorage est indisponible", () => {
    const unavailable = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(unavailable);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(unavailable);
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(unavailable);

    try {
      const onSubmit = vi.fn();
      expect(() => render(<JobTargetStep {...baseProps} onSubmit={onSubmit} />)).not.toThrow();

      expect(() => fireEvent.change(screen.getByLabelText('Description de l’offre'), {
        target: { value: 'Saisie malgré un stockage local indisponible.' },
      })).not.toThrow();
      expect(screen.getByLabelText('Description de l’offre')).toHaveValue('Saisie malgré un stockage local indisponible.');

      expect(() => fireEvent.click(screen.getByRole('button', { name: /analyser l’adéquation/i }))).not.toThrow();
      expect(onSubmit).toHaveBeenCalledWith({ jobTitle: undefined, jobDescription: 'Saisie malgré un stockage local indisponible.' });
    } finally {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    }
  });
});
