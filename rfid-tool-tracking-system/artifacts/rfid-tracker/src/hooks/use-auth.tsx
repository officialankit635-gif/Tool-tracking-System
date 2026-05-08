import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

// Initialize the API client auth token getter
setAuthTokenGetter(() => localStorage.getItem("rfid_token"));

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("rfid_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const login = (newToken: string, user: User) => {
    localStorage.setItem("rfid_token", newToken);
    setToken(newToken);
    queryClient.setQueryData(getGetMeQueryKey(), user);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("rfid_token");
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading: isLoading && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
