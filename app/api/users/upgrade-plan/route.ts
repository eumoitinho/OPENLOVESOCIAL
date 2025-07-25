import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, newPlan, currentPlan } = await request.json()

    if (!userId || !newPlan) {
      return NextResponse.json(
        { error: 'User ID e novo plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar planos válidos
    const validPlans = ['free', 'gold', 'diamond', 'diamond_annual']
    if (!validPlans.includes(newPlan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, premium_type, premium_status, email, name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se é realmente um upgrade
    const planHierarchy = { free: 0, gold: 1, diamond: 2, diamond_annual: 2 }
    const currentPlanLevel = planHierarchy[user.premium_type as keyof typeof planHierarchy] || 0
    const newPlanLevel = planHierarchy[newPlan as keyof typeof planHierarchy]

    if (newPlanLevel <= currentPlanLevel && newPlan !== 'diamond_annual') {
      return NextResponse.json(
        { error: 'Não é possível fazer downgrade. Entre em contato com o suporte.' },
        { status: 400 }
      )
    }

    // Atualizar o plano do usuário para status pending (aguardando pagamento)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        premium_type: newPlan,
        premium_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erro ao atualizar plano:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar plano' },
        { status: 500 }
      )
    }

    // Registrar a tentativa de upgrade no histórico
    try {
      await supabase
        .from('plan_changes')
        .insert({
          user_id: userId,
          from_plan: user.premium_type || 'free',
          to_plan: newPlan,
          status: 'pending',
          created_at: new Date().toISOString()
        })
    } catch (historyError) {
      console.error('Erro ao registrar histórico:', historyError)
      // Não falhar a operação por causa disso
    }

    return NextResponse.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      data: {
        userId,
        previousPlan: user.premium_type,
        newPlan,
        status: 'pending'
      }
    })

  } catch (error) {
    console.error('Erro no upgrade de plano:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar informações do usuário atual
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, premium_type, premium_status, email, name, created_at')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar histórico de mudanças de plano
    const { data: planHistory } = await supabase
      .from('plan_changes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Definir opções de upgrade disponíveis
    const upgradeOptions = []
    const currentPlan = user.premium_type || 'free'

    if (currentPlan === 'free') {
      upgradeOptions.push(
        { 
          plan: 'gold', 
          name: 'Gold',
          price: 'R$ 25,00/mês',
          description: 'Recursos básicos premium' 
        },
        { 
          plan: 'diamond', 
          name: 'Diamond',
          price: 'R$ 45,90/mês',
          description: 'Todos os recursos premium' 
        },
        { 
          plan: 'diamond_annual', 
          name: 'Diamond Anual',
          price: 'R$ 459,00/ano',
          description: 'Diamond com desconto anual' 
        }
      )
    } else if (currentPlan === 'gold') {
      upgradeOptions.push(
        { 
          plan: 'diamond', 
          name: 'Diamond',
          price: 'R$ 45,90/mês',
          description: 'Upgrade para todos os recursos' 
        },
        { 
          plan: 'diamond_annual', 
          name: 'Diamond Anual',
          price: 'R$ 459,00/ano',
          description: 'Diamond com desconto anual' 
        }
      )
    } else if (currentPlan === 'diamond') {
      upgradeOptions.push(
        { 
          plan: 'diamond_annual', 
          name: 'Diamond Anual',
          price: 'R$ 459,00/ano',
          description: 'Mude para cobrança anual' 
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currentPlan: user.premium_type || 'free',
          planStatus: user.premium_status || 'active',
          memberSince: user.created_at
        },
        upgradeOptions,
        planHistory: planHistory || []
      }
    })

  } catch (error) {
    console.error('Erro ao buscar opções de upgrade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}