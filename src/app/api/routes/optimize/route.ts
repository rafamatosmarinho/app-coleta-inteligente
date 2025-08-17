import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface Bin {
  id: string
  code: string
  name: string
  location: string
  latitude: number
  longitude: number
  currentLevel: number
  capacity: number
  batteryLevel: number
  status: string
}

interface OptimizedRoute {
  bins: Bin[]
  totalDistance: number
  estimatedTime: number
}

// Função para calcular distância entre dois pontos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Algoritmo simples de nearest neighbor para otimização de rota
function optimizeRoute(bins: Bin[]): OptimizedRoute {
  if (bins.length === 0) {
    return { bins: [], totalDistance: 0, estimatedTime: 0 }
  }

  const unvisited = [...bins]
  const route: Bin[] = []
  let totalDistance = 0
  
  // Começar pela primeira lixeira
  let current = unvisited.shift()!
  route.push(current)

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = calculateDistance(
      current.latitude, current.longitude,
      unvisited[0].latitude, unvisited[0].longitude
    )

    // Encontrar a lixeira mais próxima
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.latitude, current.longitude,
        unvisited[i].latitude, unvisited[i].longitude
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    // Mover para a lixeira mais próxima
    current = unvisited.splice(nearestIndex, 1)[0]
    route.push(current)
    totalDistance += nearestDistance
  }

  // Estimar tempo (assumindo velocidade média de 30 km/h + 5 minutos por lixeira)
  const estimatedTime = (totalDistance / 30 * 60) + (route.length * 5)

  return {
    bins: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round(estimatedTime)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERVISOR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar lixeiras que precisam de coleta (nível > 80%)
    const binsNeedingCollection = await db.trashBin.findMany({
      where: {
        status: "ACTIVE",
        currentLevel: {
          gte: 80 // 80% da capacidade
        }
      },
      orderBy: {
        currentLevel: "desc" // Priorizar as mais cheias
      }
    })

    if (binsNeedingCollection.length === 0) {
      return NextResponse.json({
        message: "Nenhuma lixeira precisa de coleta no momento",
        route: null
      })
    }

    // Otimizar a rota
    const optimizedRoute = optimizeRoute(binsNeedingCollection)

    return NextResponse.json({
      message: `Rota otimizada para ${binsNeedingCollection.length} lixeiras`,
      route: optimizedRoute,
      binsCount: binsNeedingCollection.length
    })
  } catch (error) {
    console.error("Erro ao otimizar rota:", error)
    return NextResponse.json(
      { error: "Erro ao otimizar rota" },
      { status: 500 }
    )
  }
}