import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TYPE_LABELS = {
  createur: 'Créateur indépendant',
  friperie: 'Friperie / Vintage',
  retailer: 'Retailer / Boutique',
  etudiant: 'Étudiant en mode',
  autre: 'Autre',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, email, instagram, type, looks, ville, univers, lien } = req.body;

  if (!nom || !email || !type || !looks || !univers) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  const typeLabel = TYPE_LABELS[type] || type;

  const htmlBody = `
    <h2>Nouvelle candidature Pharos Urban Fest</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
      <tr><td><strong>Nom / Marque</strong></td><td>${nom}</td></tr>
      <tr><td><strong>Email</strong></td><td>${email}</td></tr>
      <tr><td><strong>Instagram</strong></td><td>${instagram || '—'}</td></tr>
      <tr><td><strong>Type de création</strong></td><td>${typeLabel}</td></tr>
      <tr><td><strong>Nombre de looks</strong></td><td>${looks}</td></tr>
      <tr><td><strong>Ville</strong></td><td>${ville || '—'}</td></tr>
      <tr><td><strong>Lien portfolio</strong></td><td>${lien || '—'}</td></tr>
    </table>
    <br/>
    <strong style="font-family:sans-serif">Univers créatif :</strong>
    <p style="font-family:sans-serif">${univers.replace(/\n/g, '<br/>')}</p>
  `;

  const { error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'gabrieldebeckerpro@gmail.com',
    replyTo: email,
    subject: `Nouvelle candidature Pharos — ${nom}`,
    html: htmlBody,
  });

  if (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: "Erreur lors de l'envoi. Réessaie." });
  }

  return res.status(200).json({ success: true });
}
