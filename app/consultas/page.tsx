"use client"

import { useState, useEffect } from "react"
import { getClientesService, getOrdersStatusService, generateOrderPDFService, updateOrderService } from "@/lib/apiService"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, ArrowLeft, User, Package, Calendar, Filter, FileText, CheckCircle, Edit } from "lucide-react"
import Link from "next/link"
import { CardDetalhesPedido, PedidoDetalhes } from "@/components/CardDetalhesPedido"

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
  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Estados para o modal de detalhes do pedido
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PedidoDetalhes | null>(null);
  
  // Estados para o modal de edição do pedido
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    modeloTenis: '',
    servicos: '',
    descricaoServicos: '',
    price: 0,
    dataPrevistaEntrega: '',
    precoTotal: 0
  });
  const [editLoading, setEditLoading] = useState(false);

  // Função para abrir modal com detalhes do pedido
  const handleViewOrder = (order: any) => {
    const pedidoDetalhes: PedidoDetalhes = {
      id: order.id?.toString() || '',
      clientId: order.clientId?.toString() || '',
      clientName: order.clientName || `Cliente #${order.clienteId}`,
      clientCpf: order.clientCpf || '',
      clientPhone: order.clientPhone || '',
      sneaker: order.modeloTenis || '',
      servicos: order.servicos || '',
      price: order.price || 0,
      status: order.status || '',
      createdDate: order.createdAt || order.dataCriacao || new Date().toLocaleDateString(),
      expectedDate: order.dataPrevistaEntrega || '',
      statusHistory: order.statusHistory || [
        {
          status: order.status || 'iniciado',
          date: order.createdAt || order.dataCriacao || new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString()
        }
      ]
    };
    
    setSelectedOrder(pedidoDetalhes);
    setModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  // Funções para edição do pedido
  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditForm({
      modeloTenis: order.modeloTenis || '',
      servicos: order.servicos || '',
      descricaoServicos: order.descricaoServicos || '',
      price: order.price || 0,
      dataPrevistaEntrega: order.dataPrevistaEntrega || '',
      precoTotal: order.price || 0
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingOrder(null);
    setEditForm({
      modeloTenis: '',
      servicos: '',
      descricaoServicos: '',
      price: 0,
      dataPrevistaEntrega: '',
      precoTotal: 0
    });
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    
    // Validação básica
    if (!editForm.modeloTenis.trim()) {
      setSuccessMessage("O modelo do tênis é obrigatório");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    if (!editForm.servicos.trim()) {
      setSuccessMessage("Os serviços são obrigatórios");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    if (editForm.price <= 0) {
      setSuccessMessage("O valor deve ser maior que zero");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    
    setEditLoading(true);
    try {

      editForm.precoTotal = Number(editForm.price);
      // Chama a API para atualizar o pedido
      const updatedOrder = await updateOrderService(editingOrder.id, editForm);
      
      setSuccessMessage(`Pedido #${editingOrder.id} atualizado com sucesso!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Fechar modal e recarregar dados
      handleCloseEditModal();
      fetchData();
    } catch (error: any) {
      console.error("Erro ao atualizar pedido:", error);
      let errorMessage = "Erro ao atualizar pedido";
      if (error.message.includes("não encontrado")) {
        errorMessage = "Pedido não encontrado";
      } else if (error.message.includes("Token")) {
        errorMessage = "Sessão expirada. Faça login novamente";
      } else if (error.message.includes("permissão")) {
        errorMessage = "Você não tem permissão para editar este pedido";
      }
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(""), 5000);
    } finally {
      setEditLoading(false);
    }
  };

  // Função para gerar PDF do pedido
  const generateOrderPDF = async (order: any) => {
    try {
      setSuccessMessage("Gerando PDF do pedido...");
      
      // Chama o service do backend para gerar o PDF
      const pdfBlob = await generateOrderPDFService(order.id);
      
      // Cria URL para o blob e faz o download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pedido-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`PDF do pedido #${order.id} gerado com sucesso!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      
      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao gerar PDF do pedido";
      if (error.message.includes("não encontrado")) {
        errorMessage = "Pedido não encontrado";
      } else if (error.message.includes("Token")) {
        errorMessage = "Sessão expirada. Faça login novamente";
      } else if (error.message.includes("permissão")) {
        errorMessage = "Você não tem permissão para gerar PDF deste pedido";
      }
      
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };
  // Busca clientes e pedidos ao buscar
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientesData, pedidosData] = await Promise.all([
        getClientesService(),
        getOrdersStatusService(),
      ]);
      setClients(clientesData);
      setOrders(pedidosData);
    } catch (err: any) {
      setError("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearch = async () => {
    await fetchData();
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
    ? (searchTerm.trim()
        ? clients.filter((client) => {
            switch (searchType) {
              case "nome":
                return (client.nomeCompleto || "").toLowerCase().includes(searchTerm.toLowerCase());
              case "cpf":
                return (client.cpf || "").includes(searchTerm.replace(/\D/g, ""));
              case "telefone":
                return (client.telefone || "").includes(searchTerm.replace(/\D/g, ""));
              case "email":
                return (client.email || "").toLowerCase().includes(searchTerm.toLowerCase());
              default:
                return false;
            }
          })
        : clients)
    : [];

  // Filter orders based on search criteria
  const filteredOrders = hasSearched
    ? orders.filter((order) => {
        let matchesSearch = false;
        if (searchTerm.trim()) {
          switch (searchType) {
            case "nome":
              matchesSearch = (order.cliente?.nomeCompleto || "").toLowerCase().includes(searchTerm.toLowerCase());
              break;
            case "cpf":
              matchesSearch = (order.cliente?.cpf || "").includes(searchTerm.replace(/\D/g, ""));
              break;
            case "tenis":
              matchesSearch = (order.modeloTenis || "").toLowerCase().includes(searchTerm.toLowerCase());
              break;
            default:
              matchesSearch = true;
          }
        } else {
          matchesSearch = true;
        }
        // Filter by date range
        let matchesDate = true;
        if (dateFrom || dateTo) {
          const orderDate = new Date(order.createdAt || order.dataPrevistaEntrega);
          if (dateFrom) {
            matchesDate = matchesDate && orderDate >= new Date(dateFrom);
          }
          if (dateTo) {
            matchesDate = matchesDate && orderDate <= new Date(dateTo);
          }
        }
        // Filter by status
        const matchesStatus = statusFilter === "todos" || order.status === statusFilter;
        return matchesSearch && matchesDate && matchesStatus;
      })
    : [];

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
          <>
            {/* Success Message */}
            {successMessage && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}
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
                              <h3 className="font-semibold text-lg">{client.nomeCompleto}</h3>
                              <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
                              <p className="text-sm text-muted-foreground">Telefone: {client.telefone}</p>
                              <p className="text-sm text-muted-foreground">Email: {client.email}</p>
                              <p className="text-sm text-muted-foreground">Endereço: {client.logradouro}, {client.numero} {client.complemento ? `- ${client.complemento}` : ""}, {client.bairro}, {client.cidade} - {client.estado}, CEP: {client.cep}</p>
                              {client.observacoes && (
                                <p className="text-xs text-muted-foreground italic">Obs: {client.observacoes}</p>
                              )}
                            </div>
                            <div className="text-right">
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
                                Cliente ID: {order.clientId}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-muted-foreground">Tênis</p>
                                  <p>{order.modeloTenis}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Serviço</p>
                                  <p>{order.servicos}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Valor</p>
                                  <p className="font-semibold text-green-600">R$ {order.price?.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Previsão</p>
                                  <p>{order.dataPrevistaEntrega}</p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Descrição:</strong> {order.descricaoServicos}
                              </p>
                              {order.fotos && order.fotos.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {order.fotos.map((foto: string, idx: number) => (
                                    <img
                                      key={idx}
                                      src={foto}
                                      alt={`Foto do pedido ${order.id} - ${idx + 1}`}
                                      className="w-full h-24 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                Ver
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditOrder(order)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateOrderPDF(order)}
                                title="Gerar PDF do pedido"
                              >
                                <FileText className="w-4 h-4" />
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
          </>
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

        {/* Modal de detalhes do pedido */}
        <CardDetalhesPedido
          open={modalOpen}
          pedido={selectedOrder}
          onClose={handleCloseModal}
        />

        {/* Modal de edição do pedido */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Editar Pedido {editingOrder && `#${editingOrder.id}`}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modeloTenis">Modelo do Tênis</Label>
                  <Input
                    id="modeloTenis"
                    value={editForm.modeloTenis}
                    onChange={(e) => setEditForm({ ...editForm, modeloTenis: e.target.value })}
                    placeholder="Digite o modelo do tênis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicos">Serviços</Label>
                  <Input
                    id="servicos"
                    value={editForm.servicos}
                    onChange={(e) => setEditForm({ ...editForm, servicos: e.target.value })}
                    placeholder="Digite os serviços"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricaoServicos">Descrição dos Serviços</Label>
                <Textarea
                  id="descricaoServicos"
                  value={editForm.descricaoServicos}
                  onChange={(e) => setEditForm({ ...editForm, descricaoServicos: e.target.value })}
                  placeholder="Descreva os serviços detalhadamente"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Valor (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPrevistaEntrega">Data Prevista</Label>
                  <Input
                    id="dataPrevistaEntrega"
                    type="date"
                    value={editForm.dataPrevistaEntrega}
                    onChange={(e) => setEditForm({ ...editForm, dataPrevistaEntrega: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditModal} disabled={editLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSaveOrder} disabled={editLoading}>
                {editLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
