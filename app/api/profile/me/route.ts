import { createServerComponentClient } from "@/app/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do perfil na tabela users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError)
      return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Erro na API profile/me GET:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.json()

    // Preparar dados para salvar
    const updateData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      birth_date: formData.birthDate,
      profile_type: formData.profileType,
      seeking: JSON.stringify(formData.seeking),
      interests: JSON.stringify(formData.interests),
      other_interest: formData.otherInterest,
      bio: formData.bio,
      partner_nickname: formData.partner.nickname,
      partner_age: formData.partner.age,
      partner_height: formData.partner.height,
      partner_weight: formData.partner.weight,
      partner_eye_color: formData.partner.eyeColor,
      partner_hair_color: formData.partner.hairColor,
      city: formData.city,
      uf: formData.uf,
      latitude: formData.latitude,
      longitude: formData.longitude,
      updated_at: new Date().toISOString()
    }

    // Atualizar perfil
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Perfil atualizado com sucesso' })
  } catch (error) {
    console.error('Erro na API profile/me PUT:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
