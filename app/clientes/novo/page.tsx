"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

import { createClienteService } from "@/lib/apiService"
import { useRouter } from "next/navigation"

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    address: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Busca CEP na API ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "").slice(0, 8)
    setFormData((prev) => ({ ...prev, cep }))
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
            address: `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.replace(/^, |, ,/g, '')
          }))
        }
      } catch (err) {
        // erro ao buscar cep
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = "CPF deve estar no formato 000.000.000-00"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email deve ter um formato válido"
    }

    if (!formData.cep.trim()) {
      newErrors.cep = "CEP é obrigatório"
    } else if (!/^\d{8}$/.test(formData.cep)) {
      newErrors.cep = "CEP deve ter 8 dígitos"
    }
    if (!formData.logradouro.trim()) {
      newErrors.logradouro = "Logradouro é obrigatório"
    }
    if (!formData.numero.trim()) {
      newErrors.numero = "Número é obrigatório"
    }
    if (!formData.bairro.trim()) {
      newErrors.bairro = "Bairro é obrigatório"
    }
    if (!formData.cidade.trim()) {
      newErrors.cidade = "Cidade é obrigatória"
    }
    if (!formData.estado.trim()) {
      newErrors.estado = "Estado é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      await createClienteService({
        nomeCompleto: formData.name,
        cpf: formData.cpf.replace(/\D/g, ""),
        telefone: formData.phone.replace(/\D/g, ""),
        email: formData.email,
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        complemento: formData.complemento,
        observacoes: formData.notes,
      });
      setSuccess(true);
      setIsLoading(false);
      router.push("/clientes");
    } catch (err: any) {
      setIsLoading(false);
      setErrors({ api: err.message || "Erro ao cadastrar cliente" });
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({ ...prev, cpf: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/clientes">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-xl font-bold font-serif">Novo Cliente</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Cliente cadastrado com sucesso!</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Cliente</CardTitle>
            <CardDescription>Preencha os dados do cliente para cadastrá-lo no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Digite o nome completo"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={errors.cpf ? "border-destructive" : ""}
                  />
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="cliente@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleCepChange}
                    placeholder="00000000"
                    maxLength={8}
                    className={errors.cep ? "border-destructive" : ""}
                  />
                  {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleInputChange}
                    placeholder="Rua Exemplo"
                    className={errors.logradouro ? "border-destructive" : ""}
                  />
                  {errors.logradouro && <p className="text-sm text-destructive">{errors.logradouro}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    placeholder="Nº"
                    className={errors.numero ? "border-destructive" : ""}
                  />
                  {errors.numero && <p className="text-sm text-destructive">{errors.numero}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    placeholder="Bairro"
                    className={errors.bairro ? "border-destructive" : ""}
                  />
                  {errors.bairro && <p className="text-sm text-destructive">{errors.bairro}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                    className={errors.cidade ? "border-destructive" : ""}
                  />
                  {errors.cidade && <p className="text-sm text-destructive">{errors.cidade}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    placeholder="UF"
                    maxLength={2}
                    className={errors.estado ? "border-destructive" : ""}
                  />
                  {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                  placeholder="Apto, bloco, etc. (opcional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    placeholder="Bairro"
                    className={errors.bairro ? "border-destructive" : ""}
                  />
                  {errors.bairro && <p className="text-sm text-destructive">{errors.bairro}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                    className={errors.cidade ? "border-destructive" : ""}
                  />
                  {errors.cidade && <p className="text-sm text-destructive">{errors.cidade}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    placeholder="UF"
                    maxLength={2}
                    className={errors.estado ? "border-destructive" : ""}
                  />
                  {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informações adicionais sobre o cliente (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Cliente"
                  )}
                </Button>
                <Link href="/clientes">
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
