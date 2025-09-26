import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getClienteByIdService } from "@/lib/apiService";

export interface PedidoDetalhes {
  id: string;
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientPhone?: string; // Adicionado telefone do cliente (opcional)
  sneaker: string;
  servicos: string;
  price: number;
  status: string;
  createdDate: string;
  expectedDate: string;
  statusHistory: Array<{
    status: string;
    date: string;
    time: string;
  }>;
  [key: string]: any; // Para permitir campos extras
}

interface Cliente {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  observacoes?: string;
}

export interface CardDetalhesPedidoProps {
  open: boolean;
  pedido: PedidoDetalhes | null;
  onClose: () => void;
}

export const CardDetalhesPedido: React.FC<CardDetalhesPedidoProps> = ({ open, onClose, pedido }) => {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");

  // Busca os dados do cliente quando o modal é aberto
  useEffect(() => {
    const fetchCliente = async () => {
      if (!open || !pedido?.clientId) return;

      try {
        setLoadingCliente(true);
        setErrorCliente("");
        console.log("Buscando dados do cliente para ID:", pedido.clientId);
        const clienteData = await getClienteByIdService(pedido.clientId);
        setCliente(clienteData);
      } catch (err: any) {
        console.error("Erro ao carregar cliente:", err);
        setErrorCliente(err.message || "Erro ao carregar dados do cliente");
        setCliente(null);
      } finally {
        setLoadingCliente(false);
      }
    };

    fetchCliente();
  }, [open, pedido?.clientId]);

  // Reset do estado quando o modal fecha
  useEffect(() => {
    if (!open) {
      setCliente(null);
      setErrorCliente("");
      setLoadingCliente(false);
    }
  }, [open]);

  if (!pedido) return null;
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Detalhes do Pedido #{pedido.id}</DialogTitle>
          <DialogDescription>
            {loadingCliente ? (
              "Carregando dados do cliente..."
            ) : errorCliente ? (
              <span className="text-red-500">Erro: {errorCliente}</span>
            ) : cliente ? (
              <>
                Cliente: <span className="font-semibold">{cliente.nomeCompleto}</span> ({cliente.cpf}
                {cliente.telefone ? ` • ${cliente.telefone}` : ""})
              </>
            ) : (
              <>
                Cliente: <span className="font-semibold">{pedido.clientName}</span> ({pedido.clientCpf}
                {pedido.clientPhone ? ` • ${pedido.clientPhone}` : ""})
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-2">{/*Conteúdo com scroll*/}
          <div><strong>Tênis:</strong> {pedido.sneaker}</div>
          <div><strong>Serviço:</strong> {pedido.servicos}</div>
          <div><strong>Valor:</strong> R$ {pedido.price ? Number(pedido.price).toFixed(2) : '0,00'}</div>
          <div><strong>Status:</strong> {pedido.status}</div>
          <div><strong>Data de Criação:</strong> {pedido.createdDate}</div>
          <div><strong>Previsão:</strong> {pedido.expectedDate}</div>
          
          {/* Dados completos do cliente */}
          {cliente && (
            <div className="border-t pt-3 mt-4">
              <div className="font-semibold mb-2">Dados do Cliente:</div>
              <div><strong>Nome:</strong> {cliente.nomeCompleto}</div>
              <div><strong>CPF:</strong> {cliente.cpf}</div>
              <div><strong>Telefone:</strong> {cliente.telefone}</div>
              <div><strong>Email:</strong> {cliente.email}</div>
              <div>
                <strong>Endereço:</strong> {cliente.logradouro}, {cliente.numero}
                {cliente.complemento && `, ${cliente.complemento}`}
                <br />
                {cliente.bairro}, {cliente.cidade} - {cliente.estado}
                <br />
                CEP: {cliente.cep}
              </div>
              {cliente.observacoes && (
                <div><strong>Observações do Cliente:</strong> {cliente.observacoes}</div>
              )}
            </div>
          )}
          
          <div>
            <strong>Histórico:</strong>
            <ul className="list-disc ml-5">
              {pedido.statusHistory.map((h, i) => (
                <li key={i}>{h.status} - {h.date} às {h.time}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-shrink-0 border-t pt-4">{/*Botões fixos na parte inferior*/}
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push(`/clientes/${pedido.clientId}`)}
            disabled={loadingCliente}
          >
            {loadingCliente ? "Carregando..." : "Ver Cliente"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
