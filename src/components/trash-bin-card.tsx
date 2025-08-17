"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Battery, MapPin, Trash2 } from "lucide-react"

interface TrashBinCardProps {
  bin: {
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
}

export function TrashBinCard({ bin }: TrashBinCardProps) {
  const fillPercentage = (bin.currentLevel / bin.capacity) * 100
  const isFull = fillPercentage >= 80
  const isLowBattery = bin.batteryLevel < 20

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500"
      case "INACTIVE": return "bg-gray-500"
      case "MAINTENANCE": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Ativo"
      case "INACTIVE": return "Inativo"
      case "MAINTENANCE": return "Manutenção"
      default: return status
    }
  }

  const getFillColor = (percentage: number) => {
    if (percentage >= 80) return "bg-red-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getBatteryColor = (level: number) => {
    if (level < 20) return "text-red-500"
    if (level < 50) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className={`transition-all hover:shadow-lg ${isFull ? 'ring-2 ring-red-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">{bin.name}</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(bin.status)}`} />
            <span>{getStatusLabel(bin.status)}</span>
          </Badge>
        </div>
        <p className="text-sm text-gray-500">Código: {bin.code}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{bin.location}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Nível de Lixo</span>
            <span className="text-sm text-gray-600">{bin.currentLevel}L / {bin.capacity}L</span>
          </div>
          <Progress value={fillPercentage} className="h-2" />
          <div className="flex justify-between items-center">
            <span className={`text-xs font-medium ${isFull ? 'text-red-600' : 'text-gray-600'}`}>
              {fillPercentage.toFixed(0)}% cheio
            </span>
            {isFull && (
              <Badge variant="destructive" className="text-xs">
                Precisa de coleta
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Battery className={`h-4 w-4 ${getBatteryColor(bin.batteryLevel)}`} />
            <span className="text-sm text-gray-600">
              Bateria: {bin.batteryLevel}%
            </span>
          </div>
          {isLowBattery && (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
              Bateria baixa
            </Badge>
          )}
        </div>

        {bin.lastEmptiedAt && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Última coleta: {new Date(bin.lastEmptiedAt).toLocaleDateString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}