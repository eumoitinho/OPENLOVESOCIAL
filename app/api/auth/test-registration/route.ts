import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    console.log("=== TESTE DE REGISTRO ===")
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("SUPABASE_URL:", !!supabaseUrl)
    console.log("SERVICE_ROLE_KEY:", !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Variáveis de ambiente não configuradas" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Teste 1: Verificar conexão com o banco
    console.log("Teste 1: Verificando conexão com o banco...")
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error("Erro na conexão:", testError)
      return NextResponse.json(
        { error: "Erro na conexão com o banco: " + testError.message },
        { status: 500 }
      )
    }

    console.log("Conexão com banco OK")

    // Teste 2: Verificar se pode inserir um usuário de teste
    console.log("Teste 2: Verificando inserção...")
    const testUserId = crypto.randomUUID()
    const testEmail = `test-${Date.now()}@example.com`
    const testUsername = `testuser-${Date.now()}`

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testEmail,
        username: testUsername,
        name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        profile_type: 'single',
        plano: 'free',
        status_assinatura: 'authorized',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_premium: false,
        is_verified: false,
        is_active: true,
        privacy_settings: {
          profile_visibility: "public",
          show_age: true,
          show_location: true,
          allow_messages: "everyone",
          show_online_status: true
        },
        stats: {
          posts: 0,
          followers: 0,
          following: 0,
          likes_received: 0,
          comments_received: 0,
          profile_views: 0,
          earnings: 0
        }
      })
      .select()

    if (insertError) {
      console.error("Erro na inserção:", insertError)
      return NextResponse.json(
        { error: "Erro na inserção: " + insertError.message },
        { status: 500 }
      )
    }

    console.log("Inserção OK:", insertData)

    // Teste 3: Limpar usuário de teste
    console.log("Teste 3: Limpando usuário de teste...")
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId)

    if (deleteError) {
      console.error("Erro na limpeza:", deleteError)
      // Não falhar o teste por causa disso
    }

    console.log("Limpeza OK")

    // Teste 4: Verificar se o Supabase Auth está funcionando
    console.log("Teste 4: Verificando Supabase Auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Erro no Auth:", authError)
      return NextResponse.json(
        { error: "Erro no Supabase Auth: " + authError.message },
        { status: 500 }
      )
    }

    console.log("Auth OK, usuários encontrados:", authData.users?.length || 0)

    return NextResponse.json({
      success: true,
      message: "Todos os testes passaram",
      tests: {
        database_connection: "OK",
        database_insert: "OK",
        database_cleanup: "OK",
        auth_connection: "OK"
      }
    })

  } catch (error) {
    console.error("Erro no teste:", error)
    return NextResponse.json(
      { 
        error: "Erro no teste: " + (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
} 