import { createContext, useContext, useMemo, useCallback } from "react";
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

  const login = useCallback((newToken: string, newNome: string) => {
    setToken(newToken);
    setNome(newNome);
    navigate("/");
  }, [setToken, setNome, navigate]);

  const logout = useCallback(() => {
    removeToken();
    removeNome();
    navigate("/login");
  }, [removeToken, removeNome, navigate]);

  const value = useMemo(
    () => ({
      token,
      nome,
      isAuthenticated: !!token && !!nome,
      login,
      logout,
    }),
    [token, nome, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
