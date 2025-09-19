"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Package, Clock, CheckCircle, Search, LogOut } from "lucide-react"
import { apiFetch } from "@/lib/apiService"
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
import Cookies from "js-cookie"
import Link from "next/link"

// Interfaces para tipagem dos dados da API
interface DashboardStats {
  totalClients: number
  activeOrders: number
  pendingOrders: number
  completedToday: number
}

interface RecentOrder {
  id: string
  clientName: string
  clientCpf: string
  sneaker: string
  serviceType: string
  description: string
  price: number
  status: string
  createdDate: string
  expectedDate: string
  statusHistory: Array<{
    status: string
    date: string
    time: string
  }>
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  user: {
    name: string
    role: string
    permissions: string[]
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "iniciado":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Iniciado
        </Badge>
      )
    case "em-processamento":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Em Processamento
        </Badge>
      )
    case "concluido":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Concluído
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await apiFetch("/dashboard")
        setDashboardData(data)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    Cookies.remove("token")
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold font-serif">{APP_NAME}</h1>
              <span className="text-sm opacity-75">Sistema de Gestão</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground font-serif mb-2">Bem-vindo ao Dashboard</h2>
          <p className="text-muted-foreground">Gerencie seus clientes e pedidos de reforma de tênis</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Aguardando início</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos Hoje</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Finalizados hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Card único para clientes */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-accent" />
                Clientes
              </CardTitle>
              <CardDescription>Visualize ou cadastre clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Link href="/clientes">
                  <Button className="w-full">Ver Todos Clientes</Button>
                </Link>
                <Link href="/clientes/novo">
                  <Button className="w-full" variant="secondary">Cadastrar Cliente</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-accent" />
                Novo Pedido
              </CardTitle>
              <CardDescription>Criar um novo pedido de reforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="justify-center mt-5">
                <Link href="/pedidos/novo">
                  <Button className="w-full">Criar Pedido</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-accent" />
                Consultar
              </CardTitle>
              <CardDescription>Buscar clientes e pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="justify-center mt-5">
                <Link href="/consultas">
                  <Button className="w-full bg-transparent" variant="outline">
                    Fazer Consulta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Novo Card para Status */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-accent" />
                Status dos Pedidos
              </CardTitle>
              <CardDescription>Gerencie o status dos pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="justify-center mt-5">
                <Link href="/status">
                  <Button className="w-full bg-transparent" variant="outline">
                    Ver Status
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos pedidos registrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order: RecentOrder) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-sm text-muted-foreground">{order.sneaker}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.createdDate}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/pedidos">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todos os Pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
