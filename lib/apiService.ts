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
  tipoServico: string;
  descricaoServicos: string;
  fotos: string[];
  preco: number;
  dataPrevistaEntrega: string;
  status: string;
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

export async function getOrdersService() {
  const token = localStorage.getItem("token")
  console.log("Token in getOrdersService:", token)
  const response = await fetch(`${API_BASE_URL}/pedidos`, {
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
  localStorage.setItem("token", data.token)
  return data
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
