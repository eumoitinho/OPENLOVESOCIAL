import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, username, is_verified')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if user is already verified
    if (currentUser.is_verified) {
      return NextResponse.json(
        { error: 'Usuário já está verificado' },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const requestId = formData.get('request_id') as string
    const photoFile = formData.get('photo') as File

    if (!requestId || !photoFile) {
      return NextResponse.json(
        { error: 'ID da solicitação e foto são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSizeMB = 10
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (!allowedTypes.includes(photoFile.type)) {
      return NextResponse.json(
        { 
          error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.',
          allowed_types: allowedTypes
        },
        { status: 400 }
      )
    }

    if (photoFile.size > maxSizeBytes) {
      return NextResponse.json(
        { 
          error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
          file_size: photoFile.size,
          max_size: maxSizeBytes
        },
        { status: 400 }
      )
    }

    // Get and validate verification request
    const { data: verificationRequest, error: requestError } = await supabase
      .from('verification_requests')
      .select('id, status, expires_at, verification_code, user_id')
      .eq('id', requestId)
      .eq('user_id', currentUser.id)
      .single()

    if (requestError || !verificationRequest) {
      return NextResponse.json(
        { error: 'Solicitação de verificação não encontrada' },
        { status: 404 }
      )
    }

    // Check if request is still valid
    if (verificationRequest.status !== 'pending') {
      return NextResponse.json(
        { 
          error: 'Esta solicitação não pode mais receber fotos',
          current_status: verificationRequest.status
        },
        { status: 400 }
      )
    }

    if (new Date(verificationRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Esta solicitação de verificação expirou' },
        { status: 400 }
      )
    }

    // Upload photo to Supabase Storage
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `verification_${verificationRequest.id}_${Date.now()}.${fileExt}`
    const filePath = `verification-photos/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-photos')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading photo:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload da foto' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('verification-photos')
      .getPublicUrl(uploadData.path)

    // Update verification request with photo
    const { data: updatedRequest, error: updateError } = await supabase
      .from('verification_requests')
      .update({
        photo_url: urlData.publicUrl,
        photo_metadata: {
          original_name: photoFile.name,
          file_size: photoFile.size,
          file_type: photoFile.type,
          uploaded_at: new Date().toISOString()
        },
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating verification request:', updateError)
      
      // Try to clean up uploaded file
      await supabase.storage
        .from('verification-photos')
        .remove([uploadData.path])

      return NextResponse.json(
        { error: 'Erro ao processar solicitação' },
        { status: 500 }
      )
    }

    // Log photo submission in history
    await supabase
      .from('verification_history')
      .insert({
        user_id: currentUser.id,
        request_id: requestId,
        action: 'photo_submitted',
        details: {
          photo_url: urlData.publicUrl,
          file_name: photoFile.name,
          file_size: photoFile.size,
          file_type: photoFile.type
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    // Create notification for admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'verification_submitted',
        title: 'Nova verificação enviada',
        content: `${currentUser.username} enviou uma foto para verificação`,
        action_url: `/admin/verification/${requestId}`,
        related_data: {
          verification_request_id: requestId,
          user_id: currentUser.id,
          username: currentUser.username
        }
      }))

      await supabase
        .from('notifications')
        .insert(notifications)
    }

    return NextResponse.json({
      success: true,
      data: {
        request_id: requestId,
        photo_url: urlData.publicUrl,
        status: 'submitted',
        submitted_at: updatedRequest?.submitted_at,
        message: 'Foto enviada com sucesso! Nossa equipe analisará em até 48 horas.'
      }
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('request_id')

    if (!requestId) {
      return NextResponse.json(
        { error: 'ID da solicitação é obrigatório' },
        { status: 400 }
      )
    }

    // Get verification request
    const { data: verificationRequest, error: requestError } = await supabase
      .from('verification_requests')
      .select('id, user_id, photo_url, status')
      .eq('id', requestId)
      .single()

    if (requestError || !verificationRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Check permissions (owner or admin)
    if (verificationRequest.user_id !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta foto' },
        { status: 403 }
      )
    }

    // Check if request allows photo deletion
    if (!['pending', 'submitted'].includes(verificationRequest.status)) {
      return NextResponse.json(
        { error: 'Não é possível deletar foto neste estado' },
        { status: 400 }
      )
    }

    // Delete photo from storage if exists
    if (verificationRequest.photo_url) {
      const photoPath = verificationRequest.photo_url.split('/').pop()
      if (photoPath) {
        await supabase.storage
          .from('verification-photos')
          .remove([`verification-photos/${photoPath}`])
      }
    }

    // Update verification request
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        photo_url: null,
        photo_metadata: null,
        status: 'pending',
        submitted_at: null
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating verification request:', updateError)
      return NextResponse.json(
        { error: 'Erro ao processar solicitação' },
        { status: 500 }
      )
    }

    // Log photo deletion in history
    await supabase
      .from('verification_history')
      .insert({
        user_id: verificationRequest.user_id,
        request_id: requestId,
        action: 'photo_deleted',
        performed_by: currentUser.id,
        details: {
          deleted_photo_url: verificationRequest.photo_url,
          deleted_by: currentUser.role === 'admin' ? 'admin' : 'user'
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    return NextResponse.json({
      success: true,
      message: 'Foto deletada com sucesso'
    })

  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
