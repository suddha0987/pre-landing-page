import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const vkKey = process.env.VALIDKIT_KEY; // Set in Vercel env vars
    const response = await fetch(`https://api.validkit.com/v1/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vkKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    // VK returns status: "valid", "disposable", "invalid", etc.
    if (data.status === 'valid') {
      return res.status(200).json({ status: 'valid' });
    } else {
      return res.status(200).json({ status: 'invalid' });
    }
  } catch (err) {
    console.error('ValidKit API error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to verify email' });
  }
}
