export interface Transaction {
  id: string;
  created_by: string;
  type: 'receita' | 'despesa';
  amount: number;
  description: string;
  category: string;
  reference_month: string; // "YYYY-MM"
  date: string; // "YYYY-MM-DD"
  payment_status: 'pago' | 'pendente';
  payment_method: 'cartao' | 'pix' | 'boleto' | 'dinheiro' | 'debito';
  installments?: number;
  current_installment?: number;
  installment_amount?: number;
  is_recurring?: boolean;
  credit_card_id?: string;
}

export interface CreditCard {
  id: string;
  created_by: string;
  name: string;
  icon: string;
  limit: number;
  closing_day: number;
  due_day: number;
  color: string;
}

export interface MonthlyGoal {
  id: string;
  month: string; // "YYYY-MM"
  category: string;
  target_amount: number;
}

export interface Category {
    id: string;
    name: string;
    type: 'receita' | 'despesa';
    icon: string;
    parentId?: string;
    color?: string;
}

export interface User {
  email: string;
  full_name: string;
  profile_image?: string;
  phone?: string;
  birth_date?: string; // YYYY-MM-DD
  cpf?: string;
  profession?: string;
  has_password?: boolean;
}

export type PermissionLevel = 'can_edit' | 'view_only';

export interface FamilyMember {
  name: string;
  email: string;
  permission: PermissionLevel;
  role: 'owner' | 'member';
  status: 'active' | 'pending';
}

export interface FamilyAccount {
  name: string;
}

export interface FamilyContext {
  user: User | null;
  hasFamily: boolean;
  familyAccount: FamilyAccount | null;
  authorizedEmails: string[];
  members: FamilyMember[];
}