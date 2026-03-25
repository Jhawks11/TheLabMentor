import Stripe from 'stripe';

export default async function handler(req, res) {
  // Allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { panel } = req.body;

    const PANEL_NAMES = {
      blood:  'Blood Labs',
      gimap:  'GI-MAP',
      dutch:  'DUTCH Complete',
      htma:   'HTMA',
      oats:   'OATs'
    };

    const panelName = PANEL_NAMES[panel] || 'Lab Panel';
    const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Lab Mentor — Functional Analysis',
            description: `${panelName} interpretation through a functional lens · Jennifer Hawks Health`,
            images: [],
          },
          unit_amount: 999, // $9.99 — change this number to change the price (in cents)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}&panel=${panel}`,
      cancel_url:  `${baseUrl}/`,
      metadata: { panel },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: 'Could not create checkout session.' });
  }
}
