import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './progress';

describe('Progress', () => {
  it('reports the real value to assistive tech instead of staying indeterminate at 0%', () => {
    render(<Progress value={0} aria-label="Profil renseigné" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar.getAttribute('data-state')).not.toBe('indeterminate');
  });

  it('reports a non-zero value correctly', () => {
    render(<Progress value={42} aria-label="Profil renseigné" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
  });

  it('uses a neutral track color, not the brand accent, so an empty bar does not read as full', () => {
    render(<Progress value={0} aria-label="Profil renseigné" />);
    expect(screen.getByRole('progressbar').className).toContain('bg-muted');
    expect(screen.getByRole('progressbar').className).not.toContain('bg-secondary');
  });
});
