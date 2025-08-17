import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface Alert {
  id: string
  type: 'FULL_BIN' | 'LOW_BATTERY' | 'MAINTENANCE' | 'INACTIVE'
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  binId: string
  binName: string
  binLocation: string
  createdAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar todas as lixeiras para verificar alertas
    const bins = await db.trashBin.findMany({
      where: {
        status: {
          in: ["ACTIVE", "INACTIVE", "MAINTENANCE"]
        }
      }
    })

    const alerts: Alert[] = []

    // Gerar alertas baseados nas condições das lixeiras
    bins.forEach(bin => {
      // Alerta de lixeira cheia
      if (bin.status === "ACTIVE" && (bin.currentLevel / bin.capacity) >= 0.8) {
        alerts.push({
          id: `full-${bin.id}`,
          type: 'FULL_BIN',
          severity: 'HIGH',
          message: `Lixeira ${bin.name} está com ${Math.round((bin.currentLevel / bin.capacity) * 100)}% de capacidade`,
          binId: bin.id,
          binName: bin.name,
          binLocation: bin.location,
          createdAt: bin.updatedAt,
          acknowledged: false
        })
      }

      // Alerta de bateria baixa
      if (bin.batteryLevel < 20 && bin.status === "ACTIVE") {
        alerts.push({
          id: `battery-${bin.id}`,
          type: 'LOW_BATTERY',
          severity: bin.batteryLevel < 10 ? 'HIGH' : 'MEDIUM',
          message: `Bateria da lixeira ${bin.name} está com ${bin.batteryLevel}%`,
          binId: bin.id,
          binName: bin.name,
          binLocation: bin.location,
          createdAt: bin.updatedAt,
          acknowledged: false
        })
      }

      // Alerta de manutenção
      if (bin.status === "MAINTENANCE") {
        alerts.push({
          id: `maintenance-${bin.id}`,
          type: 'MAINTENANCE',
          severity: 'MEDIUM',
          message: `Lixeira ${bin.name} está em manutenção`,
          binId: bin.id,
          binName: bin.name,
          binLocation: bin.location,
          createdAt: bin.updatedAt,
          acknowledged: false
        })
      }

      // Alerta de inatividade
      if (bin.status === "INACTIVE") {
        alerts.push({
          id: `inactive-${bin.id}`,
          type: 'INACTIVE',
          severity: 'LOW',
          message: `Lixeira ${bin.name} está inativa`,
          binId: bin.id,
          binName: bin.name,
          binLocation: bin.location,
          createdAt: bin.updatedAt,
          acknowledged: false
        })
      }
    })

    // Ordenar alertas por severidade e data
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    return NextResponse.json(sortedAlerts)
  } catch (error) {
    console.error("Erro ao buscar alertas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar alertas" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, acknowledged } = body

    if (!alertId || typeof acknowledged !== 'boolean') {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Aqui você implementaria a lógica para marcar o alerta como reconhecido
    // Por enquanto, vamos apenas retornar sucesso
    return NextResponse.json({ 
      message: acknowledged ? "Alerta reconhecido" : "Alerta não reconhecido",
      alertId,
      acknowledged,
      acknowledgedBy: session.user.id,
      acknowledgedAt: new Date()
    })
  } catch (error) {
    console.error("Erro ao atualizar alerta:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar alerta" },
      { status: 500 }
    )
  }
}