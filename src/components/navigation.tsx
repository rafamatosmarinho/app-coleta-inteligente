"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Route, 
  MapPin, 
  BarChart3, 
  Settings,
  Trash2,
  AlertTriangle
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Rotas",
    href: "/routes",
    icon: Route,
  },
  {
    name: "Alertas",
    href: "/alerts",
    icon: AlertTriangle,
  },
  {
    name: "Mapa",
    href: "/map",
    icon: MapPin,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Lixeiras",
    href: "/bins",
    icon: Trash2,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center space-x-2",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}