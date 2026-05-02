module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { nom, age, mensurations, instagram, lien } = req.body;

    if (!nom || !age) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }
    if (nom.length > 100) {
      return res.status(400).json({ error: 'Nom trop long.' });
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 99) {
      return res.status(400).json({ error: 'Âge invalide.' });
    }

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const htmlBody = `
      <h2 style="font-family:sans-serif">Nouvelle candidature Mannequin — Pharos Urban Fest</h2>
      <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
        <tr><td><strong>Prénom &amp; Nom</strong></td><td>${esc(nom)}</td></tr>
        <tr><td><strong>Âge</strong></td><td>${ageNum}</td></tr>
        <tr><td><strong>Mensurations</strong></td><td>${mensurations ? esc(mensurations) : '—'}</td></tr>
        <tr><td><strong>Instagram</strong></td><td>${instagram ? esc(instagram) : '—'}</td></tr>
        <tr><td><strong>Portfolio / Book</strong></td><td>${lien ? esc(lien) : '—'}</td></tr>
      </table>
    `;

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'gabrieldebeckerpro@gmail.com',
      subject: `Nouvelle candidature Mannequin Pharos — ${nom}`,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: "Erreur lors de l'envoi. Réessaie." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
};
