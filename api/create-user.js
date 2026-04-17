const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, rol } = req.body;

  // We use environment variables to keep the Service Role Key secure on Vercel
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || 'https://oyurzisrjxxdqkxcxzae.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Create User in Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userError) return res.status(400).json({ error: userError.message });

    // 2. Insert into perfiles table
    const { error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .insert([{ id: userData.user.id, rol }]);

    if (perfilError) return res.status(500).json({ error: perfilError.message });

    return res.status(200).json({ ok: true, userId: userData.user.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
