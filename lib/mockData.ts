// Dados mock para testar diferentes tipos de usuário
export const mockUserRoles = {
    admin: {
        statusColumns: {
            "Atendimento - Recebido": [],
            "Atendimento - Orçado": [],
            "Atendimento - Aprovado": [],
            "Lavagem - A Fazer": [],
            "Lavagem - Em Andamento": [],
            "Lavagem - Concluído": [],
            "Pintura - A Fazer": [],
            "Pintura - Em Andamento": [],
            "Pintura - Concluído": [],
            "Atendimento - Finalizado": [],
            "Atendimento - Entregue": [],
        }
    },
    lavagem: {
        statusColumns: {
            "Lavagem - A Fazer": [],
            "Lavagem - Em Andamento": [],
            "Lavagem - Concluído": []
        }
    },
    pintura: {
        statusColumns: {
            "Pintura - A Fazer": [],
            "Pintura - Em Andamento": [],
            "Pintura - Aguardando Secagem": [],
            "Pintura - Concluído": []
        }
    },
    atendimento: {
        statusColumns: {
            "Atendimento - Recebido": [],
            "Atendimento - Orçado": [],
            "Atendimento - Aprovado": [],
            "Atendimento - Entregue": [],
            "Atendimento - Finalizado": []
        }
    }
};

export const mockOrders = [
    {
        id: "001",
        clientName: "João Silva",
        clientCpf: "123.456.789-00",
        sneaker: "Nike Air Max 90",
        serviceType: "Limpeza Completa",
        description: "Limpeza profunda com hidratação do couro",
        price: 80.0,
        status: "A Fazer",
        createdDate: "2024-01-15",
        expectedDate: "2024-01-20",
        statusHistory: [
            { status: "Recebido", date: "2024-01-15", time: "09:00" },
            { status: "A Fazer", date: "2024-01-15", time: "14:30" },
        ],
    },
    {
        id: "002",
        clientName: "Maria Santos",
        clientCpf: "987.654.321-00",
        sneaker: "Adidas Ultraboost",
        serviceType: "Restauração",
        description: "Restauração da sola e pintura",
        price: 120.0,
        status: "Em Andamento",
        createdDate: "2024-01-14",
        expectedDate: "2024-01-25",
        statusHistory: [
            { status: "Recebido", date: "2024-01-14", time: "10:15" },
            { status: "A Fazer", date: "2024-01-14", time: "11:00" },
            { status: "Em Andamento", date: "2024-01-14", time: "14:30" }
        ],
    },
    {
        id: "003",
        clientName: "Pedro Costa",
        clientCpf: "456.789.123-00",
        sneaker: "Vans Old Skool",
        serviceType: "Reparo",
        description: "Reparo de rasgos e costura",
        price: 60.0,
        status: "Concluído",
        createdDate: "2024-01-13",
        expectedDate: "2024-01-18",
        statusHistory: [
            { status: "Recebido", date: "2024-01-13", time: "08:45" },
            { status: "A Fazer", date: "2024-01-13", time: "09:00" },
            { status: "Em Andamento", date: "2024-01-13", time: "11:20" },
            { status: "Concluído", date: "2024-01-18", time: "16:00" },
        ],
    },
    {
        id: "004",
        clientName: "Ana Oliveira",
        clientCpf: "321.654.987-00",
        sneaker: "Converse All Star",
        serviceType: "Customização",
        description: "Pintura personalizada e aplicação de patches",
        price: 150.0,
        status: "Lavagem - A Fazer",
        createdDate: "2024-01-12",
        expectedDate: "2024-01-22",
        statusHistory: [
            { status: "Recebido", date: "2024-01-12", time: "13:30" },
            { status: "Lavagem - A Fazer", date: "2024-01-12", time: "14:00" }
        ],
    },
    {
        id: "005",
        clientName: "Carlos Mendes",
        clientCpf: "555.666.777-88",
        sneaker: "Jordan 1 Retro",
        serviceType: "Limpeza Completa",
        description: "Limpeza e hidratação completa",
        price: 90.0,
        status: "Pintura - Em Andamento",
        createdDate: "2024-01-16",
        expectedDate: "2024-01-21",
        statusHistory: [
            { status: "Recebido", date: "2024-01-16", time: "09:30" },
            { status: "Lavagem - A Fazer", date: "2024-01-16", time: "10:00" },
            { status: "Lavagem - Em Andamento", date: "2024-01-16", time: "11:00" },
            { status: "Lavagem - Concluído", date: "2024-01-16", time: "14:00" },
            { status: "Pintura - A Fazer", date: "2024-01-16", time: "14:30" },
            { status: "Pintura - Em Andamento", date: "2024-01-16", time: "15:45" },
        ],
    },
];

// Função para simular API baseada no tipo de usuário
export async function getMockStatusColumnsService(userRole: string = 'admin') {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const validRoles = ['admin', 'lavagem', 'pintura', 'atendimento'] as const;
    type UserRole = typeof validRoles[number];

    const role = validRoles.includes(userRole as UserRole) ? userRole as UserRole : 'admin';
    return mockUserRoles[role]?.statusColumns || mockUserRoles.admin.statusColumns;
}

export async function getMockOrdersService() {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 800));

    return mockOrders;
}

// Para testar diferentes tipos de usuário, altere a variável abaixo:
// Opções: 'admin', 'lavagem', 'pintura', 'atendimento'
export const MOCK_USER_ROLE = 'admin'; // Testando com usuário Admin para ver todos os setores