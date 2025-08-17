"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardStats } from "@/components/dashboard-stats"
import { TrashBinCard } from "@/components/trash-bin-card"
import { AlertsPanel } from "@/components/alerts-panel"
import { TrashBinSimulator } from "@/components/trash-bin-simulator"
import { TrashBinMap } from "@/components/trash-bin-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface TrashBin {
  id: string
  code: string
  name: string
  location: string
  currentLevel: number
  capacity: number
  batteryLevel: number
  status: string
  lastEmptiedAt?: string
}

interface DashboardStats {
  totalBins: number
  activeBins: number
  fullBins: number
  lowBatteryBins: number
  maintenanceBins: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bins, setBins] = useState<TrashBin[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalBins: 0,
    activeBins: 0,
    fullBins: 0,
    lowBatteryBins: 0,
    maintenanceBins: 0
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchBins = async () => {
    try {
      const response = await fetch("/api/trash-bins")
      if (response.ok) {
        const data = await response.json()
        setBins(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error("Erro ao buscar lixeiras:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (binsData: TrashBin[]) => {
    const totalBins = binsData.length
    const activeBins = binsData.filter(bin => bin.status === "ACTIVE").length
    const fullBins = binsData.filter(bin => (bin.currentLevel / bin.capacity) >= 0.8).length
    const lowBatteryBins = binsData.filter(bin => bin.batteryLevel < 20).length
    const maintenanceBins = binsData.filter(bin => bin.status === "MAINTENANCE").length

    setStats({
      totalBins,
      activeBins,
      fullBins,
      lowBatteryBins,
      maintenanceBins
    })
  }

  useEffect(() => {
    if (session) {
      fetchBins()
      const interval = setInterval(fetchBins, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    calculateStats(bins)
  }, [bins])

  const getFilteredBins = (status?: string) => {
    if (!status) return bins
    return bins.filter(bin => bin.status === status)
  }

  const getFullBins = () => {
    return bins.filter(bin => (bin.currentLevel / bin.capacity) >= 0.8)
  }

  const getLowBatteryBins = () => {
    return bins.filter(bin => bin.batteryLevel < 20)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Monitoramento de lixeiras em tempo real</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}</span>
            </div>
            <Button onClick={fetchBins} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {stats.fullBins > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção!</strong> Existem {stats.fullBins} lixeiras que precisam de coleta imediata.
            </AlertDescription>
          </Alert>
        )}

        <TrashBinSimulator bins={bins} onBinsUpdate={setBins} />

        <DashboardStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todas ({bins.length})</TabsTrigger>
            <TabsTrigger value="full">Cheias ({getFullBins().length})</TabsTrigger>
            <TabsTrigger value="low-battery">Bateria Baixa ({getLowBatteryBins().length})</TabsTrigger>
            <TabsTrigger value="active">Ativas ({getFilteredBins("ACTIVE").length})</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção ({getFilteredBins("MAINTENANCE").length})</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bins.map((bin) => (
                <TrashBinCard key={bin.id} bin={bin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="full" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFullBins().map((bin) => (
                <TrashBinCard key={bin.id} bin={bin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="low-battery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getLowBatteryBins().map((bin) => (
                <TrashBinCard key={bin.id} bin={bin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredBins("ACTIVE").map((bin) => (
                <TrashBinCard key={bin.id} bin={bin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredBins("MAINTENANCE").map((bin) => (
                <TrashBinCard key={bin.id} bin={bin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <TrashBinMap 
              bins={bins} 
              height="500px"
              onRefresh={fetchBins}
            />
          </TabsContent>
        </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <AlertsPanel />
          </div>
        </div>
      </main>
    </div>
  )
}