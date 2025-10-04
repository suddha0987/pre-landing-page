export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ valid: false, error: 'No email' });

    const API_KEY = process.env.VALIDKIT_API_KEY;
    if (!API_KEY) return res.status(500).json({ valid: false, error: 'Missing API key' });

    const response = await fetch(`https://api.validkit.com/v1/verify?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const data = await response.json();
    return res.status(200).json({ valid: !!data.is_valid });

  } catch (err) {
    console.error('verify-email error:', err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
      }
