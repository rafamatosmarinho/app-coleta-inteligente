"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, RefreshCw } from "lucide-react"

// Import dinâmico do Leaflet para evitar SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

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

interface TrashBinMapProps {
  bins: TrashBin[]
  height?: string
  showControls?: boolean
  onBinSelect?: (bin: TrashBin) => void
  onRefresh?: () => void
}

export function TrashBinMap({ 
  bins, 
  height = "400px", 
  showControls = true, 
  onBinSelect,
  onRefresh 
}: TrashBinMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [customIcons, setCustomIcons] = useState<any[]>([])
  const mapRef = useRef<any>(null)

  const getBinColor = (bin: TrashBin) => {
    const fillPercentage = (bin.currentLevel / bin.capacity) * 100
    if (bin.status === "INACTIVE") return "#9CA3AF"
    if (bin.status === "MAINTENANCE") return "#FCD34D"
    if (fillPercentage >= 80) return "#EF4444"
    if (bin.batteryLevel < 20) return "#F59E0B"
    return "#10B981"
  }

  const getBinIcon = (bin: TrashBin) => {
    const fillPercentage = (bin.currentLevel / bin.capacity) * 100
    if (bin.status === "INACTIVE") return "🚫"
    if (bin.status === "MAINTENANCE") return "🔧"
    if (fillPercentage >= 80) return "⚠️"
    if (bin.batteryLevel < 20) return "🔋"
    return "♻️"
  }

  useEffect(() => {
    // Carregar CSS do Leaflet
    if (typeof window !== 'undefined') {
      import("leaflet/dist/leaflet.css").then(() => {
        setMapLoaded(true)
        
        // Criar ícones customizados após o Leaflet ser carregado
        import("leaflet").then((L) => {
          const icons = bins.map(bin => {
            const color = getBinColor(bin)
            const icon = getBinIcon(bin)
            
            return L.default.divIcon({
              html: `<div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                font-size: 16px;
              ">${icon}</div>`,
              className: "custom-marker",
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })
          })
          setCustomIcons(icons)
        })
      })
    }
  }, [bins])

  const center = bins.length > 0 
    ? [bins[0].latitude, bins[0].longitude]
    : [-3.8452, -32.4258] // Centro de Fernando de Noronha

  return (
    <Card>
      {showControls && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Mapa de Lixeiras</span>
            </div>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height }}>
          {mapLoaded && customIcons.length === bins.length ? (
            <MapContainer
              center={center}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {bins.map((bin, index) => (
                <Marker
                  key={bin.id}
                  position={[bin.latitude, bin.longitude]}
                  icon={customIcons[index]}
                  eventHandlers={{
                    click: () => onBinSelect && onBinSelect(bin),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{bin.name}</h3>
                      <p className="text-sm text-gray-600">{bin.location}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Nível:</span>
                          <span className="font-medium">{Math.round((bin.currentLevel / bin.capacity) * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bateria:</span>
                          <span className="font-medium">{bin.batteryLevel}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status:</span>
                          <Badge variant="outline" className="text-xs">{bin.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Carregando mapa...</p>
              </div>
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Cheia (&gt;80%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Bateria Baixa (&lt;20%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Inativa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
              <span>Manutenção</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}