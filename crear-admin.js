const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://oyurzisrjxxdqkxcxzae.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXJ6aXNyanh4ZHFreGN4emFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkzMjk2NCwiZXhwIjoyMDkxNTA4OTY0fQ.dspjNRFGk9FVej1Cr_Vnp5xx308tvjdf4RloGNcKZm0',
  { auth: { autoRefreshToken: false } }
);

(async () => {
  const email = 'admin@example.com';
  const password = 'Admin123!';

  console.log('Creando usuario admin...');
  
  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userError) {
      console.error('Error creando usuario:', userError.message);
      return;
    }

    const userId = userData.user.id;
    console.log('Usuario creado:', userId);

    const { error: perfilError } = await supabaseAdmin.from('perfiles').insert([
      { id: userId, rol: 'admin' }
    ]);

    if (perfilError) {
      console.error('Error creando perfil:', perfilError.message);
      return;
    }

    console.log('✅ Usuario admin creado correctamente');
    console.log(`\nCrédenciales:\n  Email: ${email}\n  Password: ${password}\n`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
