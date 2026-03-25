const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { panel } = JSON.parse(event.body);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const PANEL_NAMES = {
      blood: 'Blood Labs',
      gimap: 'GI-MAP',
      dutch: 'DUTCH Complete',
      htma:  'HTMA',
      oats:  'OATs'
    };

    const panelName = PANEL_NAMES[panel] || 'Lab Panel';
    const siteUrl = process.env.SITE_URL || 'https://ornate-lily-87cdca.netlify.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Lab Mentor — Functional Analysis',
            description: `${panelName} · Jennifer Hawks Health`,
          },
          unit_amount: 999, // $9.99 — change this number to change price (in cents)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${siteUrl}/?session_id={CHECKOUT_SESSION_ID}&panel=${panel}`,
      cancel_url:  `${siteUrl}/`,
      metadata: { panel },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create checkout session.' }),
    };
  }
};
