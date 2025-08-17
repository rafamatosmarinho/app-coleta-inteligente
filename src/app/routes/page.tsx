"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MapPin, 
  Route, 
  Clock, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Plus,
  Navigation
} from "lucide-react"

interface CollectionRoute {
  id: string
  name: string
  description?: string
  status: string
  assignedTo?: string
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  user?: {
    id: string
    name: string
    email: string
  }
  bins: Array<{
    id: string
    bin: {
      id: string
      code: string
      name: string
      location: string
      currentLevel: number
      capacity: number
      status: string
    }
    order: number
    status: string
  }>
  collections: Array<{
    id: string
    bin: {
      id: string
      code: string
      name: string
    }
  }>
}

interface OptimizedRoute {
  bins: Array<{
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
  }>
  totalDistance: number
  estimatedTime: number
}

export default function RoutesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [routes, setRoutes] = useState<CollectionRoute[]>([])
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null)
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/routes")
      if (response.ok) {
        const data = await response.json()
        setRoutes(data)
      }
    } catch (error) {
      console.error("Erro ao buscar rotas:", error)
    } finally {
      setLoading(false)
    }
  }

  const optimizeRoute = async () => {
    setOptimizing(true)
    try {
      const response = await fetch("/api/routes/optimize", {
        method: "POST"
      })
      if (response.ok) {
        const data = await response.json()
        setOptimizedRoute(data.route)
      }
    } catch (error) {
      console.error("Erro ao otimizar rota:", error)
    } finally {
      setOptimizing(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchRoutes()
    }
  }, [session])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED": return "bg-blue-500"
      case "IN_PROGRESS": return "bg-yellow-500"
      case "COMPLETED": return "bg-green-500"
      case "CANCELLED": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PLANNED": return "Planejada"
      case "IN_PROGRESS": return "Em Progresso"
      case "COMPLETED": return "Concluída"
      case "CANCELLED": return "Cancelada"
      default: return status
    }
  }

  const getBinStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500"
      case "COMPLETED": return "bg-green-500"
      case "SKIPPED": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
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
            <h1 className="text-3xl font-bold text-gray-900">Rotas de Coleta</h1>
            <p className="text-gray-600">Gerenciamento inteligente de rotas para coleta de lixo</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={optimizeRoute} disabled={optimizing}>
              {optimizing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  Otimizar Rota
                </>
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Rota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Rota</DialogTitle>
                  <DialogDescription>
                    Funcionalidade em desenvolvimento. Em breve você poderá criar rotas personalizadas.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {optimizedRoute && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Rota Otimizada!</strong> {optimizedRoute.bins.length} lixeiras, 
              {optimizedRoute.totalDistance} km, tempo estimado: {optimizedRoute.estimatedTime} minutos.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Ativas ({routes.filter(r => r.status !== "COMPLETED" && r.status !== "CANCELLED").length})</TabsTrigger>
            <TabsTrigger value="completed">Concluídas ({routes.filter(r => r.status === "COMPLETED").length})</TabsTrigger>
            <TabsTrigger value="optimized">Rota Otimizada {optimizedRoute && `(${optimizedRoute.bins.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {routes.filter(r => r.status !== "COMPLETED" && r.status !== "CANCELLED").map((route) => (
                <Card key={route.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Route className="h-5 w-5 text-gray-600" />
                        <span>{route.name}</span>
                      </CardTitle>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(route.status)}`} />
                        <span>{getStatusLabel(route.status)}</span>
                      </Badge>
                    </div>
                    {route.description && (
                      <p className="text-sm text-gray-600">{route.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <span>{route.user?.name || "Não atribuído"}</span>
                      </div>
                      {route.scheduledAt && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span>{new Date(route.scheduledAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lixeiras ({route.bins.length})</span>
                        <span className="text-sm text-gray-600">
                          {route.bins.filter(b => b.status === "COMPLETED").length} concluídas
                        </span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {route.bins.map((bin, index) => (
                          <div key={bin.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{index + 1}.</span>
                              <span className="text-sm">{bin.bin.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round((bin.bin.currentLevel / bin.bin.capacity) * 100)}%
                              </Badge>
                            </div>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${getBinStatusColor(bin.status)}`} />
                              <span className="text-xs">{bin.status}</span>
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MapPin className="mr-2 h-4 w-4" />
                        Ver Mapa
                      </Button>
                      {route.status === "PLANNED" && (
                        <Button size="sm" className="flex-1">
                          Iniciar Coleta
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {routes.filter(r => r.status === "COMPLETED").map((route) => (
                <Card key={route.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Route className="h-5 w-5 text-gray-600" />
                        <span>{route.name}</span>
                      </CardTitle>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(route.status)}`} />
                        <span>{getStatusLabel(route.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <span>{route.user?.name}</span>
                      </div>
                      {route.completedAt && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{new Date(route.completedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>{route.collections.length} lixeiras coletadas</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="optimized" className="space-y-4">
            {optimizedRoute ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Navigation className="h-5 w-5 text-gray-600" />
                    <span>Rota Otimizada Sugerida</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{optimizedRoute.bins.length}</div>
                      <div className="text-sm text-gray-600">Lixeiras</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{optimizedRoute.totalDistance} km</div>
                      <div className="text-sm text-gray-600">Distância Total</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">{optimizedRoute.estimatedTime} min</div>
                      <div className="text-sm text-gray-600">Tempo Estimado</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Ordem Sugerida:</h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {optimizedRoute.bins.map((bin, index) => (
                        <div key={bin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg">{index + 1}</span>
                            <div>
                              <div className="font-medium">{bin.name}</div>
                              <div className="text-sm text-gray-600">{bin.location}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {Math.round((bin.currentLevel / bin.capacity) * 100)}% cheio
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              Bateria: {bin.batteryLevel}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Route className="mr-2 h-4 w-4" />
                      Criar Rota
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MapPin className="mr-2 h-4 w-4" />
                      Ver no Mapa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma rota otimizada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Clique em "Otimizar Rota" para gerar uma rota inteligente baseada nas lixeiras que precisam de coleta.
                    </p>
                    <Button onClick={optimizeRoute} disabled={optimizing}>
                      {optimizing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Otimizando...
                        </>
                      ) : (
                        <>
                          <Navigation className="mr-2 h-4 w-4" />
                          Otimizar Rota
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}