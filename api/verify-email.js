export default async function handler(req, res) {
  // CORS headers - cross-origin requests ke liye
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request handle karo
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sirf POST method allow hai
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      valid: false,
      message: 'Method not allowed' 
    });
  }

  // Email body se lo
  const { email } = req.body;

  // Email check karo
  if (!email) {
    return res.status(400).json({
      valid: false,
      message: 'Email is required'
    });
  }

  try {
    // Environment variable se API key lo
    const apiKey = process.env.VALIDKIT_KEY;

    // API key check karo
    if (!apiKey) {
      console.error('VALIDKIT_KEY environment variable not found');
      return res.status(500).json({
        valid: false,
        message: 'Server configuration error'
      });
    }

    // Validkit API call
    const validkitUrl = `https://api.validkit.io/v1/verify?email=${encodeURIComponent(email)}`;
    
    const response = await fetch(validkitUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey
      }
    });

    // Response check karo
    if (!response.ok) {
      console.error('Validkit API error:', response.status, response.statusText);
      return res.status(200).json({
        valid: false,
        message: 'Email verification service error'
      });
    }

    // Response data parse karo
    const data = await response.json();
    console.log('Validkit API response:', JSON.stringify(data));

    // Check 1: Disposable email hai?
    if (data.disposable === true) {
      return res.status(200).json({
        valid: false,
        message: 'Disposable/temporary emails are not allowed'
      });
    }

    // Check 2: Email valid hai?
    if (data.valid === false) {
      return res.status(200).json({
        valid: false,
        message: 'Invalid email address'
      });
    }

    // Check 3: Risk score high hai?
    if (data.risk_score && data.risk_score > 70) {
      return res.status(200).json({
        valid: false,
        message: 'High-risk email detected'
      });
    }

    // Sab checks pass - email valid hai
    return res.status(200).json({
      valid: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    // Error handling
    console.error('Email verification error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Failed to verify email. Please try again.'
    });
  }
}
