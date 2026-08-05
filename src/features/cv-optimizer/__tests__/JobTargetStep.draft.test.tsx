import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { JobTargetStep } from '../JobTargetStep';

const DRAFT_KEY = 'makoki.cv-optimizer.job-target-draft.v1';

describe('JobTargetStep — issue #152, brouillon local de la description d’offre', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persiste la description saisie puis la restaure quand le composant est démonté et remonté (rafraîchissement simulé)", () => {
    const onSubmit = vi.fn();
    const { unmount } = render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />);

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: 'Comptable' } });
    fireEvent.change(screen.getByLabelText('Description de l’offre'), {
      target: { value: 'Gestion de la comptabilité générale et suivi de trésorerie.' },
    });

    expect(localStorage.getItem(DRAFT_KEY)).toContain('Gestion de la comptabilité');
    unmount();

    render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />);
    expect(screen.getByLabelText('Intitulé du poste')).toHaveValue('Comptable');
    expect(screen.getByLabelText('Description de l’offre')).toHaveValue('Gestion de la comptabilité générale et suivi de trésorerie.');
  });

  it('efface le brouillon une fois la cible soumise ("Comparer mon CV à cette offre")', () => {
    const onSubmit = vi.fn();
    render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />);

    fireEvent.change(screen.getByLabelText('Description de l’offre'), { target: { value: 'Offre de test.' } });
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /comparer mon cv à cette offre/i }));
    expect(onSubmit).toHaveBeenCalledWith({ jobTitle: undefined, jobDescription: 'Offre de test.' });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('efface aussi le brouillon quand on soumet sans offre ("Analyser mon CV sans offre")', () => {
    const onSubmit = vi.fn();
    render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />);

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: 'Comptable' } });
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /analyser mon cv sans offre/i }));
    expect(onSubmit).toHaveBeenCalledWith({});
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("ne réécrase pas une saisie utilisateur déjà présente par le brouillon restauré", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ jobTitle: 'Comptable', jobDescription: 'Ancienne description.' }));
    const onSubmit = vi.fn();
    render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />);

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
    render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />);

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: 'Comptable' } });
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    fireEvent.change(screen.getByLabelText('Intitulé du poste'), { target: { value: '' } });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('ignore une valeur de brouillon corrompue en localStorage sans planter et nettoie la clé', () => {
    localStorage.setItem(DRAFT_KEY, '{ceci nest pas du json valide');
    const onSubmit = vi.fn();

    expect(() => render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />)).not.toThrow();

    expect(screen.getByLabelText('Intitulé du poste')).toHaveValue('');
    expect(screen.getByLabelText('Description de l’offre')).toHaveValue('');
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("ne lève aucune erreur et reste fonctionnel quand localStorage est indisponible", () => {
    const unavailable = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(unavailable);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(unavailable);
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(unavailable);

    try {
      const onSubmit = vi.fn();
      expect(() => render(<JobTargetStep onSubmit={onSubmit} onBack={vi.fn()} submitting={false} />)).not.toThrow();

      expect(() => fireEvent.change(screen.getByLabelText('Description de l’offre'), {
        target: { value: 'Saisie malgré un stockage local indisponible.' },
      })).not.toThrow();
      expect(screen.getByLabelText('Description de l’offre')).toHaveValue('Saisie malgré un stockage local indisponible.');

      expect(() => fireEvent.click(screen.getByRole('button', { name: /comparer mon cv à cette offre/i }))).not.toThrow();
      expect(onSubmit).toHaveBeenCalledWith({ jobTitle: undefined, jobDescription: 'Saisie malgré un stockage local indisponible.' });
    } finally {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    }
  });
});
