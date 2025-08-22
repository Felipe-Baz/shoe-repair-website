"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockClients = [
  {
    id: "123",
    cpf: "123.456.789-00",
    name: "João Silva",
    phone: "(11) 99999-9999",
    email: "joao@email.com",
    address: "Rua Exemplo, 123, Centro, São Paulo - SP",
    createdAt: "2024-01-10",
    pedidos: [
      { id: "001", status: "em-processamento" },
      { id: "007", status: "concluido" },
    ],
  },
];

export default function ClienteDetalhesPage() {
  const params = useParams();
  const id = decodeURIComponent(params?.id as string);
  const cliente = mockClients.find((c) => c.id === id);

  if (!cliente) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Cliente não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/clientes">
              <Button variant="outline">Voltar para lista de clientes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><strong>Nome:</strong> {cliente.name}</div>
          <div><strong>CPF:</strong> {cliente.cpf}</div>
          <div><strong>Telefone:</strong> {cliente.phone}</div>
          <div><strong>Email:</strong> {cliente.email}</div>
          <div><strong>Endereço:</strong> {cliente.address}</div>
          <div><strong>Cliente desde:</strong> {cliente.createdAt}</div>
          <div>
            <strong>Pedidos:</strong>
            <ul className="list-disc ml-5">
              {cliente.pedidos.map((p) => (
                <li key={p.id}>
                  Pedido #{p.id} - Status: {p.status}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/clientes">
            <Button variant="outline" className="mt-4">Voltar</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
