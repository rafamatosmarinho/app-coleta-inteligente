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

    const routes = await db.collectionRoute.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bins: {
          include: {
            bin: true
          },
          orderBy: {
            order: "asc"
          }
        },
        collections: {
          include: {
            bin: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error("Erro ao buscar rotas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar rotas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERVISOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, binIds, scheduledAt, assignedTo } = body

    if (!name || !binIds || binIds.length === 0) {
      return NextResponse.json(
        { error: "Nome e lixeiras são obrigatórios" },
        { status: 400 }
      )
    }

    // Criar a rota
    const route = await db.collectionRoute.create({
      data: {
        name,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        assignedTo,
        status: "PLANNED"
      }
    })

    // Adicionar as lixeiras à rota
    const routeBins = await Promise.all(
      binIds.map((binId: string, index: number) =>
        db.routeBin.create({
          data: {
            routeId: route.id,
            binId,
            order: index,
            status: "PENDING"
          }
        })
      )
    )

    return NextResponse.json({ ...route, bins: routeBins }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar rota:", error)
    return NextResponse.json(
      { error: "Erro ao criar rota" },
      { status: 500 }
    )
  }
}