const dns = require('dns').promises;

module.exports = async (req, res) => {
  const { email } = req.query;
  if (!email || !email.includes('@')) return res.status(400).json({ valid: false });

  const domain = email.split('@')[1];
  try {
    const records = await dns.resolveMx(domain);
    res.json({ valid: records && records.length > 0 });
  } catch {
    res.json({ valid: false });
  }
};
