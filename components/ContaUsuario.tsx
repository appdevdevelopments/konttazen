import React, { useState, useEffect } from "react";
import { User } from "../entities/all";
import { User as UserType, FamilyContext } from "../types";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserCircle, Camera, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle, Trash2 } from "./icons";
import FamilyAccountCard from "./family/FamilyAccountCard";
import { getUserFamilyContext } from "./family/familyUtils";
import { UploadFile } from "../integrations/Core";

export default function ContaUsuario() {
  const [user, setUser] = useState<UserType | null>(null);
  const [familyContext, setFamilyContext] = useState<FamilyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [hasPassword, setHasPassword] = useState(false);
  const [isRemovePasswordModalOpen, setIsRemovePasswordModalOpen] = useState(false);
  const [passwordForRemoval, setPasswordForRemoval] = useState('');
  const [passwordRemovalError, setPasswordRemovalError] = useState('');
  const [showPasswordForRemoval, setShowPasswordForRemoval] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    text: ''
  });
  
  const [profileData, setProfileData] = useState({
    full_name: "",
    profile_image: "",
    phone: "",
    birth_date: "",
  });

  const [displayBirthDate, setDisplayBirthDate] = useState("");
  
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: ""
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "bg-gray-200",
    width: "0%"
  });

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (!isRemovePasswordModalOpen) {
      setPasswordForRemoval('');
      setPasswordRemovalError('');
      setShowPasswordForRemoval(false);
    }
  }, [isRemovePasswordModalOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setHasPassword(currentUser.has_password || false);

      setProfileData({
        full_name: currentUser.full_name || "",
        profile_image: currentUser.profile_image || "",
        phone: currentUser.phone || "",
        birth_date: currentUser.birth_date || "",
      });

      if (currentUser.birth_date) {
        const parts = currentUser.birth_date.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            setDisplayBirthDate(`${day}/${month}/${year}`);
        }
      }
      
      const context = await getUserFamilyContext();
      setFamilyContext(context);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawPhone = profileData.phone.replace(/\D/g, '');
    if (rawPhone.length > 0 && (rawPhone.length < 10 || rawPhone.length > 11)) {
        setModalState({ 
            isOpen: true, 
            type: "error", 
            title: "Telefone Inválido", 
            text: "O número de telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)." 
        });
        return;
    }

    setSaving(true);

    try {
      await User.updateMyUserData(profileData);
      setModalState({ isOpen: true, type: "success", title: "Sucesso!", text: "Perfil atualizado com sucesso!" });
      await loadData();
    } catch (error) {
      setModalState({ isOpen: true, type: "error", title: "Erro", text: "Ocorreu um problema ao atualizar o perfil." });
    }
    
    setSaving(false);
  };
  
  const handleProfileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        let rawValue = value.replace(/\D/g, '');
        if (rawValue.length > 11) {
            return; // Stop if more than 11 digits
        }

        let formattedValue = rawValue;
        if (rawValue.length > 2) {
            formattedValue = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2)}`;
        }
        if (rawValue.length > 6) {
            if (rawValue.length < 11) {
                // Landline (10 digits): (XX) XXXX-XXXX
                formattedValue = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 6)}-${rawValue.slice(6)}`;
            } else {
                // Mobile (11 digits): (XX) XXXXX-XXXX
                formattedValue = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 7)}-${rawValue.slice(7)}`;
            }
        }
        setProfileData({ ...profileData, phone: formattedValue });
    } else {
        setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (value.length > 4) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    }

    setDisplayBirthDate(formattedValue);

    if (formattedValue.length === 10) {
      const [day, month, year] = formattedValue.split('/');
      setProfileData(prev => ({ ...prev, birth_date: `${year}-${month}-${day}` }));
    } else {
      setProfileData(prev => ({ ...prev, birth_date: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);

    try {
      const { file_url } = await UploadFile({ file });
      setProfileData({ ...profileData, profile_image: file_url });
      setModalState({ isOpen: true, type: "success", title: "Imagem Carregada", text: "Sua nova imagem de perfil foi carregada. Clique em 'Salvar Alterações' para confirmar." });
    } catch (error) {
      setModalState({ isOpen: true, type: "error", title: "Erro de Upload", text: "Não foi possível carregar a imagem. Tente novamente." });
    }
    
    setSaving(false);
  };
  
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) {
        setPasswordStrength({ label: "", color: "bg-gray-200", width: "0%" });
        return;
    }

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = "Fraca";
    let color = "bg-red-500";
    let width = "25%";

    if (score === 2) {
        label = "Média";
        color = "bg-yellow-500";
        width = "50%";
    } else if (score === 3) {
        label = "Boa";
        color = "bg-orange-500";
        width = "75%";
    } else if (score >= 4) {
        label = "Forte";
        color = "bg-green-500";
        width = "100%";
    }
    
    setPasswordStrength({ label, color, width });
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPasswordData(prev => ({ ...prev, new_password: newPassword }));
      calculatePasswordStrength(newPassword);
  };
  
  const resetPasswordForm = () => {
    setPasswordData({ new_password: "", confirm_password: "" });
    calculatePasswordStrength("");
  };

  const handlePasswordCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password.trim() !== passwordData.confirm_password.trim()) {
      setModalState({ isOpen: true, type: 'error', title: 'Erro de Confirmação', text: 'As senhas não coincidem.' });
      return;
    }
    if (passwordData.new_password.trim().length < 6) {
      setModalState({ isOpen: true, type: 'error', title: 'Senha Fraca', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setSaving(true);
    try {
      await User.setPassword(passwordData.new_password.trim());
      setHasPassword(true);
      setModalState({ isOpen: true, type: 'success', title: 'Sucesso!', text: 'Sua senha foi criada. O app irá exigi-la no próximo acesso.'});
      resetPasswordForm();
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', title: 'Erro', text: error.message });
    }
    setSaving(false);
  };


  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password.trim() !== passwordData.confirm_password.trim()) {
      setModalState({ isOpen: true, type: 'error', title: 'Erro de Confirmação', text: 'As novas senhas não coincidem.' });
      return;
    }
    if (passwordData.new_password.trim().length < 6) {
      setModalState({ isOpen: true, type: 'error', title: 'Senha Fraca', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    
    setSaving(true);
    try {
        await User.changePassword(passwordData.new_password.trim());
        setModalState({ isOpen: true, type: "success", title: "Sucesso!", text: "Senha alterada com sucesso!" });
        resetPasswordForm();
    } catch (error: any) {
        setModalState({ isOpen: true, type: 'error', title: 'Erro', text: error.message });
    }
    setSaving(false);
  };
  
  const handlePasswordRemove = async () => {
    if (!passwordForRemoval.trim()) {
        setPasswordRemovalError("A senha não pode estar em branco.");
        return;
    }
    setSaving(true);
    setPasswordRemovalError('');
    try {
        await User.removePassword(passwordForRemoval.trim());
        setHasPassword(false);
        setIsRemovePasswordModalOpen(false);
        setModalState({ isOpen: true, type: 'success', title: 'Senha Removida', text: 'A senha de acesso ao app foi removida com sucesso.'});
    } catch(error: any) {
        if (error.message === "A senha atual está incorreta.") {
            setPasswordRemovalError("A senha atual está incorreta. Tente novamente.");
        } else {
            setModalState({ isOpen: true, type: 'error', title: 'Erro', text: error.message });
            setIsRemovePasswordModalOpen(false);
        }
    }
    setSaving(false);
  };


  const closeModal = () => {
    setModalState({ isOpen: false, type: 'success', title: '', text: '' });
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* User Header */}
      <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-md">
                {profileData.profile_image ? (
                  <AvatarImage src={profileData.profile_image} alt={user?.full_name} />
                ) : (
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-4xl font-semibold">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <label 
                htmlFor="file-upload"
                className="absolute bottom-0 right-0 bg-teal-600 rounded-full h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors shadow-lg border-2 border-white dark:border-gray-800"
                aria-label="Alterar foto de perfil"
              >
                  <Camera className="w-5 h-5 text-white" />
              </label>
              <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={saving} />
          </div>
          <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                <span className="font-normal">Olá, </span>{user?.full_name}
              </h2>
              <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
          </div>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardContent className="px-6 pt-12 pb-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <h4 className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2 mb-4">
                <UserCircle className="w-5 h-5" />
                Editar meu Perfil
              </h4>
              <form onSubmit={handleProfileUpdate} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input id="full_name" name="full_name" value={profileData.full_name} onChange={handleProfileDataChange} className="bg-white text-gray-900"/>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={user?.email || ''} disabled className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"/>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" value={profileData.phone} onChange={handleProfileDataChange} placeholder="(XX) XXXXX-XXXX" className="bg-white text-gray-900"/>
                  </div>
                  <div>
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input id="birth_date" name="birth_date" type="text" placeholder="DD/MM/AAAA" maxLength={10} value={displayBirthDate} onChange={handleBirthDateChange} className="bg-white text-gray-900"/>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-end mt-6">
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white w-full md:w-auto shadow-sm hover:shadow-md transition-shadow" disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardContent className="px-6 pt-12 pb-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              {hasPassword ? (
                // CHANGE PASSWORD VIEW
                <div className="space-y-8">
                    <div>
                      <h4 className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2 mb-4">
                        <Lock className="w-5 h-5" />
                        Alterar Senha
                      </h4>
                      <form onSubmit={handlePasswordUpdate} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div>
                                  <Label htmlFor="new_password">Nova Senha</Label>
                                  <div className="relative"><Input id="new_password" type={showNewPassword ? "text" : "password"} value={passwordData.new_password} onChange={handleNewPasswordChange} placeholder="Digite a nova senha" className="pr-10 bg-white text-gray-900" required minLength={6}/><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                                  {passwordData.new_password.length > 0 && (<div className="mt-2 flex items-center gap-2"><div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${passwordStrength.color} transition-all duration-300`} style={{ width: passwordStrength.width }}></div></div><span className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">{passwordStrength.label}</span></div>)}
                              </div>
                              <div>
                                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                                  <div className="relative"><Input id="confirm_password" type={showConfirmPassword ? "text" : "password"} value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} placeholder="Confirme a nova senha" className="pr-10 bg-white text-gray-900" required minLength={6}/><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                              </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:justify-end">
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto shadow-sm hover:shadow-md transition-shadow" disabled={saving}><Lock className="w-4 h-4 mr-2" />{saving ? "Alterando..." : "Alterar Senha"}</Button>
                          </div>
                      </form>
                    </div>
                    <div>
                        <h4 className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2 mb-4">
                           <Trash2 className="w-5 h-5" />
                           Remover senha do App
                        </h4>
                        <div className="p-4 border border-blue-200 dark:border-blue-800/50 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">Se remover a senha, seu aplicativo não a solicitará mais para acesso.</p>
                                <Button onClick={() => setIsRemovePasswordModalOpen(true)} className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 w-full md:w-auto md:shrink-0" disabled={saving}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover Senha
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
              ) : (
                // CREATE PASSWORD VIEW
                <div>
                  <h4 className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2 mb-4">
                    <Lock className="w-5 h-5" />
                    Criar Senha de Acesso
                  </h4>
                  <form onSubmit={handlePasswordCreate} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-4 mb-6 text-sm text-blue-800 dark:text-blue-200">
                      <p>Proteja sua conta adicionando uma senha. Se ativada, ela será solicitada sempre que você acessar o aplicativo.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                          <Label htmlFor="create_new_password">Nova Senha</Label>
                          <div className="relative"><Input id="create_new_password" type={showNewPassword ? "text" : "password"} value={passwordData.new_password} onChange={handleNewPasswordChange} placeholder="Digite a nova senha" className="pr-10 bg-white text-gray-900" required minLength={6}/><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                          {passwordData.new_password.length > 0 && (<div className="mt-2 flex items-center gap-2"><div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${passwordStrength.color} transition-all duration-300`} style={{ width: passwordStrength.width }}></div></div><span className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">{passwordStrength.label}</span></div>)}
                      </div>
                       <div>
                          <Label htmlFor="create_confirm_password">Confirmar Nova Senha</Label>
                          <div className="relative"><Input id="create_confirm_password" type={showConfirmPassword ? "text" : "password"} value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} placeholder="Confirme a nova senha" className="pr-10 bg-white text-gray-900" required minLength={6}/><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                      </div>
                    </div>
                     <div className="flex flex-col md:flex-row md:justify-end">
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto shadow-sm hover:shadow-md transition-shadow" disabled={saving}><Lock className="w-4 h-4 mr-2" />{saving ? "Ativando..." : "Ativar Senha de Acesso"}</Button>
                      </div>
                  </form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Membros */}
        {familyContext && (<FamilyAccountCard context={familyContext} onUpdate={loadData}/>)}
      </div>

      {/* Generic Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-md w-full animate-in fade-in-0 zoom-in-95 text-center" onClick={(e) => e.stopPropagation()}>
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${modalState.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {modalState.type === 'success' ? (<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />) : (<AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />)}
            </div>
            <div className="mt-3"><h3 className="text-lg font-bold text-gray-900 dark:text-gray-50" id="modal-title">{modalState.title}</h3><div className="mt-2"><p className="text-sm text-gray-600 dark:text-gray-300">{modalState.text}</p></div></div>
            <div className="mt-6 sm:mt-8"><Button type="button" onClick={closeModal} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">Fechar</Button></div>
          </div>
        </div>
      )}

      {/* Remove Password Modal */}
      {isRemovePasswordModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-md w-full animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 text-center">Remover Senha</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2">Para confirmar a remoção, digite sua senha atual abaixo. O app não solicitará mais senha para acesso.</p>
            <div className="mt-4">
                <Label htmlFor="password_for_removal">Senha Atual</Label>
                <div className="relative">
                    <Input
                      id="password_for_removal"
                      type={showPasswordForRemoval ? "text" : "password"}
                      value={passwordForRemoval}
                      onChange={(e) => {
                        setPasswordForRemoval(e.target.value);
                        if (passwordRemovalError) setPasswordRemovalError('');
                      }}
                      className={`bg-white pr-10 ${passwordRemovalError ? 'border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                     <button 
                        type="button" 
                        onClick={() => setShowPasswordForRemoval(!showPasswordForRemoval)} 
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showPasswordForRemoval ? "Esconder senha" : "Mostrar senha"}
                    >
                        {showPasswordForRemoval ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                <div className="mt-1 h-5">
                  {passwordRemovalError && (
                    <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {passwordRemovalError}
                    </p>
                  )}
                </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-center gap-3">
              <Button type="button" onClick={() => setIsRemovePasswordModalOpen(false)} className="w-full sm:w-auto bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600" disabled={saving}>Cancelar</Button>
              <Button type="button" onClick={handlePasswordRemove} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700" disabled={saving}><Trash2 className="w-4 h-4 mr-2" />{saving ? 'Removendo...' : 'Confirmar Remoção'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}