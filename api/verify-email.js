import fetch from 'node-fetch';

export default async function handler(req, res) {
    if(req.method !== 'POST') return res.status(405).json({ok:false, error:'Method not allowed'});

    const { email } = req.body;
    if(!email) return res.status(400).json({ok:false, error:'Email required'});

    try {
        // ValidKit API call
        const apiKey = process.env.VALIDKIT_API_KEY; // set in Vercel env
        const vkRes = await fetch(`https://api.validkit.com/v1/verify?email=${encodeURIComponent(email)}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const vkData = await vkRes.json();

        // Check if email is valid
        if(vkData.status === 'valid'){
            return res.json({ok:true, redirect: 'https://lockverify.org/cl/i/1x51rk'});
        } else {
            return res.json({ok:false, error:'Invalid email'});
        }
    } catch(err){
        console.error(err);
        return res.status(500).json({ok:false, error:'Server error'});
    }
}
