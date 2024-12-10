import { useStore } from "@nanostores/react";
import { $user, clearUser, setUser } from "@/lib/store";
import { API_URL } from "@/env";

function useAuth() {
  const user = useStore($user);

  const register = async (email: string, username: string, password: string) => {
    try {
      if (!email || !username || !password) {
        throw new Error("Email, username, and password are required!");
      }

      const response = await fetch(`${API_URL}/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include",
      });
      const jsonObject = await response.json();
      const msg = jsonObject.message;
      if (!response.ok) {
        throw new Error(msg);
      }
      const { user } = jsonObject;
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMessage =
        (error as Error).message ?? "Please try again later!";
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required!");
      }
      const response = await fetch(`${API_URL}/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const jsonObject = await response.json();
      const msg = jsonObject.message;
      if (!response.ok) {
        throw new Error(msg);
      }
      const { user } = jsonObject;
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMessage =
        (error as Error).message ?? "Please try again later!";
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/sign-out`, {
        method: "POST",
        credentials: "include",
      });
      clearUser();
    } catch (error) {
      const errorMessage =
        (error as Error).message ?? "Please try again later!";
      console.log(errorMessage);
    }
  };

  const validate = async () => {
    if (!user || !user.email) return false;

    try {
      const response = await fetch(`${API_URL}/validate-session`, {
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return { user, login, register, logout, validate };
}

export default useAuth;
