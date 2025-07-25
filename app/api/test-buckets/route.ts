import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/app/lib/supabase-server"

export async function GET(req: NextRequest) {
  try {
    console.log("=== TESTE DE BUCKETS ===")
    
    const supabase = createSupabaseAdmin()
    
    // Listar buckets existentes
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError)
      return NextResponse.json(
        { error: "Erro ao listar buckets", details: listError },
        { status: 500 }
      )
    }
    
    console.log("Buckets encontrados:", buckets?.map(b => b.name))
    
    // Verificar buckets específicos
    const requiredBuckets = ['avatars', 'covers']
    const existingBuckets = buckets?.map(b => b.name) || []
    const missingBuckets = requiredBuckets.filter(name => !existingBuckets.includes(name))
    
    // Tentar criar buckets faltantes
    const createdBuckets = []
    for (const bucketName of missingBuckets) {
      try {
        console.log(`Tentando criar bucket: ${bucketName}`)
        
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 10485760, // 10MB
        })
        
        if (error) {
          console.error(`Erro ao criar bucket ${bucketName}:`, error)
        } else {
          console.log(`Bucket ${bucketName} criado com sucesso`)
          createdBuckets.push(bucketName)
        }
      } catch (error) {
        console.error(`Erro ao tentar criar bucket ${bucketName}:`, error)
      }
    }
    
    // Teste de upload simples
    const testUploads = []
    for (const bucketName of requiredBuckets) {
      try {
        // Criar um arquivo de teste pequeno
        const testContent = Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')
        
        const testFileName = `test-${Date.now()}.png`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(testFileName, testContent, {
            contentType: 'image/png',
            upsert: true
          })
        
        if (uploadError) {
          console.error(`Erro no teste de upload para ${bucketName}:`, uploadError)
          testUploads.push({ bucket: bucketName, success: false, error: uploadError.message })
        } else {
          console.log(`Teste de upload para ${bucketName} bem-sucedido`)
          
          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(testFileName)
          
          testUploads.push({ bucket: bucketName, success: true, url: publicUrl })
          
          // Limpar arquivo de teste
          await supabase.storage.from(bucketName).remove([testFileName])
        }
      } catch (error) {
        console.error(`Erro geral no teste para ${bucketName}:`, error)
        testUploads.push({ bucket: bucketName, success: false, error: (error as Error).message })
      }
    }
    
    return NextResponse.json({
      success: true,
      buckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })),
      missingBuckets,
      createdBuckets,
      testUploads,
      message: "Teste de buckets concluído"
    })

  } catch (error) {
    console.error("=== ERRO NO TESTE DE BUCKETS ===")
    console.error("Erro:", error)
    
    return NextResponse.json(
      { 
        error: "Erro interno no teste de buckets",
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}