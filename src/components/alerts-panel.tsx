"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  Battery, 
  Wrench, 
  PauseCircle, 
  CheckCircle,
  RefreshCw,
  Bell
} from "lucide-react"

interface AlertData {
  id: string
  type: 'FULL_BIN' | 'LOW_BATTERY' | 'MAINTENANCE' | 'INACTIVE'
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  binId: string
  binName: string
  binLocation: string
  createdAt: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

interface AlertsPanelProps {
  onAlertCountChange?: (count: number) => void
}

export function AlertsPanel({ onAlertCountChange }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
        if (onAlertCountChange) {
          onAlertCountChange(data.length)
        }
      }
    } catch (error) {
      console.error("Erro ao buscar alertas:", error)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch("/api/alerts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ alertId, acknowledged: true })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        if (onAlertCountChange) {
          onAlertCountChange(alerts.length - 1)
        }
      }
    } catch (error) {
      console.error("Erro ao reconhecer alerta:", error)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000) // Atualiza a cada minuto
    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'FULL_BIN': return <AlertTriangle className="h-4 w-4" />
      case 'LOW_BATTERY': return <Battery className="h-4 w-4" />
      case 'MAINTENANCE': return <Wrench className="h-4 w-4" />
      case 'INACTIVE': return <PauseCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'border-red-500'
      case 'MEDIUM': return 'border-yellow-500'
      case 'LOW': return 'border-blue-500'
      default: return 'border-gray-500'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'Alta'
      case 'MEDIUM': return 'Média'
      case 'LOW': return 'Baixa'
      default: return severity
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alertas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alertas</span>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchAlerts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum alerta
            </h3>
            <p className="text-gray-600">
              Todos os sistemas estão funcionando normalmente.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)} rounded-lg p-4 bg-white shadow-sm`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getSeverityBadgeColor(alert.severity)} text-white`}>
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-600">
                        {alert.binLocation}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}