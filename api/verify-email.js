// api/verify-email.js

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      valid: false,
      message: 'Method not allowed' 
    });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      valid: false,
      message: 'Email is required'
    });
  }

  try {
    // Get API key from environment
    const apiKey = process.env.VALIDKIT_KEY;

    if (!apiKey) {
      console.error('VALIDKIT_KEY not found in environment');
      return res.status(500).json({
        valid: false,
        message: 'Server configuration error'
      });
    }

    // Call Validkit API
    const validkitUrl = `https://api.validkit.io/v1/verify?email=${encodeURIComponent(email)}`;
    
    const response = await fetch(validkitUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey
      }
    });

    if (!response.ok) {
      console.error('Validkit API error:', response.status);
      return res.status(200).json({
        valid: false,
        message: 'Email verification service error'
      });
    }

    const data = await response.json();
    console.log('Validkit response:', JSON.stringify(data));

    // Check 1: Disposable email
    if (data.disposable === true) {
      return res.status(200).json({
        valid: false,
        message: 'Disposable/temporary emails are not allowed'
      });
    }

    // Check 2: Email validity
    if (data.valid === false) {
      return res.status(200).json({
        valid: false,
        message: 'This email address is invalid'
      });
    }

    // Check 3: SMTP verification - MANDATORY
    if (data.smtp_check === false) {
      return res.status(200).json({
        valid: false,
        message: 'This email address does not exist'
      });
    }

    // If smtp_check is undefined, also reject
    if (data.smtp_check !== true) {
      return res.status(200).json({
        valid: false,
        message: 'Unable to verify this email address'
      });
    }

    // Check 4: MX records
    if (data.mx_found === false) {
      return res.status(200).json({
        valid: false,
        message: 'This domain cannot receive emails'
      });
    }

    // Check 5: Risk score - STRICT (50+)
    if (data.risk_score && data.risk_score >= 50) {
      return res.status(200).json({
        valid: false,
        message: 'This email appears to be high-risk or fake'
      });
    }

    // Check 6: Quality score
    if (data.quality_score && data.quality_score < 50) {
      return res.status(200).json({
        valid: false,
        message: 'This email has low quality score'
      });
    }

    // Check 7: Deliverability
    if (data.deliverable === false) {
      return res.status(200).json({
        valid: false,
        message: 'This email cannot receive messages'
      });
    }

    // All checks passed
    return res.status(200).json({
      valid: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Failed to verify email. Please try again.'
    });
  }
}
