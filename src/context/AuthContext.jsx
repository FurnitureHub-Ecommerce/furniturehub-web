import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      return token && stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // Sync with localStorage on changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        setUser(storedToken && stored ? JSON.parse(stored) : null);
        setToken(storedToken || null);
      } catch {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback((userData, authToken, fromLocation = null) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);

    const role = userData?.role?.toUpperCase();
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "STORAGE" || role === "STORAGE_MANAGER") return "/storage";
    if (role === "STAFF") return "/staff";

    // Khách hàng: giữ trang hiện tại hoặc về Trang Chủ ("/"), tuyệt đối không ép vào /products
    if (
      fromLocation &&
      fromLocation !== "/login" &&
      fromLocation !== "/register" &&
      fromLocation !== "/products"
    ) {
      return fromLocation;
    }
    return "/";
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || {};
}

export default AuthContext;
