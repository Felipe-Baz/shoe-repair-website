import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface PedidoDetalhes {
  id: string;
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientPhone?: string; // Adicionado telefone do cliente (opcional)
  sneaker: string;
  serviceType: string;
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
  [key: string]: any; // Para permitir campos extras
}

export interface CardDetalhesPedidoProps {
  open: boolean;
  pedido: PedidoDetalhes | null;
  onClose: () => void;
}

export const CardDetalhesPedido: React.FC<CardDetalhesPedidoProps> = ({ open, onClose, pedido }) => {
  const router = useRouter();

  if (!pedido) return null;
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{pedido.id}</DialogTitle>
          <DialogDescription>
            Cliente: <span className="font-semibold">{pedido.clientName}</span> ({pedido.clientCpf}
            {pedido.clientPhone ? ` • ${pedido.clientPhone}` : ""}
            )
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <div><strong>Tênis:</strong> {pedido.sneaker}</div>
          <div><strong>Serviço:</strong> {pedido.serviceType}</div>
          <div><strong>Descrição:</strong> {pedido.description}</div>
          <div><strong>Valor:</strong> R$ {pedido.price.toFixed(2)}</div>
          <div><strong>Status:</strong> {pedido.status}</div>
          <div><strong>Data de Criação:</strong> {pedido.createdDate}</div>
          <div><strong>Previsão:</strong> {pedido.expectedDate}</div>
          <div>
            <strong>Histórico:</strong>
            <ul className="list-disc ml-5">
              {pedido.statusHistory.map((h, i) => (
                <li key={i}>{h.status} - {h.date} às {h.time}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push(`/clientes/${pedido.clientId}`)}
          >
            Ver Cliente
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
