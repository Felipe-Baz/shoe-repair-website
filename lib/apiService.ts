export interface ServicoPedido {
  preco: number;
  nome: string;
  id: string;
  descricao: string;
}

export interface StatusHistoryPedido {
  date: string;
  time: string;
  userName: string;
  userId: string;
  status: string;
}

export interface Pedido {
  observacoes: string;
  departamento: string;
  status: string;
  fotos: string[];
  createdAt: string;
  precoTotal: number;
  servicos: ServicoPedido[];
  statusHistory: StatusHistoryPedido[];
  dataCriacao: string;
  dataPrevistaEntrega: string;
  modeloTenis: string;
  updatedAt: string;
  id: string;
  clienteId: string;
}

// ...existing code...
// Busca cliente por ID
export async function getClienteByIdService(id: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar cliente");
  return response.json();
}

// Busca pedido por ID
export async function getPedidoByIdService(id: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar pedido");
  return response.json();
}
// lib/apiService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Cria um novo pedido
export async function createPedidoService(pedido: {
  clienteId: string;
  modeloTenis: string;
  servicos: Array<{
    id: string;
    nome: string;
    preco: number;
    descricao: string;
  }>;
  fotos: string[];
  precoTotal: number;
  dataPrevistaEntrega: string;
  departamento: string;
  observacoes: string;
  status?: string;
}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(pedido),
  });
  if (!response.ok) throw new Error("Erro ao criar pedido");
  return response.json();
}

// Cria um novo cliente
export async function createClienteService(cliente: {
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
}) {
  const token = localStorage.getItem("token");
  console.log("Token in getClientesService:", token)
  const response = await fetch(`${API_BASE_URL}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error("Erro ao criar cliente");
  return response.json();
}

// Busca lista de clientes
export async function getClientesService() {
  const token = localStorage.getItem("token")
  console.log("Token in getClientesService:", token)
  const response = await fetch(`${API_BASE_URL}/clientes`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })
  const responseClone = response.clone();
  console.log('Login response status:', response.status);
  console.log('Login response headers:', response.headers);
  console.log('Login response body:', await responseClone.text());
  if (!response.ok) throw new Error("Email ou senha incorretos");
  const data = await response.json()
  return data
}

export async function loginService(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  const responseClone = response.clone();
  console.log('Login response status:', response.status);
  console.log('Login response headers:', response.headers);
  console.log('Login response body:', await responseClone.text());
  if (!response.ok) throw new Error("Email ou senha incorretos");
  const data = await response.json()
  console.log("Login response data:", data)
  // Salva no localStorage
  localStorage.setItem("token", data.token)
  // Salva no cookie (disponível para o middleware)
  document.cookie = `token=${data.token}; path=/; max-age=604800; secure; samesite=strict`;
  return data
}

// Busca as colunas de status baseadas no cargo do usuário
export async function getStatusColumnsService() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/status/columns`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao buscar colunas de status");
  }
  
  const result = await response.json();
  return result.data; // Retorna apenas os dados das colunas
}

// Busca lista de pedidos
export async function getOrdersStatusService() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/pedidos/kanban/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao buscar pedidos");
  }
  
  const result = await response.json();
  return result.data; // Retorna apenas o array de pedidos
}

export async function getOrdersService() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/pedidos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao buscar pedidos");
  }
  
  const result = await response.json();
  return result.data; // Retorna apenas o array de pedidos
}

// Atualiza o status de um pedido
export async function updateOrderStatusService(orderId: string, newStatus: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao atualizar status do pedido");
  }
  
  const result = await response.json();
  return result.data; // Retorna o pedido atualizado
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  if (!response.ok) throw new Error("Erro na requisição")
  return response.json()
}
