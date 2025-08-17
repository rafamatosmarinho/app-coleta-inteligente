import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const collections = await db.collection.findMany({
      include: {
        bin: true,
        route: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        collectedAt: "desc"
      },
      take: 50
    })

    return NextResponse.json(collections)
  } catch (error) {
    console.error("Erro ao buscar coletas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar coletas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { binId, routeId, amount, notes } = body

    if (!binId) {
      return NextResponse.json(
        { error: "ID da lixeira é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar a lixeira para verificar o nível atual
    const bin = await db.trashBin.findUnique({
      where: { id: binId }
    })

    if (!bin) {
      return NextResponse.json(
        { error: "Lixeira não encontrada" },
        { status: 404 }
      )
    }

    // Registrar a coleta
    const collection = await db.collection.create({
      data: {
        binId,
        routeId: routeId || null,
        collectedBy: session.user.id,
        amount: amount || bin.currentLevel,
        notes: notes || null
      }
    })

    // Atualizar a lixeira - zerar o nível e atualizar a data da última coleta
    await db.trashBin.update({
      where: { id: binId },
      data: {
        currentLevel: 0,
        lastEmptiedAt: new Date()
      }
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar coleta:", error)
    return NextResponse.json(
      { error: "Erro ao registrar coleta" },
      { status: 500 }
    )
  }
}