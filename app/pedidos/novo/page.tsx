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
import { ArrowLeft, Loader2, CheckCircle, Search, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock clients data
const mockClients = [
  { id: "1", name: "João Silva", cpf: "123.456.789-00", phone: "(11) 99999-9999" },
  { id: "2", name: "Maria Santos", cpf: "987.654.321-00", phone: "(11) 88888-8888" },
  { id: "3", name: "Pedro Costa", cpf: "456.789.123-00", phone: "(11) 77777-7777" },
  { id: "4", name: "Ana Oliveira", cpf: "321.654.987-00", phone: "(11) 66666-6666" },
]

const serviceTypes = [
  "Limpeza Simples",
  "Limpeza Completa",
  "Restauração",
  "Reparo",
  "Customização",
  "Pintura",
  "Troca de Sola",
  "Costura",
]

export default function NewOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientId: "",
    sneaker: "",
    serviceType: "",
    description: "",
    price: "",
    expectedDate: "",
    status: "iniciado",
  })
  const [clientSearch, setClientSearch] = useState("")
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

  const filteredClients = mockClients.filter(
    (client) => client.name.toLowerCase().includes(clientSearch.toLowerCase()) || client.cpf.includes(clientSearch),
  )

  const selectedClient = mockClients.find((client) => client.id === formData.clientId)

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId) {
      newErrors.clientId = "Cliente é obrigatório"
    }

    if (!formData.sneaker.trim()) {
      newErrors.sneaker = "Modelo do tênis é obrigatório"
    }

    if (!formData.serviceType) {
      newErrors.serviceType = "Tipo de serviço é obrigatório"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (!formData.price.trim()) {
      newErrors.price = "Preço é obrigatório"
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Preço deve ser um número válido maior que zero"
    }

    if (!formData.expectedDate) {
      newErrors.expectedDate = "Data prevista é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }


  setIsLoading(true)

    // Mock API call
    setTimeout(() => {
      const orderData = {
        ...formData,
        id: String(Date.now()).slice(-3),
        clientName: selectedClient?.name,
        clientCpf: selectedClient?.cpf,
        createdDate: new Date().toISOString().split("T")[0],
        photos,
      }
      console.log("Pedido criado:", orderData)
      setSuccess(true)
      setIsLoading(false)

      // Redireciona para /pedidos após 1 segundo
      setTimeout(() => {
        router.push("/pedidos")
      }, 1000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pedidos">
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
                          className={`p-3 cursor-pointer hover:bg-muted ${
                            formData.clientId === client.id ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            handleSelectChange("clientId", client.id)
                            setClientSearch("")
                          }}
                        >
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.cpf} - {client.phone}
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
                        {selectedClient.cpf} - {selectedClient.phone}
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
                  <Label htmlFor="serviceType">Tipo de Serviço *</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => handleSelectChange("serviceType", value)}
                  >
                    <SelectTrigger className={errors.serviceType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType}</p>}
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Serviço *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente o serviço a ser realizado..."
                  rows={3}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

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
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciado">Iniciado</SelectItem>
                      <SelectItem value="em-processamento">Em Processamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
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
