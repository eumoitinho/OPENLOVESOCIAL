import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/app/lib/database.types"

export async function POST(request: NextRequest) {
  try {
    const { programId, price } = await request.json()

    if (!programId || !price) {
      return NextResponse.json({ error: "Program ID e preço são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerComponentClient<Database>({ cookies })

    // Verificar usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Verificar se o programa existe
    const { data: program, error: programError } = await supabase
      .from("programs")
      .select("*")
      .eq("id", programId)
      .single()

    if (programError || !program) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 })
    }

    // Verificar se já está matriculado
    const { data: existingEnrollment } = await supabase
      .from("program_enrollments")
      .select("id")
      .eq("program_id", programId)
      .eq("user_id", user.id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "Já matriculado neste programa" }, { status: 400 })
    }

    // Verificar saldo do usuário (simulado)
    const { data: profile } = await supabase.from("users").select("wallet_balance").eq("id", user.id).single()

    if (!profile || (profile.wallet_balance || 0) < price) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
    }

    // Processar matrícula
    const { error: enrollmentError } = await supabase.from("program_enrollments").insert([
      {
        program_id: programId,
        user_id: user.id,
        price_paid: price,
        enrolled_at: new Date().toISOString(),
        status: "active",
        progress: 0,
      },
    ])

    if (enrollmentError) {
      throw enrollmentError
    }

    // Atualizar saldo do estudante
    await supabase
      .from("users")
      .update({
        wallet_balance: (profile.wallet_balance || 0) - price,
      })
      .eq("id", user.id)

    // Atualizar ganhos do mentor (80% para o mentor)
    const mentorEarnings = price * 0.8
    await supabase.rpc("update_creator_earnings", {
      creator_id: program.user_id,
      amount: mentorEarnings,
    })

    // Atualizar contador de matrículas
    await supabase
      .from("programs")
      .update({
        enrollment_count: (program.enrollment_count || 0) + 1,
      })
      .eq("id", programId)

    return NextResponse.json({
      success: true,
      message: "Matrícula realizada com sucesso!",
    })
  } catch (error) {
    console.error("Erro na matrícula:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
