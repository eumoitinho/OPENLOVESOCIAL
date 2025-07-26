import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Notifications route working',
      data: []
    })
  } catch (error) {
    console.error("Erro no endpoint de notificações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'POST notifications route working'
    })
  } catch (error) {
    console.error("Erro no endpoint de notificações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 