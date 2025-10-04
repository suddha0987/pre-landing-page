export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ valid: false, message: 'No email provided' });

    // Simple regex email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return res.status(200).json({ valid: isValid });
  } catch (err) {
    console.error('verify-email error:', err);
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
}
