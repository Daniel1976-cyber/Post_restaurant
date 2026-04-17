const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oyurzisrjxxdqkxcxzae.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXJ6aXNyanh4ZHFreGN4emFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzI5NjQsImV4cCI6MjA5MTUwODk2NH0.LFZiRwZNTpNh07Zdx2XgruCUmJbSv8O0NnklXw8Px_o'
);

(async () => {
  const email = 'mesero_test_2026@example.com';
  const password = 'Password123!';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  console.log('login error:', error);
  console.log('login data user id:', data?.user?.id);

  if (data?.user?.id) {
    const { data: perfil, error: perfilError } = await supabase.from('perfiles').select('rol').eq('id', data.user.id).single();
    console.log('perfil error:', perfilError);
    console.log('perfil:', perfil);
  }
})();
