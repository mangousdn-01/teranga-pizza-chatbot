import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the chat header correctly', () => {
    render(<App />);
    expect(screen.getByText('Teranga Pizza')).toBeInTheDocument();
    expect(screen.getByText('Assistance Virtuelle / Ndımbal Ci Wolof')).toBeInTheDocument();
  });

  it('shows combined language options initially', () => {
    render(<App />);
    expect(screen.getByText(/Bienvenue chez Teranga Pizza, Dalal ak jamm ci Teranga Pizza !/i)).toBeInTheDocument();
    expect(screen.getByText('Voir le menu Pizzas 🍕 / Xool Menu yi')).toBeInTheDocument();
  });

  it('handles the delivery flow correctly with combined language', async () => {
    render(<App />);
    
    // 1. Select Order
    const orderBtn = screen.getByText('Passer une commande 📝 / Def commande');
    fireEvent.click(orderBtn);

    // 2. User provides items (mock interaction via text input)
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Entrez votre message / Bindal sa message...');
      fireEvent.change(input, { target: { value: 'Je veux une Margherita' } });
      fireEvent.click(screen.getByText('Envoyer'));
    });

    // 3. Bot asks for delivery or pickup
    await waitFor(() => {
      expect(screen.getByText(/Avez-vous besoin d'une livraison ou passerez-vous récupérer votre commande \?/i)).toBeInTheDocument();
      expect(screen.getByText('Livraison 🛵')).toBeInTheDocument();
    });

    // 4. Select Delivery
    fireEvent.click(screen.getByText('Livraison 🛵'));

    // 5. Bot asks for address
    await waitFor(() => {
      expect(screen.getByText(/Pouvez-vous nous envoyer votre adresse de livraison \?/i)).toBeInTheDocument();
    });
  });
});
