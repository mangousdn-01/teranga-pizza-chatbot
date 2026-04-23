import { useState, useRef, useEffect } from 'react'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      type: 'text',
      content: "Bienvenue chez Teranga Pizza, Dalal ak jamm ci Teranga Pizza ! Comment pouvons nous vous aider ?"
    },
    {
      id: 2,
      sender: 'bot',
      type: 'options',
      options: [
        { label: 'Voir le menu Pizzas 🍕 / Xool Menu yi', value: 'menu_pizza' },
        { label: 'Voir le menu Jus 🧃 / Xool Menu Njar yi', value: 'menu_juice' },
        { label: 'Passer une commande 📝 / Def commande', value: 'order' }
      ]
    }
  ]);
  
  const [orderFlow, setOrderFlow] = useState('idle'); // idle, asking_items, asking_delivery, asking_address, asking_payment, completed
  const [deliveryType, setDeliveryType] = useState(''); // delivery, pickup
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = (value) => {
    // Main menu handling
    if (value === 'menu_pizza') {
      addMessage('user', 'text', 'Voir le menu Pizzas / Xool Menu yi');
      setTimeout(() => {
        addMessage('bot', 'text', 'Voici notre menu de Pizzas / Mëngi nii sunu menu Pizza:');
        addMessage('bot', 'image', '/pizza_menu.jpeg');
      }, 500);
    } else if (value === 'menu_juice') {
      addMessage('user', 'text', 'Voir le menu Jus / Xool Menu Njar yi');
      setTimeout(() => {
        addMessage('bot', 'text', 'Voici notre menu de Jus naturels / Mëngi nii sunu menu njar yi:');
        addMessage('bot', 'image', '/juice_menu.jpeg');
      }, 500);
    } else if (value === 'order') {
      addMessage('user', 'text', 'Passer une commande / Def commande');
      setOrderFlow('asking_items');
      setTimeout(() => {
        addMessage('bot', 'text', 'Très bien! Dites-moi les pizzas et jus que vous souhaitez commander.\nBaxna! Waxma yanu pizza ak njar nga bëgg.');
      }, 500);
    } 
    // Delivery selection handling
    else if (value === 'delivery') {
      addMessage('user', 'text', 'Livraison 🛵');
      setOrderFlow('asking_address');
      setDeliveryType('delivery');
      setTimeout(() => {
        addMessage('bot', 'text', 'Pouvez-vous nous envoyer votre adresse de livraison ?\nMeun nga nu jox sa adresse ngir livraison bi ?');
      }, 500);
    } else if (value === 'pickup') {
      addMessage('user', 'text', 'Récupérer sur place 🏪 / Jëlsi ko');
      setOrderFlow('asking_payment');
      setDeliveryType('pickup');
      setTimeout(() => {
        addMessage('bot', 'text', 'D\'accord. Quel est votre méthode de paiement ?\nBaxna. Yanu anam paiement nga bëgga def ?');
        addMessage('bot', 'options', null, [
          { label: 'Orange money', value: 'pay_orange' },
          { label: 'Wave', value: 'pay_wave' },
          { label: 'Espèces / Xaalis ci loxo', value: 'pay_cash' }
        ]);
      }, 500);
    } else if (value.startsWith('pay_')) {
      let paymentText = '';
      if (value === 'pay_orange') paymentText = 'Orange money';
      else if (value === 'pay_wave') paymentText = 'Wave';
      else if (value === 'pay_cash') paymentText = 'Espèces / Xaalis ci loxo';
      
      addMessage('user', 'text', paymentText);
      setOrderFlow('completed');
        
      // Send order to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatHistory: messages.map(m => m.content).filter(Boolean).slice(-6),
          paymentMethod: paymentText,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error("Erreur serveur:", err));

      let confirmationMessage = '';
      if (deliveryType === 'delivery') {
        confirmationMessage = "Merci pour votre commande ! Notre livreur vous contactera bientôt.\n📞 Contact: 770060001\nÀ très bientôt chez Teranga Pizza !\n\nJërëjëf ci sa commande ! Sunu livreur dina la wóoté léegi. Soo soxlaa jokkoo ak ñun: 📞 770060001. Ba bénnén yoon !";
      } else {
        confirmationMessage = "Merci pour votre commande ! Notre équipe va la préparer immédiatement. Vous pouvez la récupérer sur place.\n📞 Contact: 770060001 | 📍 Adresse: Dakar, Medina | ✉️ Email: terangapizza@gmail.com\nÀ très bientôt chez Teranga Pizza !\n\nJërëjëf ci sa commande ! Mën nga ñëw jëlsi ko. Sunu adresse: Dakar, Medina. Soo soxlaa jokkoo ak ñun: 📞 770060001. Ba bénnén yoon !";
      }

      addMessage('bot', 'text', confirmationMessage);
    }
  };

  const addMessage = (sender, type, content, options = null) => {
    setMessages(prev => [
      ...prev, 
      { id: Date.now(), sender, type, content, options }
    ]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userText = inputText;
    addMessage('user', 'text', userText);
    setInputText('');

    // State Machine for the Ordering Flow
    setTimeout(() => {
      if (orderFlow === 'asking_items') {
        // Assume user provided items, move to delivery option
        setOrderFlow('asking_delivery');
        addMessage('bot', 'text', "C'est noté! Avez-vous besoin d'une livraison ou passerez-vous récupérer votre commande ?\nDégg naa! Ndax dangay soxla ñu livré la wala dangay ñëw jëlsi ko ?");
        addMessage('bot', 'options', null, [
          { label: 'Livraison 🛵', value: 'delivery' },
          { label: 'Récupérer sur place 🏪 / Jëlsi ko', value: 'pickup' }
        ]);
      } else if (orderFlow === 'asking_address') {
        // User provided address, ask for payment
        setOrderFlow('asking_payment');
        addMessage('bot', 'text', "Parfait. Quel est votre méthode de paiement ?\nBaxna. Yanu anam paiement nga bëgga def ?");
        addMessage('bot', 'options', null, [
          { label: 'Orange money', value: 'pay_orange' },
          { label: 'Wave', value: 'pay_wave' },
          { label: 'Espèces / Xaalis ci loxo', value: 'pay_cash' }
        ]);
      } else {
        // Fallback for general conversation if not in order flow
        addMessage('bot', 'text', "Je suis encore en apprentissage. Veuillez utiliser les boutons.\nMënaguma dégg luñuy bind bu baax. Jëfandikool bouton yi.");
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="app-container">
      {/* Background Image */}
      <div className="background-layer" style={{ backgroundImage: "url('/background_image.jpeg')" }}></div>
      
      <div className="chat-wrapper glass-panel">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="/logo.jpeg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
            <h1>Teranga Pizza</h1>
          </div>
          <p>Assistance Virtuelle / Ndımbal Ci Wolof</p>
        </header>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender === 'user' ? 'sent-row' : 'received-row'}`}>
              <div className={`message ${msg.sender === 'user' ? 'sent' : 'received'}`}>
                {msg.type === 'text' && (
                  <span className="message-content">{msg.content}</span>
                )}
                {msg.type === 'image' && (
                  <div className="message-content image-content">
                     <img src={msg.content} alt="Menu" style={{ maxWidth: '100%', borderRadius: '10px', marginTop: '5px' }} />
                  </div>
                )}
                {msg.type === 'options' && (
                  <div className="options-container">
                    {msg.options.map((opt, idx) => (
                      <button 
                        key={idx} 
                        className="option-btn"
                        onClick={() => handleOptionClick(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Entrez votre message / Bindal sa message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={handleSend}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
