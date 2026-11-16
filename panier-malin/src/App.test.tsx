import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { App } from './App';

describe('application', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/';
  });

  it('sans source connectée : aucun prix affiché, état vide explicite', async () => {
    render(<App />);
    expect(await screen.findByText('Aucune promotion vérifiée pour le moment')).toBeInTheDocument();
    expect(screen.queryByText(/CHF \d/)).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /démo/i })).not.toBeInTheDocument();
  });

  it('mode démo : bandeau visible et chaque offre badgée « Démo »', async () => {
    window.localStorage.setItem('pms.demoMode.v1', 'true');
    render(<App />);
    expect(await screen.findByText(/magasins et prix fictifs/)).toBeInTheDocument();
    const cards = await screen.findAllByRole('article');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) expect(within(card).getByText('Démo')).toBeInTheDocument();
  });
});
