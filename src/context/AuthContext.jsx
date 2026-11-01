import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserProfile } from "../services/api";

const AuthContext = createContext(null);

/**
 * Lấy chữ cái đầu của từ cuối cùng trong tên khách hàng.
 * Ví dụ: "Hoàng Nam Anh" -> "A", không có tên -> fallback "U".
 */
export function getAvatarInitial(name) {
  if (!name || typeof name !== "string") return "U";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  const lastWord = words[words.length - 1];
  return lastWord.charAt(0).toUpperCase() || "U";
}

export function AuthProvider({ children }) {
  // Tuyệt đối không khởi tạo user từ dữ liệu mock hay gán cứng.
  // Khởi tạo là khách vãng lai (user = null) cho đến khi xác thực token & lấy profile thật thành công.
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem("token");
      if (savedToken && typeof savedToken === "string" && savedToken.trim()) {
        return savedToken.trim();
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(localStorage.getItem("token")));

  // Chỉ set user đăng nhập nếu có token thật và gọi API lấy profile thành công
  useEffect(() => {
    let isCancelled = false;

    async function verifyAndLoadProfile() {
      const currentToken = token || localStorage.getItem("token");
      if (!currentToken || typeof currentToken !== "string" || !currentToken.trim()) {
        if (!isCancelled) {
          setUser(null);
          setToken(null);
          setIsAuthLoading(false);
        }
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        } catch {
          // ignore storage errors
        }
        return;
      }

      setIsAuthLoading(true);
      try {
        const res = await getUserProfile();
        if (isCancelled) return;

        const profileData = res?.data?.user || res?.data || null;
        if (profileData && typeof profileData === "object" && (profileData._id || profileData.id || profileData.email)) {
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        } else {
          throw new Error("Invalid profile data");
        }
      } catch {
        if (isCancelled) return;
        // Token không hợp lệ hoặc hết hạn -> đặt lại về trạng thái khách vãng lai (user = null)
        setUser(null);
        setToken(null);
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        } catch {
          // ignore storage errors
        }
      } finally {
        if (!isCancelled) {
          setIsAuthLoading(false);
        }
      }
    }

    verifyAndLoadProfile();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  // Sync with storage changes across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          setUser(null);
          setToken(null);
        } else {
          setToken(storedToken);
        }
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
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser((prev) => {
      if (!newUserData) return prev;
      const isSame =
        prev &&
        Object.keys(newUserData).every((key) => prev[key] === newUserData[key]);
      if (isSame) return prev;

      const merged = { ...(prev || {}), ...newUserData };
      try {
        localStorage.setItem("user", JSON.stringify(merged));
      } catch (err) {
        console.warn("Could not sync user to localStorage:", err);
      }
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthLoading,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        updateUser,
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
