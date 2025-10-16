
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../integrations/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuthAction = async () => {
    setError("");
    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        setError(error.message);
      }
    } else {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Cadastro"}
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
              />
            </div>
          )}
        </div>
        <Button onClick={handleAuthAction} className="w-full">
          {isLogin ? "Login" : "Cadastrar"}
        </Button>
        <Button onClick={handleGoogleSignIn} className="w-full mt-4">
          Login com Google
        </Button>
        <Button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4">
          {isLogin ? "Criar uma conta" : "Já tenho uma conta"}
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
