import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, loginUser, registerUser } from "./api";

type User = {
  id: string;
  email: string;
  name: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const tokenStorageKey = "cloudlens-auth-token";

  const loadCurrentUser = async () => {
    const token = window.localStorage.getItem(tokenStorageKey);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetchCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Clear invalid token
      window.localStorage.removeItem(tokenStorageKey);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    window.localStorage.setItem(tokenStorageKey, response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await registerUser(email, password, name);
    window.localStorage.setItem(tokenStorageKey, response.token);
    setUser(response.user);
  };

  const logout = () => {
    window.localStorage.removeItem(tokenStorageKey);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
