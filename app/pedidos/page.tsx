"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"

// Mock data for orders
const mockOrders = [
  {
    id: "001",
    clientName: "João Silva",
    clientCpf: "123.456.789-00",
    sneaker: "Nike Air Max 90",
    serviceType: "Limpeza Completa",
    description: "Limpeza profunda com hidratação do couro",
    price: 80.0,
    status: "em-processamento",
    createdDate: "2024-01-15",
    expectedDate: "2024-01-20",
  },
  {
    id: "002",
    clientName: "Maria Santos",
    clientCpf: "987.654.321-00",
    sneaker: "Adidas Ultraboost",
    serviceType: "Restauração",
    description: "Restauração da sola e pintura",
    price: 120.0,
    status: "iniciado",
    createdDate: "2024-01-14",
    expectedDate: "2024-01-25",
  },
  {
    id: "003",
    clientName: "Pedro Costa",
    clientCpf: "456.789.123-00",
    sneaker: "Vans Old Skool",
    serviceType: "Reparo",
    description: "Reparo de rasgos e costura",
    price: 60.0,
    status: "concluido",
    createdDate: "2024-01-13",
    expectedDate: "2024-01-18",
  },
  {
    id: "004",
    clientName: "Ana Oliveira",
    clientCpf: "321.654.987-00",
    sneaker: "Converse All Star",
    serviceType: "Customização",
    description: "Pintura personalizada e aplicação de patches",
    price: 150.0,
    status: "iniciado",
    createdDate: "2024-01-12",
    expectedDate: "2024-01-22",
  },
]

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

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [orders] = useState(mockOrders)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sneaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-xl font-bold font-serif">Pedidos</h1>
            </div>
            <Link href="/pedidos/novo">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrar Pedidos</CardTitle>
            <CardDescription>Pesquise e filtre os pedidos por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente, tênis ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="iniciado">Iniciado</SelectItem>
                  <SelectItem value="em-processamento">Em Processamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Lista de Pedidos</h2>
            <Badge variant="secondary">{filteredOrders.length} pedidos encontrados</Badge>
          </div>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {order.clientName} - {order.clientCpf}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Tênis</p>
                            <p>{order.sneaker}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Serviço</p>
                            <p>{order.serviceType}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Valor</p>
                            <p className="font-semibold text-green-600">R$ {order.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Previsão</p>
                            <p>{order.expectedDate}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">
                            <strong>Descrição:</strong> {order.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-2 ml-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Criado em</p>
                          <p className="text-sm">{order.createdDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
