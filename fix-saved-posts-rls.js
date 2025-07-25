require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey ? 'Presente' : 'Ausente')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixSavedPostsRLS() {
  console.log('Aplicando políticas RLS para saved_posts...')
  
  const queries = [
    `CREATE POLICY IF NOT EXISTS "saved_posts_read_own" ON public.saved_posts
      FOR SELECT
      TO authenticated
      USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))`,
      
    `CREATE POLICY IF NOT EXISTS "saved_posts_insert_own" ON public.saved_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))`,
      
    `CREATE POLICY IF NOT EXISTS "saved_posts_delete_own" ON public.saved_posts
      FOR DELETE
      TO authenticated
      USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))`,
      
    `CREATE POLICY IF NOT EXISTS "service_role_bypass_saved_posts" ON public.saved_posts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true)`
  ]
  
  for (const query of queries) {
    try {
      console.log('Executando:', query.substring(0, 80) + '...')
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Erro:', error)
      } else {
        console.log('✓ Sucesso')
      }
    } catch (err) {
      console.error('Erro ao executar query:', err)
    }
  }
  
  console.log('Testando inserção em saved_posts...')
  
  // Test insert to see if RLS is working
  const { data, error } = await supabase
    .from('saved_posts')
    .insert({
      user_id: 'test-user-id',
      post_id: 'test-post-id'
    })
    .select()
  
  if (error) {
    console.log('Erro esperado (good):', error.message)
  } else {
    console.log('Inserção bem-sucedida:', data)
  }
}

fixSavedPostsRLS()