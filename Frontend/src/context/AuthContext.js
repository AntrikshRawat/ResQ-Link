"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signupUser, loginUser, loginAdmin, getCurrentUser } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("resqlink_token");
      const storedUser = localStorage.getItem("resqlink_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
      localStorage.removeItem("resqlink_token");
      localStorage.removeItem("resqlink_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session helper
  const saveSession = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem("resqlink_token", newToken);
      localStorage.setItem("resqlink_user", JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save auth session:", e);
    }
  }, []);

  // Normal user signup
  const signup = useCallback(async ({ full_name, email, password }) => {
    try {
      const res = await signupUser({ full_name, email, password });
      if (res.success && res.data?.token && res.data?.user) {
        saveSession(res.data.token, res.data.user);
      }
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to create account.",
      };
    }
  }, [saveSession]);

  // Normal user / general login
  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await loginUser({ email, password });
      if (res.success && res.data?.token && res.data?.user) {
        saveSession(res.data.token, res.data.user);
      }
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.message || "Invalid email or password.",
      };
    }
  }, [saveSession]);

  // Admin dedicated login
  const loginAsAdmin = useCallback(async ({ email, password }) => {
    try {
      const res = await loginAdmin({ email, password });
      if (res.success && res.data?.token && res.data?.user) {
        saveSession(res.data.token, res.data.user);
      }
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.message || "Invalid credentials or unauthorized account.",
      };
    }
  }, [saveSession]);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("resqlink_token");
      localStorage.removeItem("resqlink_user");
    } catch (e) {
      console.error("Failed to clear auth session:", e);
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isUser: user?.role === "USER",
    signup,
    login,
    loginAsAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
