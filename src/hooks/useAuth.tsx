import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AuthContextType {
  token: string | null;
  nome: string | null;
  isAuthenticated: boolean;
  login: (token: string, nome: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  nome: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [token, setToken, removeToken] = useLocalStorage<string | null>("token", null);
  const [nome, setNome, removeNome] = useLocalStorage<string | null>("nome", null);

  const login = (newToken: string, newNome: string) => {
    setToken(newToken);
    setNome(newNome);
    navigate("/");
  };

  const logout = () => {
    removeToken();
    removeNome();
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      token,
      nome,
      isAuthenticated: !!token && !!nome,
      login,
      logout,
    }),
    [token, nome]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
