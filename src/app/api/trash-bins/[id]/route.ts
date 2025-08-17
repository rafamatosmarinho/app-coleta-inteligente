import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const bin = await db.trashBin.findUnique({
      where: { id: params.id },
      include: {
        collections: {
          orderBy: { collectedAt: "desc" },
          take: 5
        }
      }
    })

    if (!bin) {
      return NextResponse.json(
        { error: "Lixeira não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(bin)
  } catch (error) {
    console.error("Erro ao buscar lixeira:", error)
    return NextResponse.json(
      { error: "Erro ao buscar lixeira" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { currentLevel, batteryLevel, status } = body

    const bin = await db.trashBin.update({
      where: { id: params.id },
      data: {
        ...(currentLevel !== undefined && { currentLevel }),
        ...(batteryLevel !== undefined && { batteryLevel }),
        ...(status && { status })
      }
    })

    return NextResponse.json(bin)
  } catch (error) {
    console.error("Erro ao atualizar lixeira:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar lixeira" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await db.trashBin.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Lixeira deletada com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar lixeira:", error)
    return NextResponse.json(
      { error: "Erro ao deletar lixeira" },
      { status: 500 }
    )
  }
}