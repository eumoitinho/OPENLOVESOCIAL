import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Variáveis de ambiente não configuradas" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar buckets existentes
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json(
        { error: "Erro ao listar buckets: " + bucketsError.message },
        { status: 500 }
      )
    }

    // Verificar buckets específicos
    const requiredBuckets = ['avatars', 'covers', 'posts', 'messages']
    const existingBuckets = buckets.map(b => b.name)
    const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b))

    // Testar upload para bucket avatars se existir
    let uploadTest = null
    if (existingBuckets.includes('avatars')) {
      try {
        // Criar uma imagem de teste simples (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        const testBuffer = Buffer.from(testImageBase64, 'base64')
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload('test.png', testBuffer, {
            contentType: 'image/png',
            upsert: true
          })

        if (!uploadError) {
          // Deletar arquivo de teste
          await supabase.storage.from('avatars').remove(['test.png'])
          uploadTest = { success: true, message: "Upload de teste bem-sucedido" }
        } else {
          uploadTest = { success: false, error: uploadError.message }
        }
      } catch (error) {
        uploadTest = { success: false, error: (error as Error).message }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        existingBuckets,
        missingBuckets,
        requiredBuckets,
        uploadTest,
        totalBuckets: buckets.length
      }
    })

  } catch (error) {
    console.error("Erro ao verificar storage:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error as Error).message },
      { status: 500 }
    )
  }
} 