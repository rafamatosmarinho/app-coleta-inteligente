"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MapPin, 
  Battery, 
  Trash2, 
  AlertTriangle, 
  RefreshCw,
  Filter,
  Layers
} from "lucide-react"

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

export default function MapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bins, setBins] = useState<TrashBin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBin, setSelectedBin] = useState<TrashBin | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [customIcons, setCustomIcons] = useState<any[]>([])
  const mapRef = useRef<any>(null)

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
      }
    } catch (error) {
      console.error("Erro ao buscar lixeiras:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchBins()
    }
  }, [session])

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
    // Carregar CSS do Leaflet e criar ícones
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
      <div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mapa de Lixeiras</h1>
            <p className="text-gray-600">Visualização geográfica das lixeiras monitoradas</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchBins} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Mapa de Fernando de Noronha</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
                  {mapLoaded && customIcons.length === bins.length ? (
                    <MapContainer
                      center={[-3.8452, -32.4258]} // Centro de Fernando de Noronha
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
                            click: () => setSelectedBin(bin),
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-semibold">{bin.name}</h3>
                              <p className="text-sm text-gray-600">{bin.location}</p>
                              <div className="mt-2">
                                <div className="text-sm">Nível: {Math.round((bin.currentLevel / bin.capacity) * 100)}%</div>
                                <div className="text-sm">Bateria: {bin.batteryLevel}%</div>
                                <Badge variant="outline" className="mt-1">{bin.status}</Badge>
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filtros</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="full">Cheias</TabsTrigger>
                    <TabsTrigger value="battery">Bateria</TabsTrigger>
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Mostrando todas {bins.length} lixeiras
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="full" className="space-y-2">
                    <div className="text-sm text-gray-600">
                      {getFullBins().length} lixeiras cheias
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="battery" className="space-y-2">
                    <div className="text-sm text-gray-600">
                      {getLowBatteryBins().length} com bateria baixa
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="issues" className="space-y-2">
                    <div className="text-sm text-gray-600">
                      {bins.filter(b => b.status !== "ACTIVE").length} com problemas
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Legenda</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Funcionando normalmente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Nível crítico (&gt;80%)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Bateria baixa (&lt;20%)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Inativa</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
                  <span className="text-sm">Em manutenção</span>
                </div>
              </CardContent>
            </Card>

            {selectedBin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trash2 className="h-5 w-5" />
                    <span>{selectedBin.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Código</div>
                    <div className="font-medium">{selectedBin.code}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Localização</div>
                    <div className="font-medium">{selectedBin.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Nível de Lixo</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(selectedBin.currentLevel / selectedBin.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((selectedBin.currentLevel / selectedBin.capacity) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Bateria</div>
                    <div className="flex items-center space-x-2">
                      <Battery className={`h-4 w-4 ${selectedBin.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                      <span className="font-medium">{selectedBin.batteryLevel}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <Badge variant="outline">{selectedBin.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}