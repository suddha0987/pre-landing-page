// api/verify-email.js

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
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

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(200).json({
      valid: false,
      message: 'Invalid email format'
    });
  }

  const domain = email.split('@')[1].toLowerCase();
  const username = email.split('@')[0].toLowerCase();

  // Blocked disposable domains
  const blockedDomains = [
    'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
    'mailinator.com', 'trashmail.com', 'maildrop.cc', 'getnada.com',
    'temp-mail.org', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com',
    'guerrillamail.info', 'grr.la', 'spam4.me', 'tempinbox.com',
    'mohmal.com', 'emailondeck.com', 'dispostable.com', 'trash-mail.com'
  ];

  // Allowed trusted domains
  const allowedDomains = [
    'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com',
    'msn.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'ymail.com',
    'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com',
    'proton.me', 'zoho.com', 'mail.com', 'gmx.com', 'yandex.com',
    'rediffmail.com', 'inbox.com', 'fastmail.com'
  ];

  // Check blocked
  if (blockedDomains.includes(domain)) {
    return res.status(200).json({
      valid: false,
      message: 'Disposable emails are not allowed'
    });
  }

  // Check allowed
  if (!allowedDomains.includes(domain)) {
    return res.status(200).json({
      valid: false,
      message: 'Please use a trusted email provider'
    });
  }

  // Check suspicious patterns
  if (/^[a-z]{10,}$/.test(username) || /^[0-9]{7,}$/.test(username)) {
    return res.status(200).json({
      valid: false,
      message: 'Suspicious email pattern detected'
    });
  }

  // Check suspicious keywords
  const suspiciousKeywords = ['test', 'fake', 'temp', 'trash', 'spam', 'junk'];
  if (suspiciousKeywords.some(keyword => username.includes(keyword))) {
    return res.status(200).json({
      valid: false,
      message: 'Please use a real email address'
    });
  }

  // All checks passed
  return res.status(200).json({
    valid: true,
    message: 'Email verified successfully'
  });
}
