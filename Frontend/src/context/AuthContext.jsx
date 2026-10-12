
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const AuthContext = createContext(null);

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("campusUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("campusUser");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("campusToken") || ""
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem("campusToken", token);
      localStorage.setItem("campusUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("campusToken");
      localStorage.removeItem("campusUser");
    }
  }, [token, user]);

  async function authenticate(endpoint, formData) {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            data.error ||
            "Authentication failed"
        );
      }

      if (!data.token || !data.role) {
        throw new Error("Invalid authentication response from server");
      }

      const loggedInUser = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      setToken(data.token);
      setUser(loggedInUser);

      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }

  async function register(fullName, email, password) {
    return authenticate("register", {
      fullName,
      email,
      password,
    });
  }

  async function login(email, password) {
    return authenticate("login", {
      email,
      password,
    });
  }

  function logout() {
    setUser(null);
    setToken("");
  }

  async function apiFetch(url, options = {}) {
    const currentToken = localStorage.getItem("campusToken") || token;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(currentToken
          ? { Authorization: `Bearer ${currentToken}` }
          : {}),
      },
    });

    return response;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
