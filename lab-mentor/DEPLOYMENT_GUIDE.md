# Lab Mentor — Deployment Guide
## Jennifer Hawks Health · Step-by-Step for Non-Technical Users

---

## What you need before starting
- ✅ Your Anthropic API key (starts with `sk-ant-`)
- ✅ Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- ✅ A free Vercel account (vercel.com — sign in with Google)

---

## STEP 1 — Upload to Vercel (5 minutes)

1. Go to **vercel.com** and sign in with Google
2. Click **"Add New Project"**
3. Scroll down and click **"Upload"** (or drag this entire `lab-mentor` folder into the page)
4. Vercel will detect the project automatically
5. Click **"Deploy"** — do NOT deploy yet, do Step 2 first!

---

## STEP 2 — Add your secret keys (2 minutes)

Before clicking Deploy, look for **"Environment Variables"** on the deploy screen.

Add these three variables one at a time:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic key (starts with sk-ant-) |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with sk_live_ or sk_test_) |
| `SITE_URL` | Leave blank for now — add after deploy (see Step 4) |

⚠️  IMPORTANT: Never share these keys with anyone. They stay private inside Vercel.

---

## STEP 3 — Deploy!

Click **"Deploy"**. Vercel will build your app in about 60 seconds.

When it's done, you'll see a green checkmark and a URL like:
`https://lab-mentor-abc123.vercel.app`

---

## STEP 4 — Add your site URL (1 minute)

1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add: `SITE_URL` = `https://your-actual-url.vercel.app`
   (use the URL from Step 3)
3. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

This makes Stripe redirect users back to your site after payment.

---

## STEP 5 — Set up Stripe redirect (2 minutes)

Your Stripe account needs to allow your site's URL.

1. Log into **stripe.com**
2. Go to **Developers → API Keys** — make sure you're using your live key (not test)
3. That's it! The redirect URLs are handled automatically by the code.

---

## STEP 6 — Test it!

1. Visit your Vercel URL
2. Select a panel (e.g. Blood Labs)
3. Upload a test PDF
4. Click "Get My Analysis — $9.99"
5. You should be redirected to Stripe checkout
6. Complete payment with a test card: **4242 4242 4242 4242** (any future date, any CVC)
7. You should be redirected back and see "Payment confirmed!"
8. Upload your file again and click Analyze

---

## Changing the price

Open `api/create-checkout.js` and find this line:
```
unit_amount: 999, // $9.99
```
Change `999` to any amount in cents. For example:
- `1999` = $19.99
- `2499` = $24.99
- `4900` = $49.00

Then redeploy in Vercel (Deployments → Redeploy).

---

## Going live vs. testing

- **Testing:** Use Stripe test keys (`sk_test_...`) and test card `4242 4242 4242 4242`
- **Live:** Switch to Stripe live keys (`sk_live_...`) in Vercel environment variables, then redeploy

---

## Need help?

Email: info@jenniferhawkshealth.com
