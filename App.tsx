import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Lancamentos from './components/Lancamentos';
import Cartoes from './components/Cartoes';
import Previsoes from './components/Previsoes';
import Configuracoes from './components/Configuracoes';
import ContaUsuario from './components/ContaUsuario';
import MinhasCategorias from './components/MinhasCategorias';
import { User as UserService } from './entities/all';
import { User as UserType } from './types';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { UserCircle, Settings, CreditCard, Tag, Target, LogOut } from './components/icons';
import { auth } from './integrations/firebase';
import LoginPage from './components/LoginPage';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState<UserType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await UserService.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    if (currentUser) {
      fetchUser();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };


  interface NavButtonProps {
    currentView: string;
    targetView: string;
    setView: (view: string) => void;
    children: React.ReactNode;
  }

  const NavButton: React.FC<NavButtonProps> = ({ currentView, targetView, setView: setViewProp, children }) => {
    const isActive = currentView === targetView;
    const classes = isActive
      ? "bg-blue-600 text-white"
      : "text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";
    return (
      <button
        onClick={() => setViewProp(targetView)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${classes}`}
      >
        {children}
      </button>
    );
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleNavigation = (targetView: string) => {
    setView(targetView);
    setIsDropdownOpen(false);
  };

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center gap-4 p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mr-auto">
            Gestão Pessoal
          </h1>
          <NavButton currentView={view} targetView="dashboard" setView={setView}>
            Dashboard
          </NavButton>
          <NavButton currentView={view} targetView="lancamentos" setView={setView}>
            Lançamentos
          </NavButton>
          <NavButton currentView={view} targetView="previsoes" setView={setView}>
            Previsões
          </NavButton>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
              aria-label="Menu do usuário"
              aria-expanded={isDropdownOpen}
            >
              <Avatar className="h-9 w-9 border-2 border-transparent hover:border-blue-500 transition-colors">
                {user?.profile_image ? (
                  <AvatarImage src={user.profile_image} alt={user.full_name} />
                ) : (
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-semibold">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in-0 zoom-in-95"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1" role="none">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                     <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.full_name}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => handleNavigation('conta')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                    <UserCircle className="w-4 h-4" />
                    Meu perfil
                  </button>
                  <button onClick={() => handleNavigation('configuracoes')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  <button onClick={() => handleNavigation('cartoes')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                    <CreditCard className="w-4 h-4" />
                    Meus cartões
                  </button>
                   <button onClick={() => handleNavigation('minhascategorias')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                    <Tag className="w-4 h-4" />
                    Minhas categorias
                  </button>
                   <button onClick={() => handleNavigation('configuracoes')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                    <Target className="w-4 h-4" />
                    Minhas metas
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" role="menuitem">
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'lancamentos' && <Lancamentos />}
        {view === 'cartoes' && <Cartoes />}
        {view === 'previsoes' && <Previsoes />}
        {view === 'configuracoes' && <Configuracoes />}
        {view === 'conta' && <ContaUsuario />}
        {view === 'minhascategorias' && <MinhasCategorias />}
      </main>
    </div>
  );
};

export default App;
