import {
    filterTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateTransactionStatus,
    filterCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    listMonthlyGoals,
    createMonthlyGoal,
    deleteMonthlyGoal,
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getMe,
    updateMe,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    setUserPassword,
    changeUserPassword,
    removeUserPassword,
} from '../services/dataService';
import { Transaction as TransactionType, CreditCard as CreditCardType, MonthlyGoal as MonthlyGoalType, Category as CategoryType, User as UserType, FamilyMember as FamilyMemberType, PermissionLevel } from '../types';

export const Transaction = {
    filter: (filter: { created_by: string; }) => filterTransactions(filter),
    create: (data: Partial<TransactionType>) => createTransaction(data),
    update: (id: string, data: Partial<TransactionType>) => updateTransaction(id, data),
    delete: (id: string) => deleteTransaction(id),
    updateStatus: (id: string, status: 'pago' | 'pendente') => updateTransactionStatus(id, status),
};

export const CreditCard = {
    filter: (filter: { created_by: string; }) => filterCreditCards(filter),
    create: (data: Partial<CreditCardType>) => createCreditCard(data),
    update: (id: string, data: Partial<CreditCardType>) => updateCreditCard(id, data),
    delete: (id: string) => deleteCreditCard(id),
};

export const MonthlyGoal = {
    list: () => listMonthlyGoals(),
    create: (data: Partial<MonthlyGoalType>) => createMonthlyGoal(data),
    delete: (id: string) => deleteMonthlyGoal(id),
};

export const Category = {
    list: () => listCategories(),
    create: (data: Partial<CategoryType>) => createCategory(data),
    update: (id: string, data: Partial<CategoryType>) => updateCategory(id, data),
    delete: (id: string) => deleteCategory(id),
};

export const User = {
    me: () => getMe(),
    updateMyUserData: (data: Partial<UserType>) => updateMe(data),
    setPassword: (password: string) => setUserPassword(password),
    changePassword: (newPass: string) => changeUserPassword(newPass),
    removePassword: (current: string) => removeUserPassword(current),
};

export const Family = {
    addMember: (name: string, email: string, permission: PermissionLevel) => addFamilyMember(name, email, permission),
    updateMember: (email: string, data: Partial<FamilyMemberType>) => updateFamilyMember(email, data),
    removeMember: (email: string) => removeFamilyMember(email),
};