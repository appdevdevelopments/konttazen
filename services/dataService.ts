import { Transaction, CreditCard, FamilyContext, MonthlyGoal, Category, User, FamilyMember, PermissionLevel } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const MOCK_EMAILS = {
    currentUser: 'maria.santos@email.com',
    member1: 'member1@example.com',
    member2: 'member2@example.com',
};

let mockCurrentPassword = 'password123';

let mockUser: User = {
    email: 'maria.santos@email.com',
    full_name: 'Maria Silva Santos',
    profile_image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+55 (11) 99999-9999',
    birth_date: '1990-05-15',
    cpf: '123.456.789-00',
    profession: 'Analista Financeira',
    has_password: true,
};

const thisMonth = format(new Date(), 'yyyy-MM');
const thisMonthDay = format(new Date(), 'yyyy-MM-dd');
const lastMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM');
const lastMonthDay = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd');
const twoMonthsAgo = format(new Date(new Date().setMonth(new Date().getMonth() - 2)), 'yyyy-MM');
const twoMonthsAgoDay = format(new Date(new Date().setMonth(new Date().getMonth() - 2)), 'yyyy-MM-dd');


let mockTransactions: Transaction[] = [
    // Current User Transactions
    { id: '1', created_by: MOCK_EMAILS.currentUser, type: 'receita', description: 'Salário Mensal', amount: 5000, category: 'Salário', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'pix', is_recurring: true },
    { id: '2', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Aluguel Apto', amount: 800, category: 'Aluguel', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'boleto', is_recurring: true },
    { id: '3', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Compras do mês', amount: 350, category: 'Supermercado', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'cartao', credit_card_id: 'c1' },
    { id: '4', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Uber', amount: 120, category: 'Transporte', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pendente', payment_method: 'pix' },
    { id: '5', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Cinema', amount: 250, category: 'Lazer', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'cartao', installments: 3, current_installment: 1, installment_amount: 83.33, credit_card_id: 'c2' },
    { id: '11', created_by: MOCK_EMAILS.currentUser, type: 'receita', description: 'Salário Mensal', amount: 4800, category: 'Salário', reference_month: lastMonth, date: lastMonthDay, payment_status: 'pago', payment_method: 'pix', is_recurring: true },
    { id: '12', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Aluguel Apto', amount: 800, category: 'Aluguel', reference_month: lastMonth, date: lastMonthDay, payment_status: 'pago', payment_method: 'boleto', is_recurring: true },
    { id: '13', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Compras', amount: 400, category: 'Supermercado', reference_month: lastMonth, date: lastMonthDay, payment_status: 'pago', payment_method: 'cartao', credit_card_id: 'c1' },
    { id: '14', created_by: MOCK_EMAILS.currentUser, type: 'receita', description: 'Salário Mensal', amount: 5100, category: 'Salário', reference_month: twoMonthsAgo, date: twoMonthsAgoDay, payment_status: 'pago', payment_method: 'pix', is_recurring: true },
    { id: '15', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Reserva Hotel', amount: 1000, category: 'Viagem', reference_month: twoMonthsAgo, date: twoMonthsAgoDay, payment_status: 'pago', payment_method: 'cartao', credit_card_id: 'c1' },
    { id: '16', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Plano de Internet', amount: 99.90, category: 'Casa', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'debito', is_recurring: true },
    { id: '17', created_by: MOCK_EMAILS.currentUser, type: 'despesa', description: 'Notebook Novo', amount: 4500, category: 'Eletrônicos', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'cartao', installments: 10, current_installment: 1, installment_amount: 450, credit_card_id: 'c1' },


    // Family Member 1 Transactions
    { id: '6', created_by: MOCK_EMAILS.member1, type: 'receita', description: 'Salário Mensal', amount: 4500, category: 'Salário', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'pix', is_recurring: true },
    { id: '7', created_by: MOCK_EMAILS.member1, type: 'despesa', description: 'Feira Orgânica', amount: 300, category: 'Supermercado', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pago', payment_method: 'cartao', credit_card_id: 'c3' },
    { id: '8', created_by: MOCK_EMAILS.member1, type: 'despesa', description: 'Consulta Médica', amount: 150, category: 'Saúde', reference_month: thisMonth, date: thisMonthDay, payment_status: 'pendente', payment_method: 'pix' },
];

let mockCreditCards: CreditCard[] = [
    { id: 'c1', created_by: MOCK_EMAILS.currentUser, name: 'Cartão Principal', icon: 'Mastercard', limit: 4000, closing_day: 1, due_day: 10, color: '#3B82F6' },
    { id: 'c2', created_by: MOCK_EMAILS.currentUser, name: 'Cartão Secundário', icon: 'Visa', limit: 1500, closing_day: 15, due_day: 25, color: '#10B981' },
    { id: 'c3', created_by: MOCK_EMAILS.member1, name: 'Cartão Família', icon: 'CreditCard', limit: 3000, closing_day: 25, due_day: 5, color: '#F59E0B' },
];

let mockMonthlyGoals: MonthlyGoal[] = [
    { id: 'g1', month: thisMonth, category: 'Supermercado', target_amount: 800 },
    { id: 'g2', month: thisMonth, category: 'Lazer', target_amount: 400 },
];

let mockCategories: Category[] = [
    { id: 'cat-1', name: 'Alimentação', type: 'despesa', icon: 'Utensils', color: '#F97316' },
    { id: 'cat-1-1', name: 'Restaurantes', type: 'despesa', icon: 'Utensils', parentId: 'cat-1' },
    { id: 'cat-1-2', name: 'Supermercado', type: 'despesa', icon: 'Utensils', parentId: 'cat-1' },
    { id: 'cat-2', name: 'Transporte', type: 'despesa', icon: 'Car', color: '#3B82F6' },
    { id: 'cat-2-1', name: 'Combustível', type: 'despesa', icon: 'Car', parentId: 'cat-2' },
    { id: 'cat-3', name: 'Moradia', type: 'despesa', icon: 'Home', color: '#10B981' },
    { id: 'cat-4', name: 'Lazer', type: 'despesa', icon: 'Heart', color: '#EC4899' },
];


let mockFamilyContext: FamilyContext = {
    user: mockUser,
    hasFamily: true,
    familyAccount: { name: 'Família Silva' },
    authorizedEmails: [MOCK_EMAILS.currentUser, MOCK_EMAILS.member1, MOCK_EMAILS.member2],
    members: [
        { name: 'Maria Silva Santos', email: MOCK_EMAILS.currentUser, permission: 'can_edit', role: 'owner', status: 'active' },
        { name: 'Membro Família 1', email: MOCK_EMAILS.member1, permission: 'can_edit', role: 'member', status: 'active' },
        { name: 'Membro Família 2', email: MOCK_EMAILS.member2, permission: 'view_only', role: 'member', status: 'active' },
    ],
};


// Simulate filtering on the "database"
export const filterTransactions = async (filter: { created_by: string }): Promise<Transaction[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = mockTransactions.filter(t => t.created_by === filter.created_by);
            resolve(JSON.parse(JSON.stringify(results)));
        }, 300);
    });
};

export const createTransaction = async (data: Partial<Transaction>): Promise<Transaction> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newTransaction: Transaction = {
                id: uuidv4(),
                created_by: MOCK_EMAILS.currentUser,
                type: 'despesa',
                amount: 0,
                description: '',
                category: '',
                reference_month: format(new Date(), 'yyyy-MM'),
                date: format(new Date(), 'yyyy-MM-dd'),
                payment_status: 'pendente',
                payment_method: 'pix',
                ...data,
            };
            mockTransactions.push(newTransaction);
            resolve(JSON.parse(JSON.stringify(newTransaction)));
        }, 300);
    });
};

export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<Transaction | null> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const index = mockTransactions.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTransactions[index] = { ...mockTransactions[index], ...data };
                resolve(JSON.parse(JSON.stringify(mockTransactions[index])));
            } else {
                resolve(null);
            }
        }, 300);
    });
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockTransactions.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTransactions.splice(index, 1);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};

export const updateTransactionStatus = async (id: string, status: 'pago' | 'pendente'): Promise<Transaction | null> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const index = mockTransactions.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTransactions[index].payment_status = status;
                resolve(JSON.parse(JSON.stringify(mockTransactions[index])));
            } else {
                resolve(null);
            }
        }, 300);
    });
}

export const filterCreditCards = async (filter: { created_by: string }): Promise<CreditCard[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = mockCreditCards.filter(c => c.created_by === filter.created_by);
            resolve(JSON.parse(JSON.stringify(results)));
        }, 300);
    });
};

export const createCreditCard = async (data: Partial<CreditCard>): Promise<CreditCard> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newCard: CreditCard = {
                id: uuidv4(),
                created_by: MOCK_EMAILS.currentUser,
                name: '',
                icon: 'CreditCard',
                limit: 0,
                closing_day: 1,
                due_day: 10,
                color: '#3B82F6',
                ...data,
            };
            mockCreditCards.push(newCard);
            resolve(JSON.parse(JSON.stringify(newCard)));
        }, 300);
    });
};

export const updateCreditCard = async (id: string, data: Partial<CreditCard>): Promise<CreditCard | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockCreditCards.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCreditCards[index] = { ...mockCreditCards[index], ...data };
                resolve(JSON.parse(JSON.stringify(mockCreditCards[index])));
            } else {
                resolve(null);
            }
        }, 300);
    });
};

export const deleteCreditCard = async (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockCreditCards.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCreditCards.splice(index, 1);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};

// Monthly Goals Service
export const listMonthlyGoals = async (): Promise<MonthlyGoal[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mockMonthlyGoals)));
        }, 200);
    });
};

export const createMonthlyGoal = async (data: Partial<MonthlyGoal>): Promise<MonthlyGoal> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newGoal: MonthlyGoal = {
                id: uuidv4(),
                month: format(new Date(), 'yyyy-MM'),
                category: '',
                target_amount: 0,
                ...data,
            };
            mockMonthlyGoals.push(newGoal);
            resolve(JSON.parse(JSON.stringify(newGoal)));
        }, 200);
    });
};

export const deleteMonthlyGoal = async (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockMonthlyGoals.findIndex(g => g.id === id);
            if (index !== -1) {
                mockMonthlyGoals.splice(index, 1);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 200);
    });
};

// Categories Service
export const listCategories = async (): Promise<Category[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mockCategories)));
        }, 200);
    });
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newCategory: Category = {
                id: uuidv4(),
                name: '',
                type: 'despesa',
                icon: 'Tag',
                color: '#6B7280',
                ...data,
            };
            mockCategories.push(newCategory);
            resolve(JSON.parse(JSON.stringify(newCategory)));
        }, 200);
    });
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category | null> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const index = mockCategories.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCategories[index] = { ...mockCategories[index], ...data };
                resolve(JSON.parse(JSON.stringify(mockCategories[index])));
            } else {
                resolve(null);
            }
        }, 300);
    });
};

export const deleteCategory = async (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = mockCategories.length;
            // Remove the category and any of its direct children
            mockCategories = mockCategories.filter(c => c.id !== id && c.parentId !== id);
            resolve(mockCategories.length < initialLength);
        }, 200);
    });
};

export const getUserFamilyContext = async (): Promise<FamilyContext> => {
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mockFamilyContext)));
        }, 100);
    });
};

export const getMe = async (): Promise<User> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mockUser)));
        }, 100);
    });
};

export const updateMe = async (data: Partial<User>): Promise<User> => {
    return new Promise(resolve => {
        setTimeout(() => {
            mockUser = { ...mockUser, ...data };
            if (mockFamilyContext.user) {
                mockFamilyContext.user = { ...mockFamilyContext.user, ...mockUser };
            }
            resolve(JSON.parse(JSON.stringify(mockUser)));
        }, 300);
    });
};

// Password Management
export const setUserPassword = async (newPass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockUser.has_password) {
                return reject(new Error("A senha já existe."));
            }
            mockUser.has_password = true;
            mockCurrentPassword = newPass;
            console.log(`Senha definida para ${mockUser.email}. Em um app real, ela seria 'hasheada'.`);
            resolve(JSON.parse(JSON.stringify(mockUser)));
        }, 300);
    });
};

export const changeUserPassword = async (newPass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!mockUser.has_password) {
                return reject(new Error("Nenhuma senha definida para este usuário."));
            }
            if (newPass === mockCurrentPassword) {
                return reject(new Error("A nova senha não pode ser igual à senha atual."));
            }
            mockCurrentPassword = newPass;
            console.log(`Senha alterada para ${mockUser.email}.`);
            resolve(JSON.parse(JSON.stringify(mockUser)));
        }, 300);
    });
};

export const removeUserPassword = async (currentPass: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!mockUser.has_password) {
                return reject(new Error("Nenhuma senha definida para este usuário."));
            }
            if (currentPass !== mockCurrentPassword) {
                return reject(new Error("A senha atual está incorreta."));
            }
            mockUser.has_password = false;
            mockCurrentPassword = '';
            console.log(`Senha removida para ${mockUser.email}.`);
            resolve(JSON.parse(JSON.stringify(mockUser)));
        }, 300);
    });
};


// Family Management
export const addFamilyMember = async (name: string, email: string, permission: PermissionLevel): Promise<FamilyMember> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockFamilyContext.members.find(m => m.email === email)) {
                reject(new Error("Este membro já existe na família."));
                return;
            }
            const newMember: FamilyMember = {
                name,
                email,
                permission,
                role: 'member',
                status: 'pending',
            };
            mockFamilyContext.members.push(newMember);
            mockFamilyContext.authorizedEmails.push(email); // Keep in sync
            resolve(JSON.parse(JSON.stringify(newMember)));
        }, 300);
    });
};

export const updateFamilyMember = async (email: string, data: Partial<FamilyMember>): Promise<FamilyMember | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockFamilyContext.members.findIndex(m => m.email === email);
            if (index !== -1) {
                mockFamilyContext.members[index] = { ...mockFamilyContext.members[index], ...data };
                resolve(JSON.parse(JSON.stringify(mockFamilyContext.members[index])));
            } else {
                resolve(null);
            }
        }, 300);
    });
};

export const removeFamilyMember = async (email: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockFamilyContext.members.findIndex(m => m.email === email);
            if (index !== -1 && mockFamilyContext.members[index].role !== 'owner') {
                mockFamilyContext.members.splice(index, 1);
                
                const emailIndex = mockFamilyContext.authorizedEmails.indexOf(email);
                if (emailIndex > -1) {
                    mockFamilyContext.authorizedEmails.splice(emailIndex, 1); // Keep in sync
                }
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};