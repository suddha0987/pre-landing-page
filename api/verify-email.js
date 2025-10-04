import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ ok: false, error: 'Email required' });
    }

    try {
        const apiKey = process.env.VALIDKIT_API_KEY; // set in Vercel env
        // POST request to ValidKit API
        const vkRes = await fetch('https://api.validkit.com/v1/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const vkData = await vkRes.json();

        // Debug log (check on Vercel logs after submit)
        console.log('ValidKit API Raw Response:', JSON.stringify(vkData));

        // Flexible parsing: check multiple possible fields
        const isValid =
            (vkData.result && vkData.result.toLowerCase() === 'deliverable') ||
            (vkData.status && vkData.status.toLowerCase() === 'valid') ||
            (vkData.is_valid === true) ||
            (vkData.deliverable === true);

        if (isValid) {
            return res.json({ ok: true, redirect: 'https://lockverify.org/cl/i/1x51rk' });
        } else {
            return res.json({ ok: false, error: 'Invalid email' });
        }

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
}
