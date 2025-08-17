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
import { 
  AlertTriangle, 
  Battery, 
  Settings, 
  PowerOff, 
  CheckCircle,
  RefreshCw,
  Bell,
  Filter
} from "lucide-react"

interface AlertData {
  id: string
  type: 'FULL_BIN' | 'LOW_BATTERY' | 'MAINTENANCE' | 'INACTIVE'
  binId: string
  binName: string
  binLocation: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  timestamp: string
  acknowledged: boolean
}

export default function AlertsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("Erro ao buscar alertas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAlerts()
      const interval = setInterval(fetchAlerts, 60000) // Atualiza a cada minuto
      return () => clearInterval(interval)
    }
  }, [session])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'FULL_BIN': return <AlertTriangle className="h-5 w-5" />
      case 'LOW_BATTERY': return <Battery className="h-5 w-5" />
      case 'MAINTENANCE': return <Settings className="h-5 w-5" />
      case 'INACTIVE': return <PowerOff className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'Crítico'
      case 'HIGH': return 'Alto'
      case 'MEDIUM': return 'Médio'
      case 'LOW': return 'Baixo'
      default: return severity
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_BIN': return 'Lixeira Cheia'
      case 'LOW_BATTERY': return 'Bateria Baixa'
      case 'MAINTENANCE': return 'Manutenção'
      case 'INACTIVE': return 'Inativa'
      default: return type
    }
  }

  const getFilteredAlerts = (severity?: string) => {
    if (!severity) return alerts
    return alerts.filter(alert => alert.severity === severity)
  }

  const getCriticalAlerts = () => alerts.filter(alert => alert.severity === 'CRITICAL')
  const getHighAlerts = () => alerts.filter(alert => alert.severity === 'HIGH')

  if (status === "loading" || loading) {
    return (
      <div>
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-16" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
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
            <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
            <p className="text-gray-600">Monitoramento de alertas e notificações do sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchAlerts} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {(getCriticalAlerts().length > 0 || getHighAlerts().length > 0) && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção!</strong> Existem {getCriticalAlerts().length} alertas críticos e {getHighAlerts().length} alertas de alta prioridade que precisam de atenção imediata.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{getCriticalAlerts().length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getHighAlerts().length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lixeiras Cheias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.type === 'FULL_BIN').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todos ({alerts.length})</TabsTrigger>
            <TabsTrigger value="critical">Críticos ({getCriticalAlerts().length})</TabsTrigger>
            <TabsTrigger value="high">Alta ({getHighAlerts().length})</TabsTrigger>
            <TabsTrigger value="medium">Média ({getFilteredAlerts('MEDIUM').length})</TabsTrigger>
            <TabsTrigger value="low">Baixa ({getFilteredAlerts('LOW').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{alert.binName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSeverityColor(alert.severity)}`}
                            >
                              {getSeverityLabel(alert.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                          <p className="text-xs text-gray-500">{alert.binLocation}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconhecer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="critical" className="space-y-4">
            <div className="space-y-4">
              {getCriticalAlerts().map((alert) => (
                <Card key={alert.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-red-500 text-white">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-red-900">{alert.binName}</h3>
                            <Badge variant="destructive" className="text-xs">
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-red-700 mb-1">{alert.message}</p>
                          <p className="text-xs text-red-600">{alert.binLocation}</p>
                          <p className="text-xs text-red-500 mt-1">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="destructive">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconhecer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="high" className="space-y-4">
            <div className="space-y-4">
              {getHighAlerts().map((alert) => (
                <Card key={alert.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-orange-500 text-white">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-orange-900">{alert.binName}</h3>
                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-orange-700 mb-1">{alert.message}</p>
                          <p className="text-xs text-orange-600">{alert.binLocation}</p>
                          <p className="text-xs text-orange-500 mt-1">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="border-orange-500 text-orange-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconhecer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="medium" className="space-y-4">
            <div className="space-y-4">
              {getFilteredAlerts('MEDIUM').map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-yellow-500 text-white">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{alert.binName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                          <p className="text-xs text-gray-500">{alert.binLocation}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconhecer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="low" className="space-y-4">
            <div className="space-y-4">
              {getFilteredAlerts('LOW').map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-blue-500 text-white">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{alert.binName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                          <p className="text-xs text-gray-500">{alert.binLocation}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reconhecer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}