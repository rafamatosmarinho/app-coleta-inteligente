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

    const bins = await db.trashBin.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(bins)
  } catch (error) {
    console.error("Erro ao buscar lixeiras:", error)
    return NextResponse.json(
      { error: "Erro ao buscar lixeiras" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, location, latitude, longitude, capacity } = body

    if (!code || !name || !location || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    const bin = await db.trashBin.create({
      data: {
        code,
        name,
        location,
        latitude,
        longitude,
        capacity: capacity || 100,
        currentLevel: 0,
        batteryLevel: 100,
        status: "ACTIVE"
      }
    })

    return NextResponse.json(bin, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar lixeira:", error)
    return NextResponse.json(
      { error: "Erro ao criar lixeira" },
      { status: 500 }
    )
  }
}