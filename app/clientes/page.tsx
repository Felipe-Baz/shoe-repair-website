"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Phone, Mail, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data for clients
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

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients] = useState(mockClients)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf.includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <h1 className="text-xl font-bold font-serif">Clientes</h1>
            </div>
            <Link href="/clientes/novo">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
            <CardDescription>Pesquise por nome, CPF, telefone ou email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Lista de Clientes</h2>
            <Badge variant="secondary">{filteredClients.length} clientes encontrados</Badge>
          </div>

          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{client.name}</h3>
                            <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{client.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm font-medium">{client.totalOrders} pedidos</p>
                          <p className="text-xs text-muted-foreground">Último: {client.lastOrder}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver Pedidos
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
