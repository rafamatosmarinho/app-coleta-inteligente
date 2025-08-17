"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw } from "lucide-react"

interface TrashBin {
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

interface TrashBinSimulatorProps {
  bins: TrashBin[]
  onBinsUpdate: (bins: TrashBin[]) => void
}

export function TrashBinSimulator({ bins, onBinsUpdate }: TrashBinSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(2000) // 2 segundos

  // Initialize bins with proper values if they are zeros
  useEffect(() => {
    const hasZeroValues = bins.some(bin => bin.currentLevel === 0 || bin.batteryLevel === 0)
    if (hasZeroValues && bins.length > 0) {
      const initializedBins = bins.map(bin => ({
        ...bin,
        currentLevel: bin.currentLevel === 0 ? Math.round(Math.random() * 30) + 10 : bin.currentLevel,
        batteryLevel: bin.batteryLevel === 0 ? Math.round(70 + Math.random() * 30) : bin.batteryLevel,
        status: bin.status === "INACTIVE" ? "ACTIVE" : bin.status
      }))
      console.log("Simulator: Initializing bins with zero values", initializedBins)
      onBinsUpdate(initializedBins)
    }
  }, [bins, onBinsUpdate])

  const simulateBinChanges = useCallback(() => {
    console.log("Simulator: Running simulation with", bins.length, "bins")
    const updatedBins = bins.map(bin => {
      // Simula aumento gradual de lixo
      const trashIncrease = Math.random() * 3 // 0-3% de aumento
      let newLevel = Math.min(bin.currentLevel + trashIncrease, bin.capacity)
      
      // Simula consumo de bateria
      const batteryDecrease = Math.random() * 0.5 // 0-0.5% de consumo
      let newBattery = Math.max(bin.batteryLevel - batteryDecrease, 0)
      
      // Simula coleta aleatória (lixeira é esvaziada)
      if (Math.random() < 0.05) { // 5% de chance de coleta
        newLevel = 0
      }
      
      // Simula recarga de bateria
      if (Math.random() < 0.02) { // 2% de chance de recarga
        newBattery = 100
      }
      
      // Determina status baseado nas condições
      let newStatus = bin.status
      if (newBattery < 5) {
        newStatus = "INACTIVE"
      } else if (Math.random() < 0.01) { // 1% de chance de entrar em manutenção
        newStatus = "MAINTENANCE"
      } else if (newStatus === "MAINTENANCE" && Math.random() < 0.1) { // 10% de chance de sair da manutenção
        newStatus = "ACTIVE"
      } else if (newStatus === "INACTIVE" && newBattery > 20) {
        newStatus = "ACTIVE"
      }
      
      return {
        ...bin,
        currentLevel: Math.round(newLevel * 100) / 100,
        batteryLevel: Math.round(newBattery * 100) / 100,
        status: newStatus
      }
    })
    
    console.log("Simulator: Updated bins", updatedBins)
    onBinsUpdate(updatedBins)
  }, [bins, onBinsUpdate])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isSimulating) {
      console.log("Simulator: Starting simulation")
      interval = setInterval(simulateBinChanges, simulationSpeed)
    } else {
      console.log("Simulator: Stopping simulation")
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isSimulating, simulationSpeed, simulateBinChanges]) // Use the memoized function

  const resetSimulation = () => {
    console.log("Simulator: Resetting simulation")
    const resetBins = bins.map(bin => ({
      ...bin,
      currentLevel: Math.round(Math.random() * 30) + 10, // Nível aleatório entre 10-40%
      batteryLevel: Math.round(70 + Math.random() * 30), // Bateria entre 70-100%
      status: "ACTIVE"
    }))
    console.log("Simulator: Reset bins", resetBins)
    onBinsUpdate(resetBins)
  }

  const getStats = () => {
    const totalBins = bins.length
    const activeBins = bins.filter(bin => bin.status === "ACTIVE").length
    const fullBins = bins.filter(bin => (bin.currentLevel / bin.capacity) >= 0.8).length
    const lowBatteryBins = bins.filter(bin => bin.batteryLevel < 20).length
    const maintenanceBins = bins.filter(bin => bin.status === "MAINTENANCE").length
    
    return { totalBins, activeBins, fullBins, lowBatteryBins, maintenanceBins }
  }

  const stats = getStats()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Simulador de Lixeiras</span>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              variant={isSimulating ? "destructive" : "default"}
              size="sm"
            >
              {isSimulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isSimulating ? "Pausar" : "Iniciar"}
            </Button>
            <Button onClick={resetSimulation} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBins}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeBins}</div>
            <div className="text-sm text-gray-600">Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.fullBins}</div>
            <div className="text-sm text-gray-600">Cheias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.lowBatteryBins}</div>
            <div className="text-sm text-gray-600">Bateria Baixa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.maintenanceBins}</div>
            <div className="text-sm text-gray-600">Manutenção</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={isSimulating ? "default" : "secondary"}>
              {isSimulating ? "Simulação Ativa" : "Simulação Pausada"}
            </Badge>
            <Badge variant="outline">
              Velocidade: {simulationSpeed / 1000}s
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            Simulação em tempo real das condições das lixeiras
          </div>
        </div>
      </CardContent>
    </Card>
  )
}