import React, { useState } from 'react';
import { FamilyContext, PermissionLevel, FamilyMember } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, Plus, Mail, Trash2, UserCircle, AlertCircle } from '../icons';
import { Badge } from '../ui/Badge';
import { Family } from '../../entities/all';
import { sendInvitationEmail } from '../../integrations/Email';

interface FamilyAccountCardProps {
  context: FamilyContext;
  onUpdate: () => void;
}

const permissionMap: { [key in PermissionLevel]: string } = {
  can_edit: "Pode Editar",
  view_only: "Apenas Visualizar"
};

const FamilyAccountCard: React.FC<FamilyAccountCardProps> = ({ context, onUpdate }) => {
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<PermissionLevel>('view_only');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    if (email.trim() === '') return true; // Don't validate empty string until submission attempt
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setInviteEmail(email);
    setIsEmailValid(validateEmail(email));
  };


  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormEmailValid = validateEmail(inviteEmail);
    setIsEmailValid(isFormEmailValid);

    if (!isFormEmailValid || !inviteEmail || !inviteName || !context.user) {
      return;
    }

    setIsSaving(true);
    try {
      await Family.addMember(inviteName, inviteEmail, invitePermission);
      
      // Simulate sending invitation email
      await sendInvitationEmail({
        name: inviteName,
        email: inviteEmail,
        inviterName: context.user.full_name,
      });

      setInviteName('');
      setInviteEmail('');
      setInvitePermission('view_only');
      setIsEmailValid(true); // Reset validation state
      onUpdate();
    } catch (error: any) {
      alert(error.message);
    }
    setIsSaving(false);
  };

  const handlePermissionChange = async (memberEmail: string, newPermission: PermissionLevel) => {
    if (context.user?.email === memberEmail) return;
    
    setIsSaving(true);
    try {
      await Family.updateMember(memberEmail, { permission: newPermission });
      onUpdate();
    } catch (error) {
      alert("Falha ao atualizar permissão.");
    }
    setIsSaving(false);
  };

  const openDeleteModal = (member: FamilyMember) => {
    if (context.user?.email === member.email) return;
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isSaving) return;
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    setIsSaving(true);
    try {
        await Family.removeMember(memberToDelete.email);
        onUpdate();
    } catch (error) {
        alert("Falha ao remover membro.");
    } finally {
        setIsSaving(false);
        closeDeleteModal();
    }
  };


  return (
    <>
      <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
        <CardContent className="px-6 pt-8 pb-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h4 className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2 mb-4">
                <Mail className="w-5 h-5" />
                Convidar Novo Membro
              </h4>
              <form onSubmit={handleInvite} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="inviteName" className="mb-1 block">Nome</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <UserCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="inviteName"
                        type="text"
                        placeholder="Nome do membro"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="pl-9 bg-white text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="inviteEmail" className="mb-1 block">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={inviteEmail}
                        onChange={handleEmailChange}
                        className={`pl-9 bg-white text-gray-900 ${!isEmailValid && inviteEmail ? 'border-red-500 focus:ring-red-500' : ''}`}
                        required
                        aria-invalid={!isEmailValid}
                      />
                    </div>
                    {!isEmailValid && inviteEmail && (
                      <p className="text-xs text-red-600 mt-1">Por favor, insira um formato de e-mail válido.</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="invitePermission" className="mb-1 block">Permissão</Label>
                    <Select
                      value={invitePermission}
                      onValueChange={(value) => setInvitePermission(value as PermissionLevel)}
                    >
                      <SelectTrigger id="invitePermission">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="can_edit">{permissionMap.can_edit}</SelectItem>
                        <SelectItem value="view_only">{permissionMap.view_only}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 md:flex-grow md:pr-4">
                    O membro convidado terá acesso para visualizar e/ou adicionar lançamentos conforme a permissão definida.
                  </p>
                  <div className="shrink-0 w-full md:w-auto">
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-full" disabled={isSaving}>
                          <Plus className="w-4 h-4 mr-2" />
                          {isSaving ? 'Convidando...' : 'Convidar'}
                      </Button>
                  </div>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2">
                <Users className="w-5 h-5" />
                Membros Atuais
              </h4>
              {context.members.map(member => (
                <div key={member.email} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <div className="w-full sm:w-auto flex-grow mb-4 sm:mb-0">
                    <div className="flex justify-between sm:justify-start items-start sm:items-center sm:gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {member.role === 'owner' && (
                           <Badge className="font-normal bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                            Proprietário
                           </Badge>
                        )}
                        {member.role === 'member' && member.status === 'active' && (
                           <Badge className="font-normal bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                            Membro
                           </Badge>
                        )}
                        {member.status === 'pending' && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                                Aguardando aceite
                            </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {member.role !== 'owner' ? (
                        <>
                          <Select 
                            value={member.permission}
                            onValueChange={(value) => handlePermissionChange(member.email, value as PermissionLevel)}
                            disabled={isSaving}
                          >
                            <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px]">
                              <SelectValue>{permissionMap[member.permission]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="can_edit">{permissionMap.can_edit}</SelectItem>
                              <SelectItem value="view_only">{permissionMap.view_only}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={() => openDeleteModal(member)} className="p-2 h-10 w-10 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors shrink-0 dark:bg-gray-700 dark:hover:bg-red-900/30 dark:text-gray-400 dark:hover:text-red-400" disabled={isSaving} aria-label={`Remover ${member.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                    ) : (
                      <div className="w-full sm:w-[228px] text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">Permissão total</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isDeleteModalOpen && memberToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-md w-full animate-in fade-in-0 zoom-in-95 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50" id="modal-title">
                    Excluir Membro
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Tem certeza que deseja remover o membro <span className="font-semibold">{memberToDelete.name}</span> da conta? Esta ação não pode ser desfeita.
                    </p>
                </div>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-center gap-3">
              <Button type="button" onClick={closeDeleteModal} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                Cancelar
              </Button>
              <Button type="button" onClick={confirmDelete} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700" disabled={isSaving}>
                <Trash2 className="w-4 h-4 mr-2" />
                {isSaving ? 'Excluindo...' : 'Sim, Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FamilyAccountCard;