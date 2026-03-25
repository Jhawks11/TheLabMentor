import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb', // Allow large PDF/image uploads
    },
  },
};

// ── JHH Lab Ledger functional ranges ──────────────────────────────────────
const PANEL_RANGES = {
  blood: `CBC: WBC 5-7, RBC Female 4.2-4.6, RBC Male 4.6-5.2, Hemoglobin Female 13.2-14.5, Hemoglobin Male 14-16, Hematocrit Female 40-44, Hematocrit Male 42-48, MCV 85-92, MCH 27-32, MCHC 33-37, RDW 11.5-14.5, Platelets 200-350, Neutrophils% 40-60, Lymphocytes% 20-30, Monocytes% 4-7, Eosinophils% 1-3, Basophils% 0.5-1.
CMP: Glucose 75-86, BUN 10-16, Creatinine 0.7-1.1, BUN/Creatinine 7.3-21.7, Sodium 136-142, Potassium 4.0-4.5, Chloride 100-106, CO2 24-28, Calcium 9.2-10.0, Alk Phos 70-100, AST 0-38, ALT 0-48, Total Protein 5.7-8.2, Albumin 3.2-4.8, Total Bilirubin 0.3-1.2, Globulin 2.1-3.6, GFR 60-89, Magnesium 2.0-2.6, Phosphorus 3.4-4.0.
Cholesterol: Total 160-220, Triglycerides 0-100, HDL 55-100, LDL 0-99, VLDL 0-35.
Metabolic: Insulin 2-6, HbA1c 5.0-5.6, Leptin 4-12, Adiponectin 5-37, GGT 10-26, LDH 140-200, Uric Acid Male 2.5-7.0, Uric Acid Female 3.5-6.0.
Thyroid: TSH 1.0-2.5, Total T4 4.5-12, Free T4 1.1-1.8, Total T3 100-180, Free T3 3.2-4.4, Reverse T3 9.2-24.1, TBG 16-32, TPO Antibody 0-34, Thyroglobulin Antibody 0.0-4.0.
Anemia Panel: Iron Male 85-135, Iron Female 85-130, TIBC 250-350, % Saturation 15-55, Ferritin Male 70-200, Ferritin Female PeriMenopause 70-120, Ferritin Female PostMenopause 70-150, Folate 140-628.`,

  gimap: `Bacterial Pathogens (all want below threshold): Campylobacter <1e3, C.diff Toxin A <1e3, C.diff Toxin B <1e3, E.coli O157 <1e3, Salmonella <1e4, H.pylori <1e3, H.pylori Virulence Factors Negative.
Parasites: Cryptosporidium <1e6, Giardia <5e3, Entamoeba histolytica <1e4.
Keystone Bacteria (optimal ranges): Bacteroides fragilis 1.6e9-2.5e11, Bifidobacterium >6.7e7, Enterococcus 1.9e5-2.0e8, Escherichia 3.7e6-3.8e9, Lactobacillus 8.6e5-6.2e8, Akkermansia 1.0e1-8.2e6, Faecalibacterium prausnitzii 1e3-5e8, Roseburia 5e7-2e10.
Commensal Overgrowth (want low): Desulfovibrio <7.98e8, Methanobacteriaceae <3.38e8.
Fungi/Yeast: Candida <5e3, Candida albicans <5e2.
Inflammatory Bacteria (want low): Klebsiella <5e3, Citrobacter <5e6, Proteus <5e4.`,

  dutch: `Hormones: Estradiol E2 premenopause 1.8-4.5, Estradiol E2 postmenopause 0.2-0.7, Progesterone premenopause 6.0-20.0, Progesterone postmenopause 0.3-2.0, Testosterone 2.3-14.0.
DHEA by age: 20-39 = 1300-3000, 40-60 = 750-2000, >60 = 500-1200.
Cortisol: 24hr Free Cortisol 65-200, Metabolized Cortisol 2750-6500, Free Cortisol Morning 10-50, Free Cortisol 2nd Morning 30-130, Free Cortisol Evening 7-30, Free Cortisol Night 0-14.
Cortisone: 24hr Free Cortisone 220-450, Cortisone Morning 40-120, Cortisone 2nd Morning 90-230, Cortisone Evening 32-110, Cortisone Night 0-55.
Estrogen Metabolites: Estrone E1 12-26, Estriol E3 5-18, Total Estrogen 35-70, Total Estrogen PostMenopause 4.0-15. 2-OH-E1 5.1-13.1, 4-OH-E1 <1.8, 16-OH-E1 0.7-2.6, 2-Methoxy-E1 2.5-6.5, 2-OH-E2 <1.2, 4-OH-E2 <0.5.
DHEA-S: Age 20-39 60-750, Age 40-60 30-350, Age >60 20-150.
Testosterone by Age: 20-39 = 3.2-14, 40-60 = 2.3-8, >60 = 1.5-6.3.
Progesterone Metabolites: b-Pregnanediol premenopause 600-2000, b-Pregnanediol postmenopause 60-200, a-Pregnanediol premenopause 200-740, a-Pregnanediol postmenopause 15-50.
Melatonin 10-85.`,

  htma: `Minerals: Calcium 38-48, Magnesium 4.0-8.0, Sodium 16-30, Potassium 6-14, Copper 1.0-2.0, Zinc 14-18, Phosphorus 14-18, Iron 1.2-1.8, Manganese 0.02-0.10, Chromium 0.03-0.07, Selenium 0.06-0.10, Cobalt 0.002-0.004, Molybdenum 0.003-0.007, Sulfur 4300-5000, Lithium 0.002-0.006, Boron 0.30-0.70.
Mineral Ratios: Ca/P Autonomic Balance 2.4-2.80, Na/K Vitality 2.20-2.70, Ca/K Thyroid Function 3.80-4.40, Zn/Cu Hormone Balance 7.00-9.00, Na/Mg Adrenal Function 3.50-5.00, Ca/Mg Blood Sugar 4.50-8.50, Fe/Cu Immune Response 0.80-1.10.
Heavy Metals (all want below threshold): Uranium <0.0123, Arsenic <0.014, Mercury <0.15, Cadmium <0.008, Lead <0.20, Aluminum <2.0, Beryllium <0.003.`,

  oats: `Intestinal Microbial Overgrowth: Citramalic 0-3.6, 5-Hydroxymethyl-2-furoic 0-14, 3-Oxoglutaric 0-0.33, Furan-2,5-dicarboxylic 0-16, Tartaric 0-4.5, Arabinose 0-29, Carboxycitric 0-29, Tricarballylic 0-0.44, Hippuric 0-613, HPHPA 0-208, 4-Cresol 0-75.
Oxalate Metabolites: Glyceric 0.77-7.0, Glycolic 16-117, Oxalic 6.8-101.
Glycolytic Cycle: Lactic 0-48, Pyruvic 0-9.1.
Krebs Cycle Mitochondrial: Succinic 0-9.3, Fumaric 0-0.94, Malic 0.06-1.8, 2-Oxoglutaric 0-35, Aconitic 6.8-28, Citric 0-507.
Neurotransmitter Metabolites: Homovanillic HVA 0.8-3.6, Vanillylmandelic VMA 0.46-3.7, HVA/VMA Ratio 0.16-1.8, DOPAC 0.08-3.5, 5-HIAA 0-4.3, Quinolinic 0.85-3.9, Kynurenic 0-2.2.
Nutritional: Methylmalonic MMA-B12 0-2.3, Pyridoxic-B6 0-34, Pantothenic-B5 0-10, Glutaric-B2 0.04-0.36, Ascorbic-C 10-200, CoQ10 marker 0.17-39, Methylcitric-Biotin 0.19-2.7.
Detoxification: Pyroglutamic-Glutathione 10-33, 2-Hydroxybutyric 0.03-1.8, Orotic-Ammonia 0.06-0.54, 2-Hydroxyhippuric 0-1.3.
Folate Metabolism: Uracil 0-9.7, Thymine 0-0.56.
Fatty Acid Oxidation: Ethylmalonic 0.44-2.8, Adipic 0.04-3.8, 3-Hydroxybutyric 0-3.1, Suberic 0.18-2.2, Sebacic 0-0.24, Methylsuccinic 0.10-2.2.`
};

const PANEL_LABELS = {
  blood: 'Blood Labs',
  gimap: 'GI-MAP',
  dutch: 'DUTCH Complete',
  htma:  'HTMA',
  oats:  'OATs'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, panel, fileData, fileType } = req.body;

    if (!sessionId || !panel || !fileData) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // ── 1. Verify Stripe payment ───────────────────────────────────────────
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not confirmed. Please complete checkout first.' });
    }

    // ── 2. Call Anthropic API ──────────────────────────────────────────────
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const panelLabel = PANEL_LABELS[panel] || panel;
    const ranges = PANEL_RANGES[panel] || '';

    const systemPrompt = `You are an expert functional medicine practitioner working under the Jennifer Hawks Health brand. You specialize in ${panelLabel} interpretation through a FUNCTIONAL lens using these specific JHH Lab Ledger ranges:

${ranges}

Use ONLY these JHH ranges — not conventional lab ranges. Flag markers outside the JHH functional range as "flagged-high" or "flagged-low". Borderline = within 10% of the functional edge. Optimal = within the functional range.

Write in Jennifer Hawks Health's voice: warm, empowering, science-meets-soul. Speak directly to the patient. Emphasize root causes, patterns, and actionable next steps.

Respond ONLY with valid JSON — no preamble, no markdown fences:
{
  "panelType": "${panelLabel}",
  "functionalFlags": [
    {"marker": "name", "value": "patient value + units", "functionalRange": "JHH optimal range", "status": "optimal|borderline|flagged-high|flagged-low", "note": "1 warm functional sentence"}
  ],
  "summary": "3-4 sentence warm, insightful, empathetic summary of the overall pattern",
  "rootCauses": ["Root cause pattern 1 tied to specific markers", "..."],
  "nextSteps": ["Specific actionable step 1 with brief rationale", "..."]
}

Include ALL markers visible in the lab report. Give 3-6 root cause insights and 5-8 actionable next steps grounded in JHH protocols. No text outside the JSON object.`;

    const isImage = fileType && fileType.startsWith('image/');
    const mediaType = isImage ? fileType : 'application/pdf';

    const content = [
      {
        type: isImage ? 'image' : 'document',
        source: { type: 'base64', media_type: mediaType, data: fileData }
      },
      {
        type: 'text',
        text: `Analyze this ${panelLabel} report using JHH functional ranges and return JSON as specified.`
      }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    });

    const raw = response.content.map(b => b.text || '').join('');
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return res.status(200).json({ result });

  } catch (err) {
    console.error('Analyze error:', err.message);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}
