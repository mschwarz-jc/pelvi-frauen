const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { name, email, tel, answers } = req.body || {};
  if (!name || !email) return res.status(400).json({ ok: false, error: 'Missing fields' });

  const answersText = Array.isArray(answers)
    ? answers.map(a => `
        <div style="padding:10px 0;border-bottom:1px solid #f5f0ea">
          <div style="font-size:12px;color:#aaa;margin-bottom:4px">${a.question}</div>
          <div style="font-size:14px;font-weight:600;color:#333">${Array.isArray(a.selected) ? a.selected.join(', ') : a.selected}</div>
        </div>`).join('')
    : '';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#C4956A;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:20px">Neuer Beckenboden-Lead</h2>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
        <table style="border-collapse:collapse;font-size:15px;width:100%">
          <tr><td style="padding:8px 20px 8px 0;color:#888;white-space:nowrap">Name</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding:8px 20px 8px 0;color:#888;white-space:nowrap">E-Mail</td><td>${email}</td></tr>
          <tr><td style="padding:8px 20px 8px 0;color:#888;white-space:nowrap">Telefon</td><td>${tel || '–'}</td></tr>
        </table>
        <hr style="margin:24px 0;border:none;border-top:1px solid #f0e4d4">
        <h3 style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px">Quiz-Antworten</h3>
        <div>${answersText}</div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: 'smtp.strato.de',
    port: 465,
    secure: true,
    auth: {
      user: process.env.STRATO_USER,
      pass: process.env.STRATO_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: '"PelviPower Quiz" <leads@johne-consulting.com>',
      to: ['leads.johne.consulting@gmail.com', 'sportclub.aspern@gmail.com'],
      subject: 'Pelvi-Lead von der Quiz-Landingpage',
      html
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send-lead] SMTP Fehler:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
