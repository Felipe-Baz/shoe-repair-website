"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowLeft, User, Package, Calendar, Filter } from "lucide-react"
import Link from "next/link"

// Mock data
const mockClients = [
  {
    id: "1",
    name: "João Silva",
    cpf: "123.456.789-00",
    phone: "(11) 99999-9999",
    email: "joao@email.com",
    address: "Rua das Flores, 123 - São Paulo, SP",
    totalOrders: 5,
    lastOrder: "2024-01-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    cpf: "987.654.321-00",
    phone: "(11) 88888-8888",
    email: "maria@email.com",
    address: "Av. Paulista, 456 - São Paulo, SP",
    totalOrders: 3,
    lastOrder: "2024-01-14",
  },
  {
    id: "3",
    name: "Pedro Costa",
    cpf: "456.789.123-00",
    phone: "(11) 77777-7777",
    email: "pedro@email.com",
    address: "Rua Augusta, 789 - São Paulo, SP",
    totalOrders: 8,
    lastOrder: "2024-01-13",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    cpf: "321.654.987-00",
    phone: "(11) 66666-6666",
    email: "ana@email.com",
    address: "Rua Oscar Freire, 321 - São Paulo, SP",
    totalOrders: 2,
    lastOrder: "2024-01-12",
  },
]

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

export default function ConsultasPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("nome");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [hasSearched, setHasSearched] = useState(false);
  const [tab, setTab] = useState("clientes");

  useEffect(() => {
    const urlSearchType = searchParams.get("searchType");
    const urlSearchTerm = searchParams.get("searchTerm");
    const urlTab = searchParams.get("tab");
    if (urlSearchType && urlSearchTerm) {
      setSearchType(urlSearchType);
      setSearchTerm(urlSearchTerm);
      setHasSearched(true);
    }
    if (urlTab === "pedidos") {
      setTab("pedidos");
    } else {
      setTab("clientes");
    }
  }, [searchParams]);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("todos");
    setHasSearched(false);
  };

  // Filter clients based on search criteria
  const filteredClients = hasSearched
    ? mockClients.filter((client) => {
        if (!searchTerm.trim()) return false

        switch (searchType) {
          case "nome":
            return client.name.toLowerCase().includes(searchTerm.toLowerCase())
          case "cpf":
            return client.cpf.includes(searchTerm.replace(/\D/g, ""))
          case "telefone":
            return client.phone.includes(searchTerm.replace(/\D/g, ""))
          case "email":
            return client.email.toLowerCase().includes(searchTerm.toLowerCase())
          default:
            return false
        }
      })
    : []

  // Filter orders based on search criteria
  const filteredOrders = hasSearched
    ? mockOrders.filter((order) => {
        let matchesSearch = false

        if (searchTerm.trim()) {
          switch (searchType) {
            case "nome":
              matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
              break
            case "cpf":
              matchesSearch = order.clientCpf.includes(searchTerm.replace(/\D/g, ""))
              break
            case "tenis":
              matchesSearch = order.sneaker.toLowerCase().includes(searchTerm.toLowerCase())
              break
            default:
              matchesSearch = true
          }
        } else {
          matchesSearch = true
        }

        // Filter by date range
        let matchesDate = true
        if (dateFrom || dateTo) {
          const orderDate = new Date(order.createdDate)
          if (dateFrom) {
            matchesDate = matchesDate && orderDate >= new Date(dateFrom)
          }
          if (dateTo) {
            matchesDate = matchesDate && orderDate <= new Date(dateTo)
          }
        }

        // Filter by status
        const matchesStatus = statusFilter === "todos" || order.status === statusFilter

        return matchesSearch && matchesDate && matchesStatus
      })
    : []

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
              <h1 className="text-xl font-bold font-serif">Consultas</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Sistema de Consultas
            </CardTitle>
            <CardDescription>Busque clientes e pedidos por diferentes critérios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchType">Tipo de Busca</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nome">Nome do Cliente</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="tenis">Modelo do Tênis</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchTerm">Termo de Busca</Label>
                <Input
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Digite ${searchType === "nome" ? "o nome" : searchType === "cpf" ? "o CPF" : searchType === "tenis" ? "o modelo do tênis" : searchType === "telefone" ? "o telefone" : "o email"}...`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Pedido</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="iniciado">Iniciado</SelectItem>
                    <SelectItem value="em-processamento">Em Processamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data Inicial</Label>
                <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Data Final</Label>
                <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={clearSearch}>
                <Filter className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clientes" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Clientes ({filteredClients.length})
              </TabsTrigger>
              <TabsTrigger value="pedidos" className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Pedidos ({filteredOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clientes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados - Clientes</CardTitle>
                  <CardDescription>
                    {filteredClients.length === 0
                      ? "Nenhum cliente encontrado com os critérios informados"
                      : `${filteredClients.length} cliente(s) encontrado(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredClients.length > 0 ? (
                    <div className="space-y-4">
                      {filteredClients.map((client) => (
                        <div key={client.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
                              <p className="text-sm text-muted-foreground">Telefone: {client.phone}</p>
                              <p className="text-sm text-muted-foreground">Email: {client.email}</p>
                              <p className="text-sm text-muted-foreground">Endereço: {client.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{client.totalOrders} pedidos</p>
                              <p className="text-xs text-muted-foreground">Último: {client.lastOrder}</p>
                              <div className="mt-2 space-x-2">
                                <Button variant="outline" size="sm">
                                  Ver Pedidos
                                </Button>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum cliente encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pedidos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados - Pedidos</CardTitle>
                  <CardDescription>
                    {filteredOrders.length === 0
                      ? "Nenhum pedido encontrado com os critérios informados"
                      : `${filteredOrders.length} pedido(s) encontrado(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="font-semibold">Pedido #{order.id}</h3>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Cliente: {order.clientName} - {order.clientCpf}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                  <p className="font-medium text-muted-foreground">Data</p>
                                  <p>{order.createdDate}</p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Descrição:</strong> {order.description}
                              </p>
                            </div>
                            <div className="ml-4 space-x-2">
                              <Button variant="outline" size="sm">
                                Ver
                              </Button>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pedido encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!hasSearched && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Sistema de Consultas</h3>
              <p className="text-muted-foreground mb-4">
                Use os filtros acima para buscar clientes e pedidos no sistema
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="font-medium">Por Data</p>
                  <p className="text-muted-foreground">Busque por período</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <User className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="font-medium">Por Cliente</p>
                  <p className="text-muted-foreground">Nome ou CPF</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="font-medium">Por Tênis</p>
                  <p className="text-muted-foreground">Modelo do calçado</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Filter className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="font-medium">Por Status</p>
                  <p className="text-muted-foreground">Estado do pedido</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
