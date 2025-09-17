"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Play, Eye } from "lucide-react"
import Link from "next/link"
import { CardDetalhesPedido } from "@/components/CardDetalhesPedido"

// Mock data for orders with status control
const initialOrders = [
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
    statusHistory: [
      { status: "iniciado", date: "2024-01-15", time: "09:00" },
      { status: "em-processamento", date: "2024-01-15", time: "14:30" },
    ],
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
    statusHistory: [{ status: "iniciado", date: "2024-01-14", time: "10:15" }],
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
    statusHistory: [
      { status: "iniciado", date: "2024-01-13", time: "08:45" },
      { status: "em-processamento", date: "2024-01-13", time: "11:20" },
      { status: "concluido", date: "2024-01-18", time: "16:00" },
    ],
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
    statusHistory: [{ status: "iniciado", date: "2024-01-12", time: "13:30" }],
  },
  {
    id: "005",
    clientName: "Carlos Mendes",
    clientCpf: "555.666.777-88",
    sneaker: "Jordan 1 Retro",
    serviceType: "Limpeza Completa",
    description: "Limpeza e hidratação completa",
    price: 90.0,
    status: "em-processamento",
    createdDate: "2024-01-16",
    expectedDate: "2024-01-21",
    statusHistory: [
      { status: "iniciado", date: "2024-01-16", time: "09:30" },
      { status: "em-processamento", date: "2024-01-16", time: "15:45" },
    ],
  },
]

const getStatusInfo = (status: string) => {
  switch (status) {
    case "iniciado":
      return {
        label: "Iniciado",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Play,
        bgColor: "bg-yellow-50",
      }
    case "em-processamento":
      return {
        label: "Em Processamento",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
        bgColor: "bg-blue-50",
      }
    case "concluido":
      return {
        label: "Concluído",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        bgColor: "bg-green-50",
      }
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
        bgColor: "bg-gray-50",
      }
  }
}

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case "iniciado":
      return "em-processamento"
    case "em-processamento":
      return "concluido"
    default:
      return null
  }
}

const getPreviousStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case "em-processamento":
      return "iniciado"
    case "concluido":
      return "em-processamento"
    default:
      return null
  }
}

export default function StatusControlPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [successMessage, setSuccessMessage] = useState("")
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Novos estados para busca rápida
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const now = new Date()
          const newHistoryEntry = {
            status: newStatus,
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().slice(0, 5),
          }
          return {
            ...order,
            status: newStatus,
            statusHistory: [...order.statusHistory, newHistoryEntry],
          }
        }
        return order
      }),
    )

    setSuccessMessage(`Pedido #${orderId} atualizado para ${getStatusInfo(newStatus).label}`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleDragStart = (orderId: string) => {
    setDraggedOrderId(orderId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedOrderId) {
      updateOrderStatus(draggedOrderId, status);
      setDraggedOrderId(null);
    }
  };

  // Função para avançar pedido por número do pedido ou CPF do cliente
  const handleQuickAdvance = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    // Busca por número do pedido
    let foundOrder = orders.find(o => o.id === trimmed)
    // Se não achou, busca por CPF do cliente
    if (!foundOrder) {
      foundOrder = orders.find(o => o.clientCpf.replace(/\D/g, "") === trimmed.replace(/\D/g, ""))
    }

    if (foundOrder) {
      const nextStatus = getNextStatus(foundOrder.status)
      if (nextStatus) {
        updateOrderStatus(foundOrder.id, nextStatus)
        setSuccessMessage(`Pedido #${foundOrder.id} avançado para ${getStatusInfo(nextStatus).label}`)
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setSuccessMessage(`Pedido #${foundOrder.id} já está no status final`)
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } else {
      setSuccessMessage("Pedido ou cliente não encontrado")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
    setInputValue("")
    inputRef.current?.focus()
  }

  const ordersByStatus = {
    iniciado: orders.filter((order) => order.status === "iniciado"),
    "em-processamento": orders.filter((order) => order.status === "em-processamento"),
    concluido: orders.filter((order) => order.status === "concluido"),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Novo Header visual para a página de status */}
      <div className="w-full bg-primary text-primary-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-tight">Controle de Status dos Pedidos</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Acompanhe e avance os pedidos de clientes facilmente pelo status.
            </p>
          </div>
        </div>
      </div>

      {/* Sessão de avanço rápido */}
      <div className="w-full bg-muted/60 border-b py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
            <label htmlFor="quick-advance" className="font-medium text-foreground">
              Avançar pedido rapidamente:
            </label>
            <input
              ref={inputRef}
              id="quick-advance"
              type="text"
              placeholder="Digite o número do pedido ou CPF do cliente"
              className="border rounded px-3 py-2 w-full md:w-[400px] lg:w-[500px] transition-all"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleQuickAdvance() }}
            />
            <Button onClick={handleQuickAdvance} className="w-full md:w-auto">
              Avançar Pedido
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-yellow-800">
                <Play className="w-5 h-5 mr-2" />
                Iniciado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{ordersByStatus.iniciado.length}</div>
              <p className="text-sm text-yellow-600">pedidos iniciados</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-800">
                <Clock className="w-5 h-5 mr-2" />
                Em Processamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{ordersByStatus["em-processamento"].length}</div>
              <p className="text-sm text-blue-600">pedidos em andamento</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                Concluído
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{ordersByStatus.concluido.length}</div>
              <p className="text-sm text-green-600">pedidos finalizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
            const statusInfo = getStatusInfo(status)
            const StatusIcon = statusInfo.icon

            return (
              <Card
                key={status}
                className={`${statusInfo.bgColor} border-2`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
                style={{ minHeight: 300, opacity: draggedOrderId ? 0.97 : 1, borderStyle: draggedOrderId ? "dashed" : undefined }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <StatusIcon className="w-5 h-5 mr-2" />
                    {statusInfo.label}
                  </CardTitle>
                  <CardDescription>{statusOrders.length} pedidos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statusOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <StatusIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pedido neste status</p>
                    </div>
                  ) : (
                    statusOrders.map((order) => (
                      <Card
                        key={order.id}
                        className={`bg-background border shadow-sm ${draggedOrderId === order.id ? "opacity-60" : ""}`}
                        draggable
                        onDragStart={() => handleDragStart(order.id)}
                        onDragEnd={() => setDraggedOrderId(null)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Pedido #{order.id}</h4>
                                <p className="text-sm text-muted-foreground">{order.clientName}</p>
                              </div>
                              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                            </div>

                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Tênis:</strong> {order.sneaker}
                              </p>
                              <p>
                                <strong>Serviço:</strong> {order.serviceType}
                              </p>
                              <p>
                                <strong>Valor:</strong> R$ {order.price.toFixed(2)}
                              </p>
                              <p>
                                <strong>Previsão:</strong> {order.expectedDate}
                              </p>
                            </div>

                            {/* Status History */}
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium mb-1">Histórico:</p>
                              {order.statusHistory.map((history, index) => (
                                <p key={index}>
                                  {getStatusInfo(history.status).label} - {history.date} às {history.time}
                                </p>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              {getPreviousStatus(order.status) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, getPreviousStatus(order.status)!)}
                                  className="flex-1"
                                >
                                  <ArrowLeft className="w-3 h-3 mr-1" />
                                  Voltar
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver
                              </Button>

                              {getNextStatus(order.status) && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                                  className="flex-1"
                                >
                                  Avançar
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Gerencie o fluxo de trabalho dos pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/pedidos/novo">
                <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                  <Play className="w-6 h-6 mb-2" />
                  Novo Pedido
                </Button>
              </Link>
              <Link href="/pedidos">
                <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                  <Eye className="w-6 h-6 mb-2" />
                  Ver Todos os Pedidos
                </Button>
              </Link>
              <Link href="/consultas">
                <Button variant="outline" className="w-full h-20 flex-col bg-transparent">
                  <Clock className="w-6 h-6 mb-2" />
                  Consultar Pedidos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes do Pedido */}
      <CardDetalhesPedido
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        pedido={selectedOrder}
      />
    </div>
  )
}
