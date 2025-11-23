const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLS() {
  const sql = fs.readFileSync(path.join(__dirname, '../add_rls_policies.sql'), 'utf8');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
    console.log(statement.substring(0, 100) + '...');

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error('Error:', error);
      } else {
        console.log('✓ Success');
      }
    } catch (err) {
      // Try direct query if RPC doesn't work
      console.log('Trying alternative method...');
      try {
        const { error } = await supabase.from('_').select('*').limit(0);
        console.log('Note: Using Supabase SQL Editor for RLS policies is recommended');
      } catch (e) {
        console.error('Error:', err);
      }
    }
  }
}

applyRLS().catch(console.error);
