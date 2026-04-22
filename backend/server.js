import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Placeholder for our Chatbot State / NLP Engine
app.post('/api/chat', (req, res) => {
    const { message, language } = req.body;
    
    // Minimal mock response for now
    let reply = "I didn't understand that.";
    if (language === 'fr') {
        reply = "Bienvenue chez Teranga Pizza! (Mock)";
    } else if (language === 'wo') {
        reply = "Nuyu na la ci Teranga Pizza! (Mock)";
    }

    res.json({ reply });
});

// Placeholder for Menu Data
app.get('/api/menu', (req, res) => {
    res.json({
        pizzas: [
            { id: 1, name: 'Margherita', price: 3000 },
            { id: 2, name: 'Pepperoni', price: 4000 }
        ],
        juices: [] // we will populate this when the user uploads the juice menu
    });
});

// Handle incoming orders
const orders = [];
app.post('/api/order', (req, res) => {
    const orderData = req.body;
    orderData.id = Date.now();
    orderData.status = 'pending';
    orders.push(orderData);
    
    console.log('\n=== NOUVELLE COMMANDE REÇUE ===');
    console.log(orderData);
    console.log('===============================\n');

    res.status(201).json({ success: true, orderId: orderData.id });
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`Teranga Pizza Backend running on http://localhost:${PORT}`);
});
