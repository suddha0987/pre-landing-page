export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false });
  }

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ valid: false });

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log('Regex validation:', isValid);
  return res.status(200).json({ valid: isValid });
}
