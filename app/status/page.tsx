"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Play, Eye, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { CardDetalhesPedido } from "@/components/CardDetalhesPedido"
import { getStatusColumnsService, getOrdersStatusService, updateOrderStatusService, generateOrderPDFService } from "@/lib/apiService"

// Interface para as colunas de status
interface StatusColumn {
  [columnName: string]: any[];
}

// Interface para um pedido
interface Order {
  id: string;
  clientName: string;
  clientId: string;
  clientCpf: string;
  sneaker: string;
  serviceType: string;
  servicos: string;
  description: string;
  price: number;
  status: string;
  createdDate: string;
  expectedDate: string;
  statusHistory: Array<{
    status: string;
    date: string;
    time: string;
  }>;
}

const getStatusInfo = (status: string) => {
  // Map common status to their display info
  const statusMap: { [key: string]: any } = {
    "A Fazer": {
      label: "A Fazer",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Play,
      bgColor: "bg-yellow-50",
    },
    "Em Andamento": {
      label: "Em Andamento",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock,
      bgColor: "bg-blue-50",
    },
    "Concluído": {
      label: "Concluído",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      bgColor: "bg-green-50",
    },
    "iniciado": {
      label: "Iniciado",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Play,
      bgColor: "bg-yellow-50",
    },
    "em-processamento": {
      label: "Em Processamento",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock,
      bgColor: "bg-blue-50",
    },
    "concluido": {
      label: "Concluído",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      bgColor: "bg-green-50",
    }
  };

  return statusMap[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Clock,
    bgColor: "bg-gray-50",
  };
}

export default function StatusControlPage() {
  const [statusColumns, setStatusColumns] = useState<StatusColumn>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedSector, setSelectedSector] = useState("next"); // "next", "atendimento", "lavagem", "pintura"
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega as colunas de status e pedidos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Usando API real
        const [columnsData, ordersData] = await Promise.all([
          getStatusColumnsService(),
          getOrdersStatusService()
        ]);
        
        setStatusColumns(columnsData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Em caso de erro, mostra mensagem e mantém tela vazia
        setSuccessMessage("Erro ao carregar dados. Verifique sua conexão e tente novamente.");
        setStatusColumns({});
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Atualiza no backend
      const updatedOrder = await updateOrderStatusService(orderId, newStatus);
      
      // Atualiza localmente com os dados retornados do backend
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus,
              statusHistory: updatedOrder.statusHistory || [
                ...order.statusHistory,
                {
                  status: newStatus,
                  date: new Date().toISOString().split("T")[0],
                  time: new Date().toTimeString().slice(0, 5),
                }
              ]
            };
          }
          return order;
        }),
      );

      setSuccessMessage(`Pedido #${orderId} atualizado para ${getStatusInfo(newStatus).label}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      
      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao atualizar status do pedido";
      if (error.message.includes("não tem permissão")) {
        errorMessage = "Você não tem permissão para alterar para este status";
      } else if (error.message.includes("não encontrado")) {
        errorMessage = "Pedido não encontrado";
      } else if (error.message.includes("Token")) {
        errorMessage = "Sessão expirada. Faça login novamente";
      }
      
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

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

  // Função para gerar PDF do pedido
  const generateOrderPDF = async (order: Order) => {
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
  };  // Função para avançar pedido por número do pedido ou CPF do cliente
  const handleQuickAdvance = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Busca por número do pedido
    let foundOrder = orders.find(o => o.id === trimmed);
    // Se não achou, busca por CPF do cliente
    if (!foundOrder) {
      foundOrder = orders.find(o => o.clientCpf.replace(/\D/g, "") === trimmed.replace(/\D/g, ""));
    }

    if (foundOrder) {
      let nextStatus: string | null = null;
      let actionMessage = "";

      if (selectedSector === "next") {
        // Comportamento original: próximo status sequencial
        const columnNames = Object.keys(statusColumns);
        const currentIndex = columnNames.indexOf(foundOrder.status);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < columnNames.length) {
          nextStatus = columnNames[nextIndex];
          actionMessage = `avançado para ${getStatusInfo(nextStatus).label}`;
        }
      } else {
        // Mover para setor específico
        const currentSector = getCurrentSector(foundOrder.status);
        const targetSector = selectedSector;
        
        if (currentSector === targetSector) {
          // Se já está no setor, avança para o próximo status do mesmo setor
          const columnNames = Object.keys(statusColumns);
          const sectorColumns = columnNames.filter(col => col.includes(targetSector === "atendimento" ? "Atendimento" : 
                                                                        targetSector === "lavagem" ? "Lavagem" : "Pintura"));
          const currentIndex = sectorColumns.indexOf(foundOrder.status);
          const nextIndex = currentIndex + 1;
          
          if (nextIndex < sectorColumns.length) {
            nextStatus = sectorColumns[nextIndex];
            actionMessage = `avançado para ${getStatusInfo(nextStatus).label}`;
          } else {
            setSuccessMessage(`Pedido #${foundOrder.id} já está no último status do setor ${targetSector}`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setInputValue("");
            inputRef.current?.focus();
            return;
          }
        } else {
          // Mover para o primeiro status do setor de destino
          nextStatus = getFirstStatusForSector(targetSector);
          if (nextStatus) {
            actionMessage = `movido para ${getAvailableSectors().find(s => s.value === targetSector)?.label} - ${getStatusInfo(nextStatus).label}`;
          }
        }
      }
      
      if (nextStatus) {
        updateOrderStatus(foundOrder.id, nextStatus);
        setSuccessMessage(`Pedido #${foundOrder.id} ${actionMessage}`);
      } else {
        if (selectedSector === "next") {
          setSuccessMessage(`Pedido #${foundOrder.id} já está no status final`);
        } else {
          setSuccessMessage(`Não foi possível mover para o setor ${selectedSector}`);
        }
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setSuccessMessage("Pedido ou cliente não encontrado");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setInputValue("");
    inputRef.current?.focus();
  };

  // Função para obter o primeiro status de um setor específico
  const getFirstStatusForSector = (sector: string): string | null => {
    const columnNames = Object.keys(statusColumns);
    
    switch (sector) {
      case "atendimento":
        // Prioriza "A Fazer" do atendimento, senão pega o primeiro disponível
        return columnNames.find(col => col.includes("Atendimento") && col.includes("Recebido")) ||
               columnNames.find(col => col.includes("Atendimento")) || null;
      case "lavagem":
        // Prioriza "A Fazer" da lavagem, senão pega o primeiro disponível
        return columnNames.find(col => col.includes("Lavagem") && col.includes("A Fazer")) ||
               columnNames.find(col => col.includes("Lavagem")) || null;
      case "pintura":
        // Prioriza "A Fazer" da pintura, senão pega o primeiro disponível
        return columnNames.find(col => col.includes("Pintura") && col.includes("A Fazer")) ||
               columnNames.find(col => col.includes("Pintura")) || null;
      default:
        return null;
    }
  };

  // Função para obter setores disponíveis baseado nas colunas
  const getAvailableSectors = () => {
    const columnNames = Object.keys(statusColumns);
    const sectors = [];
    
    if (columnNames.some(col => col.includes("Atendimento"))) {
      sectors.push({ value: "atendimento", label: "Atendimento" });
    }
    if (columnNames.some(col => col.includes("Lavagem"))) {
      sectors.push({ value: "lavagem", label: "Lavagem" });
    }
    if (columnNames.some(col => col.includes("Pintura"))) {
      sectors.push({ value: "pintura", label: "Pintura" });
    }
    
    return sectors;
  };

  // Função para obter o setor atual de um status
  const getCurrentSector = (status: string): string => {
    if (status.includes("Atendimento")) return "atendimento";
    if (status.includes("Lavagem")) return "lavagem";
    if (status.includes("Pintura")) return "pintura";
    return "unknown";
  };

  // Organiza os pedidos por status baseado nas colunas dinâmicas
  const ordersByStatus = Object.keys(statusColumns).reduce((acc, columnName) => {
    acc[columnName] = orders.filter((order) => order.status === columnName);
    return acc;
  }, {} as { [key: string]: Order[] });

  const getNextStatus = (currentStatus: string) => {
    const columnNames = Object.keys(statusColumns);
    const currentIndex = columnNames.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < columnNames.length - 1 
      ? columnNames[currentIndex + 1] 
      : null;
  };

  const getPreviousStatus = (currentStatus: string) => {
    const columnNames = Object.keys(statusColumns);
    const currentIndex = columnNames.indexOf(currentStatus);
    return currentIndex > 0 ? columnNames[currentIndex - 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando status dos pedidos...</p>
        </div>
      </div>
    );
  }

  // Verificar se não há dados (possível erro de API ou usuário sem permissões)
  const hasData = Object.keys(statusColumns).length > 0;
  const hasOrders = orders.length > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-background">
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Não foi possível carregar as colunas de status. Verifique sua conexão e permissões, ou entre em contato com o administrador.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma coluna de status disponível
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Isso pode acontecer se você não tiver permissões adequadas ou se houver um problema na conexão com o servidor.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header visual para a página de status */}
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
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full">
            <label htmlFor="quick-advance" className="font-medium text-foreground">
              Mover pedido rapidamente:
            </label>
            
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
              <input
                ref={inputRef}
                id="quick-advance"
                type="text"
                placeholder="Digite o número do pedido ou CPF do cliente"
                className="border rounded px-3 py-2 w-full md:w-[350px] transition-all"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleQuickAdvance() }}
              />
              
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Escolha o destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Próximo Status</SelectItem>
                  {getAvailableSectors().map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleQuickAdvance} className="w-full md:w-auto">
                {selectedSector === "next" ? "Avançar" : "Mover para"} Pedido
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Explicação do funcionamento */}
          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">
              {selectedSector === "next" ? (
                "Avança o pedido para o próximo status sequencial"
              ) : (
                `Move o pedido para o setor de ${getAvailableSectors().find(s => s.value === selectedSector)?.label || selectedSector}. Se já estiver no setor, avança para o próximo status.`
              )}
            </p>
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

        {/* Status Overview - Dinâmico baseado nas colunas */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(Object.keys(statusColumns).length, 4)} gap-6 mb-8`}>
          {Object.keys(statusColumns).map((columnName) => {
            const statusInfo = getStatusInfo(columnName);
            const StatusIcon = statusInfo.icon;
            const count = ordersByStatus[columnName]?.length || 0;

            return (
              <Card key={columnName} className={`${statusInfo.bgColor.replace('bg-', 'border-').replace('-50', '-200')}`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center ${statusInfo.color.split(' ')[1]}`}>
                    <StatusIcon className="w-5 h-5 mr-2" />
                    {columnName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${statusInfo.color.split(' ')[1]}`}>{count}</div>
                  <p className={`text-sm ${statusInfo.color.split(' ')[1].replace('800', '600')}`}>
                    pedidos {count === 1 ? 'neste status' : 'neste status'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status Columns - Dinâmicas */}
        <div className={`grid grid-cols-1 lg:grid-cols-${Math.min(Object.keys(statusColumns).length, 3)} gap-6`}>
          {Object.keys(statusColumns).map((columnName) => {
            const statusInfo = getStatusInfo(columnName);
            const StatusIcon = statusInfo.icon;
            const columnOrders = ordersByStatus[columnName] || [];

            return (
              <Card
                key={columnName}
                className={`${statusInfo.bgColor} border-2`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(columnName)}
                style={{ minHeight: 300, opacity: draggedOrderId ? 0.97 : 1, borderStyle: draggedOrderId ? "dashed" : undefined }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <StatusIcon className="w-5 h-5 mr-2" />
                    {columnName}
                  </CardTitle>
                  <CardDescription>{columnOrders.length} pedidos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {columnOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <StatusIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pedido neste status</p>
                    </div>
                  ) : (
                    columnOrders.map((order) => (
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
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => generateOrderPDF(order)}
                                  className="bg-transparent p-1 h-12 w-12"
                                  title="Gerar PDF do pedido"
                                >
                                  <FileText className="w-8 h-8" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Tênis:</strong> {order.sneaker}
                              </p>
                              <p>
                                <strong>Serviço:</strong> {order.servicos}
                              </p>
                              <p>
                                <strong>Valor:</strong> R$ {Number(order.price).toFixed(2)}
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
                                onClick={() => { 
                                  console.log("Visualizando detalhes do pedido", order);
                                  setSelectedOrder(order) }
                              }
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
            );
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
      {selectedOrder && (
        <CardDetalhesPedido
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          pedido={{
            ...selectedOrder,
            clientId: selectedOrder.clientId, // Mapeamento temporário
            modeloTenis: selectedOrder.sneaker,
            servicos: selectedOrder.servicos,
            descricaoServicos: selectedOrder.description,
            price: selectedOrder.price,
            dataPrevistaEntrega: selectedOrder.expectedDate,
            dataCriacao: selectedOrder.createdDate,
            fotos: [], // Array vazio por padrão
            observacoes: "", // String vazia por padrão
          }}
        />
      )}
    </div>
  );
}
