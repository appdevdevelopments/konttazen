import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../integrations/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FcGoogle } from 'react-icons/fc';
import { FiUser, FiZap, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError("Falha no login. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não correspondem.");
      return;
    }
    if (!name) {
        setError("Por favor, insira seu nome.");
        return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error: any) {
      setError("Falha no cadastro. Tente outro e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError("Falha na autenticação com o Google.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  return (
    <div className="flex items-center justify-center min-h-screen pt-12 pb-12 bg-[#F8F9FE]">
      <div className="w-full max-w-sm px-4 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-purple-600 rounded-lg shadow-md">
            <div className="w-8 h-8 text-white"><FiZap /></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Bem-vindo
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Entre na sua conta ou crie uma nova
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Tabs defaultValue="login" className="w-full" onValueChange={resetForm}>
            <TabsList className="grid w-full grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg">
                <TabsTrigger value="login" className="w-full py-2 text-base font-medium text-gray-500 rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="w-full py-2 text-base font-medium text-gray-500 rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">Cadastrar</TabsTrigger>
            </TabsList>

            {error && (
                <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                    {error}
                </div>
            )}

            <TabsContent value="login" className="mt-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div>
                  <Label htmlFor="email-login" className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="relative mt-1">
                    <Input
                      id="email-login"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-3 pr-10"
                      required
                    />
                    <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-gray-400"><FiMail size={20} /></div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="password-login" className="text-sm font-medium text-gray-600">Senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password-login"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-3 pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-0 bottom-0 flex items-center">
                        {showPassword ? <div className="w-5 h-5 text-gray-400 flex items-center justify-center"><FiEyeOff size={20} /></div> : <div className="w-5 h-5 text-gray-400 flex items-center justify-center"><FiEye size={20} /></div>}
                    </button>
                  </div>
                </div>
                <div className="text-right mt-2">
                    <a href="#" className="text-xs font-medium text-purple-600 hover:text-purple-500">
                        Esqueceu a senha?
                    </a>
                </div>
                <Button type="submit" disabled={loading} className="w-full !mt-5 text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                <div>
                  <Label htmlFor="name-signup" className="text-sm font-medium text-gray-600">Nome</Label>
                  <div className="relative mt-1">
                    <Input
                      id="name-signup"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome e sobrenome"
                      className="pl-3 pr-10"
                      required
                    />
                    <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-gray-400"><FiUser size={20} /></div>
                  </div>
                </div>
                 <div>
                  <Label htmlFor="email-signup" className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="relative mt-1">
                    <Input
                      id="email-signup"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-3 pr-10"
                      required
                    />
                    <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-gray-400"><FiMail size={20} /></div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="password-signup" className="text-sm font-medium text-gray-600">Senha</Label>
                   <div className="relative mt-1">
                        <Input
                          id="password-signup"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Crie uma senha"
                          className="pl-3 pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-0 bottom-0 flex items-center">
                            {showPassword ? <div className="w-5 h-5 text-gray-400 flex items-center justify-center"><FiEyeOff size={20} /></div> : <div className="w-5 h-5 text-gray-400 flex items-center justify-center"><FiEye size={20} /></div>}
                        </button>
                    </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword-signup" className="text-sm font-medium text-gray-600">Confirmar Senha</Label>
                  <div className="relative mt-1">
                    <Input
                        id="confirmPassword-signup"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="pl-3 pr-10"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-0 bottom-0 flex items-center">
                        {showPassword ? <div className="w-5 h-5 text-gray-400 flex items-center justify-center"><FiEyeOff size={20} /></div> : <div className="w-5 h-5 text-gray-400 flex items-center justify-center"><FiEye size={20} /></div>}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full !mt-6 text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90">
                  {loading ? 'Criando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#F8F9FE] text-gray-400">OU</span>
          </div>
        </div>

        <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
          <div className="w-4 h-4 mr-2"><FcGoogle /></div> Continuar com Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
