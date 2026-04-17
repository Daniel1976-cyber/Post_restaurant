const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oyurzisrjxxdqkxcxzae.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXJ6aXNyanh4ZHFreGN4emFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzI5NjQsImV4cCI6MjA5MTUwODk2NH0.LFZiRwZNTpNh07Zdx2XgruCUmJbSv8O0NnklXw8Px_o'
);

(async () => {
  const { data, error } = await supabase.from('perfiles').select('id,rol').limit(20);
  console.log('error:', error);
  console.log('data:', JSON.stringify(data, null, 2));
})();
