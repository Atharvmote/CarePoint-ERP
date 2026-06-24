import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

// Helper: decode JWT and check if expired (no library needed)
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat malformed token as expired
  }
}

export function AuthProvider({ children }) {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check token on startup — clear it if expired
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      if (isTokenExpired(token)) {
        // Token is stale — wipe everything so user is prompted to re-login
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } else {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  // real login using backend API
  const login = async (credentials) => {
    try {
      const data = await api.login(credentials);

      if (!data.user) {
        throw new Error("User data missing from login response");
      }

      const loggedUser = data.user;

      setIsAuthenticated(true);
      setUser(loggedUser);

      // store user
      localStorage.setItem("user", JSON.stringify(loggedUser));

      return data;

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // register - sends OTP, does not auto-login
  const register = async (userData) => {
    try {
      // Step 1: create the account and send OTP
      const result = await api.register(userData);
      return result; // returns { message, email, userId }
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  // verify OTP and complete registration
  const verifyOtp = async (email, otp) => {
    try {
      const data = await api.verifyOtp(email, otp);

      // Only set authenticated state if token is present
      if (data.token) {
        const loggedUser = data.user;
        setIsAuthenticated(true);
        setUser(loggedUser);
        localStorage.setItem("user", JSON.stringify(loggedUser));
      }

      return data;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  };

  // resend OTP
  const resendOtp = async (email) => {
    try {
      const result = await api.resendOtp(email);
      return result; // returns { message, email }
    } catch (error) {
      console.error("Resend OTP failed:", error);
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        register,
        verifyOtp,
        resendOtp,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;

}

export default AuthContext;
