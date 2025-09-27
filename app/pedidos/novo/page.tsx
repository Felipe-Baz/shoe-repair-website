"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, CheckCircle, Search, Upload, X, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { createPedidoService, getClientesService, getStatusColumnsService } from "@/lib/apiService"
import { useRouter } from "next/navigation"

// Serviços disponíveis com preços sugeridos
const availableServices = [
  { id: "limpeza-simples", name: "Limpeza Simples", suggestedPrice: 30 },
  { id: "limpeza-completa", name: "Limpeza Completa", suggestedPrice: 50 },
  { id: "restauracao", name: "Restauração", suggestedPrice: 80 },
  { id: "reparo", name: "Reparo", suggestedPrice: 40 },
  { id: "customizacao", name: "Customização", suggestedPrice: 120 },
  { id: "pintura", name: "Pintura", suggestedPrice: 60 },
  { id: "troca-sola", name: "Troca de Sola", suggestedPrice: 70 },
  { id: "costura", name: "Costura", suggestedPrice: 35 },
];

// Acessórios disponíveis (vindos do env ou padrão)
const defaultAccessories = [
  "Cadarços originais",
  "Palmilhas",
  "Sola extra",
  "Etiquetas de marca",
  "Caixa original",
  "Sacola de proteção",
  "Manual de cuidados",
  "Certificado de garantia"
];

interface StatusColumn {
  [columnName: string]: any[];
}

// Departamentos disponíveis
const departments = [
  { value: "atendimento", label: "Atendimento" },
  { value: "lavagem", label: "Lavagem" },
  { value: "pintura", label: "Pintura" },
  { value: "costura", label: "Costura" },
  { value: "acabamento", label: "Acabamento" },
];

// Interface para serviços selecionados
interface SelectedService {
  id: string;
  name: string;
  price: number;
  description: string;
}

import { useEffect } from "react"

export default function NewOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientId: "",
    sneaker: "",
    expectedDate: "",
    department: "atendimento", // Departamento de destino
    observations: "",
  })
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [signalType, setSignalType] = useState("50") // "50", "100", "custom"
  const [signalValue, setSignalValue] = useState(0)
  const [hasWarranty, setHasWarranty] = useState(false)
  const [warrantyPrice, setWarrantyPrice] = useState(20) // Preço padrão da garantia
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([])
  const [customAccessory, setCustomAccessory] = useState("")
  const [clientSearch, setClientSearch] = useState("")
  const [clients, setClients] = useState<any[]>([]);
  const [statusColumns, setStatusColumns] = useState<StatusColumn>({});
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    async function fetchdata() {
      try {
        const [columnsData, clientsData] = await Promise.all([
          getStatusColumnsService(),
          getClientesService()
        ]);

        setStatusColumns(columnsData);
        setClients(clientsData);
      } catch (err) {
        // erro ao buscar clientes
      } finally {
        setLoadingClients(false);
      }
    }
    fetchdata();
  }, []);

  // Fotos do tênis
  const [photos, setPhotos] = useState<File[]>([])
  // Manipuladores de upload/remover foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    // Limita a 5 fotos e 5MB cada
    const validFiles = filesArray.filter(f => f.size <= 5 * 1024 * 1024).slice(0, 5 - photos.length);
    setPhotos(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredClients = clients.filter(
    (client: any) =>
      (client.nomeCompleto?.toLowerCase() || "").includes(clientSearch.toLowerCase()) ||
      (client.cpf || "").includes(clientSearch)
  );

  const selectedClient = clients.find((client: any) => client.id === formData.clientId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Funções para gerenciar serviços selecionados
  const toggleService = (serviceId: string, checked: boolean) => {
    if (checked) {
      const service = availableServices.find(s => s.id === serviceId);
      if (service && !selectedServices.find(s => s.id === serviceId)) {
        const newService = {
          id: service.id,
          name: service.name,
          price: service.suggestedPrice,
          description: ""
        };
        const newServices = [...selectedServices, newService];
        setSelectedServices(newServices);
        // Atualizar preço total automaticamente
        const servicesTotal = newServices.reduce((total, s) => total + s.price, 0);
        const newTotal = servicesTotal + (hasWarranty ? warrantyPrice : 0);
        setTotalPrice(newTotal);
        // Atualizar valor do sinal
        updateSignalValue(newTotal);
      }
    } else {
      const newServices = selectedServices.filter(s => s.id !== serviceId);
      setSelectedServices(newServices);
      // Atualizar preço total automaticamente
      const servicesTotal = newServices.reduce((total, s) => total + s.price, 0);
      const newTotal = servicesTotal + (hasWarranty ? warrantyPrice : 0);
      setTotalPrice(newTotal);
      // Atualizar valor do sinal
      updateSignalValue(newTotal);
    }
  };

  const updateService = (serviceId: string, field: 'price' | 'description', value: string | number) => {
    const newServices = selectedServices.map(service =>
      service.id === serviceId
        ? { ...service, [field]: value }
        : service
    );
    setSelectedServices(newServices);
    
    // Atualizar preço total automaticamente se for alteração de preço
    if (field === 'price') {
      const servicesTotal = newServices.reduce((total, s) => total + s.price, 0);
      const newTotal = servicesTotal + (hasWarranty ? warrantyPrice : 0);
      setTotalPrice(newTotal);
      // Atualizar valor do sinal
      updateSignalValue(newTotal);
    }
  };

  const getTotalPrice = () => {
    return totalPrice;
  };

  // Função para atualizar valor do sinal baseado no tipo
  const updateSignalValue = (total: number) => {
    if (signalType === "50") {
      setSignalValue(total * 0.5);
    } else if (signalType === "100") {
      setSignalValue(total);
    }
    // Para "custom", mantém o valor atual
  };

  // Handler para mudança de preço total
  const handleTotalPriceChange = (newTotal: number) => {
    setTotalPrice(newTotal);
    updateSignalValue(newTotal);
  };

  // Handler para mudança de tipo de sinal
  const handleSignalTypeChange = (type: string) => {
    setSignalType(type);
    if (type === "50") {
      setSignalValue(totalPrice * 0.5);
    } else if (type === "100") {
      setSignalValue(totalPrice);
    }
    // Para "custom", mantém o valor atual
  };

  // Função para toggle da garantia
  const toggleWarranty = (checked: boolean) => {
    setHasWarranty(checked);
    const servicesTotal = selectedServices.reduce((total, s) => total + s.price, 0);
    const newTotal = servicesTotal + (checked ? warrantyPrice : 0);
    setTotalPrice(newTotal);
    updateSignalValue(newTotal);
  };

  // Função para atualizar preço da garantia
  const handleWarrantyPriceChange = (newPrice: number) => {
    setWarrantyPrice(newPrice);
    if (hasWarranty) {
      const servicesTotal = selectedServices.reduce((total, s) => total + s.price, 0);
      const newTotal = servicesTotal + newPrice;
      setTotalPrice(newTotal);
      updateSignalValue(newTotal);
    }
  };

  // Função para toggle de acessório
  const toggleAccessory = (accessory: string, checked: boolean) => {
    if (checked) {
      setSelectedAccessories(prev => [...prev, accessory]);
    } else {
      setSelectedAccessories(prev => prev.filter(acc => acc !== accessory));
    }
  };

  // Função para adicionar acessório customizado
  const addCustomAccessory = () => {
    if (customAccessory.trim() && !selectedAccessories.includes(customAccessory.trim())) {
      setSelectedAccessories(prev => [...prev, customAccessory.trim()]);
      setCustomAccessory("");
    }
  };

  // Função para remover acessório
  const removeAccessory = (accessory: string) => {
    setSelectedAccessories(prev => prev.filter(acc => acc !== accessory));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId) {
      newErrors.clientId = "Cliente é obrigatório"
    }

    if (!formData.sneaker.trim()) {
      newErrors.sneaker = "Modelo do tênis é obrigatório"
    }

    if (selectedServices.length === 0) {
      newErrors.services = "Pelo menos um serviço deve ser selecionado"
    }

    // Validar se todos os serviços têm preço válido
    const hasInvalidService = selectedServices.some(service =>
      service.price <= 0 || isNaN(service.price)
    );
    if (hasInvalidService) {
      newErrors.services = "Todos os serviços devem ter preços válidos"
    }

    if (!formData.expectedDate) {
      newErrors.expectedDate = "Data prevista é obrigatória"
    }

    if (!formData.department) {
      newErrors.department = "Departamento é obrigatório"
    }

    // Validar valor de sinal
    if (signalValue < 0 || signalValue > totalPrice) {
      newErrors.signal = "Valor de sinal deve estar entre R$ 0,00 e o valor total"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const fotosUrls = photos.map((file) => URL.createObjectURL(file));

      // Agregar informações dos serviços
      const servicosInfo = selectedServices.map(service => ({
        id: service.id,
        nome: service.name,
        preco: service.price,
        descricao: service.description
      }));

      // Adicionar informações de sinal, garantia e acessórios nas observações
      const garantiaInfo = hasWarranty ? `GARANTIA: 3 meses (R$ ${warrantyPrice.toFixed(2)})` : '';
      const acessoriosInfo = selectedAccessories.length > 0 ? `\n\nACESSÓRIOS: ${selectedAccessories.join(', ')}` : '';
      const observacoesCompletas = `${formData.observations}${formData.observations ? '\n\n' : ''}${garantiaInfo}${acessoriosInfo}\n\nSINAL: R$ ${signalValue.toFixed(2)} | RESTANTE: R$ ${Math.max(0, totalPrice - signalValue).toFixed(2)}${signalValue >= totalPrice ? ' (PAGO INTEGRALMENTE)' : ''}`;

      await createPedidoService({
        clienteId: formData.clientId,
        clientName: selectedClient?.nomeCompleto || "",
        modeloTenis: formData.sneaker,
        servicos: servicosInfo,
        fotos: fotosUrls,
        precoTotal: getTotalPrice(),
        dataPrevistaEntrega: formData.expectedDate,
        departamento: formData.department,
        observacoes: observacoesCompletas,
        status: getFirstStatusForSector(formData.department) || undefined,
      });
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrors({ api: err.message || "Erro ao criar pedido" });
    }
  }

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
              <h1 className="text-xl font-bold font-serif">Novo Pedido</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Pedido criado com sucesso!</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Pedido</CardTitle>
            <CardDescription>Preencha os dados do pedido de reforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente por nome ou CPF..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {clientSearch && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className={`p-3 cursor-pointer hover:bg-muted ${formData.clientId === client.id ? "bg-accent" : ""
                            }`}
                          onClick={() => {
                            handleSelectChange("clientId", client.id)
                            setClientSearch("")
                          }}
                        >
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Nome: {client.nomeCompleto} - cpf: {client.cpf}
                          </p>
                        </div>
                      ))}
                      {filteredClients.length === 0 && (
                        <div className="p-3 text-center text-muted-foreground">Nenhum cliente encontrado</div>
                      )}
                    </div>
                  )}
                  {selectedClient && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Nome: {selectedClient.nomeCompleto} - cpf: {selectedClient.cpf}
                      </p>
                    </div>
                  )}
                </div>
                {errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sneaker">Modelo do Tênis *</Label>
                  <Input
                    id="sneaker"
                    name="sneaker"
                    value={formData.sneaker}
                    onChange={handleInputChange}
                    placeholder="Ex: Nike Air Max 90"
                    className={errors.sneaker ? "border-destructive" : ""}
                  />
                  {errors.sneaker && <p className="text-sm text-destructive">{errors.sneaker}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger className={errors.department ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                </div>
              </div>


              {/* Seleção de Serviços */}
              <div className="space-y-4">
                <Label>Serviços *</Label>
                
                {/* Lista de Checkboxes para Serviços */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableServices.map((service) => {
                    const isSelected = selectedServices.find(s => s.id === service.id);
                    return (
                      <div key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={service.id}
                          checked={!!isSelected}
                          onChange={(e) => toggleService(service.id, e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor={service.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">R$ {service.suggestedPrice.toFixed(2)}</div>
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Seção de Garantia */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="warranty"
                          checked={hasWarranty}
                          onChange={(e) => toggleWarranty(e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="warranty" className="font-medium cursor-pointer">
                          Adicionar Garantia de 3 meses
                        </label>
                      </div>
                      <div className="text-sm text-gray-600">
                        Proteção adicional para o serviço
                      </div>
                    </div>
                    {hasWarranty && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-blue-200">
                        <div className="space-y-2">
                          <Label htmlFor="warrantyPrice">Preço da Garantia (R$)</Label>
                          <Input
                            id="warrantyPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={warrantyPrice}
                            onChange={(e) => handleWarrantyPriceChange(Number(e.target.value))}
                            placeholder="0.00"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-600">Cobertura</Label>
                          <div className="p-2 bg-white rounded text-sm">
                            <p>✓ Retrabalho gratuito por defeitos</p>
                            <p>✓ Troca de peças com defeito</p>
                            <p>✓ Suporte técnico especializado</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detalhes dos Serviços Selecionados */}
                {selectedServices.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-lg">Detalhes dos Serviços Selecionados:</h4>
                    {selectedServices.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">{service.name}</h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleService(service.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={service.price}
                              onChange={(e) => updateService(service.id, 'price', Number(e.target.value))}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição/Observações</Label>
                            <Input
                              value={service.description}
                              onChange={(e) => updateService(service.id, 'description', e.target.value)}
                              placeholder="Detalhes específicos do serviço..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Preço Total Editável */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Label htmlFor="totalPrice">Preço Total (R$) *</Label>
                          <Input
                            id="totalPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={totalPrice}
                            onChange={(e) => handleTotalPriceChange(Number(e.target.value))}
                            placeholder="0.00"
                            className="w-32 text-lg font-semibold"
                          />
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>Soma dos serviços: R$ {selectedServices.reduce((total, service) => total + service.price, 0).toFixed(2)}</p>
                          {hasWarranty && <p>Garantia (3 meses): R$ {warrantyPrice.toFixed(2)}</p>}
                          <p className="font-semibold">Subtotal: R$ {(selectedServices.reduce((total, service) => total + service.price, 0) + (hasWarranty ? warrantyPrice : 0)).toFixed(2)}</p>
                          <p className="text-xs">(Você pode ajustar o valor total acima)</p>
                        </div>
                      </div>
                    </div>

                    {/* Valor de Sinal */}
                    <div className="border-t pt-4">
                      <div className="space-y-4">
                        <Label>Valor de Sinal</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Opções de Porcentagem */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="signal50"
                                name="signalType"
                                value="50"
                                checked={signalType === "50"}
                                onChange={(e) => handleSignalTypeChange(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                              />
                              <label htmlFor="signal50" className="text-sm font-medium cursor-pointer">
                                50% do total
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="signal100"
                                name="signalType"
                                value="100"
                                checked={signalType === "100"}
                                onChange={(e) => handleSignalTypeChange(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                              />
                              <label htmlFor="signal100" className="text-sm font-medium cursor-pointer">
                                100% do total (à vista)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="signalCustom"
                                name="signalType"
                                value="custom"
                                checked={signalType === "custom"}
                                onChange={(e) => handleSignalTypeChange(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                              />
                              <label htmlFor="signalCustom" className="text-sm font-medium cursor-pointer">
                                Valor personalizado
                              </label>
                            </div>
                          </div>
                          {/* Valor do Sinal */}
                          <div className="space-y-2">
                            <Label htmlFor="signalValue">Valor do Sinal (R$)</Label>
                            <Input
                              id="signalValue"
                              type="number"
                              step="0.01"
                              min="0"
                              max={totalPrice}
                              value={signalValue}
                              onChange={(e) => setSignalValue(Number(e.target.value))}
                              placeholder="0.00"
                              disabled={signalType !== "custom"}
                              className={`text-lg font-semibold ${signalType !== "custom" ? "bg-gray-100" : ""}`}
                            />
                          </div>
                          {/* Valor Restante */}
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-600">Valor Restante</Label>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <p className="text-lg font-semibold text-gray-700">
                                R$ {Math.max(0, totalPrice - signalValue).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {signalValue >= totalPrice ? "Pago integralmente" : "A pagar na entrega"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {errors.services && <p className="text-sm text-destructive">{errors.services}</p>}
                {errors.signal && <p className="text-sm text-destructive">{errors.signal}</p>}
              </div>

              {/* Acessórios */}
              <div className="space-y-4">
                <Label>Acessórios</Label>
                
                {/* Lista de Acessórios Padrão */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {defaultAccessories.map((accessory) => {
                    const isSelected = selectedAccessories.includes(accessory);
                    return (
                      <div key={accessory} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={accessory}
                          checked={isSelected}
                          onChange={(e) => toggleAccessory(accessory, e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor={accessory} className="flex-1 cursor-pointer text-sm">
                          {accessory}
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Acessório Customizado */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    <Label className="font-medium">Adicionar Acessório Personalizado</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Fivela especial, Solado antiderrapante..."
                        value={customAccessory}
                        onChange={(e) => setCustomAccessory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomAccessory();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addCustomAccessory}
                        disabled={!customAccessory.trim()}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Acessórios Selecionados */}
                {selectedAccessories.length > 0 && (
                  <div className="space-y-3">
                    <Label className="font-medium text-lg">Acessórios Selecionados:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedAccessories.map((accessory, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{accessory}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAccessory(accessory)}
                            className="h-4 w-4 p-0 hover:bg-blue-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <Label>Fotos do Tênis</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para adicionar fotos (máximo 5 fotos, até 5MB cada)
                    </p>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo) || "/placeholder.svg"}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Data Prevista *</Label>
                  <Input
                    id="expectedDate"
                    name="expectedDate"
                    type="date"
                    value={formData.expectedDate}
                    onChange={handleInputChange}
                    className={errors.expectedDate ? "border-destructive" : ""}
                  />
                  {errors.expectedDate && <p className="text-sm text-destructive">{errors.expectedDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações Gerais</Label>
                  <Textarea
                    id="observations"
                    name="observations"
                    value={formData.observations}
                    onChange={handleInputChange}
                    placeholder="Observações adicionais sobre o pedido..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Pedido...
                    </>
                  ) : (
                    "Criar Pedido"
                  )}
                </Button>
                <Link href="/pedidos">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
