"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Battery, AlertTriangle, Route } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalBins: number
    activeBins: number
    fullBins: number
    lowBatteryBins: number
    maintenanceBins: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Lixeiras</CardTitle>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBins}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeBins} ativas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lixeiras Cheias</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.fullBins}</div>
          <p className="text-xs text-muted-foreground">
            Precisam de coleta
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bateria Baixa</CardTitle>
          <Battery className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.lowBatteryBins}</div>
          <p className="text-xs text-muted-foreground">
            {stats.lowBatteryBins > 0 ? 'Atenção necessária' : 'Todas OK'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
          <Route className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.maintenanceBins}</div>
          <p className="text-xs text-muted-foreground">
            Fora de operação
          </p>
        </CardContent>
      </Card>
    </div>
  )
}