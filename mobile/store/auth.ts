import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, apiFetchForm } from "@/lib/api";

type AuthState = {
  userId: string | null;
  token: string | null;
  user: any | null;
  loading: boolean;

  setAuth: (userId: string, token: string, user?: any) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
};

export const useAuth = create<AuthState>((set) => ({
  userId: null,
  token: null,
  user: null,
  loading: false,

  setAuth: async (userId, token, user) => {
    try {
      await AsyncStorage.setItem("token", token || "");
      await AsyncStorage.setItem("userId", userId || "");
    } catch (e) {}
    set({ userId, token, user: user ?? null });
  },

  signup: async (payload) => {
    set({ loading: true });
    try {
      const res = await apiFetch("/api/v1/users/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const email =
        payload.email ||
        payload.correo ||
        payload.username ||
        payload.email;

      const password = payload.password;

      if (!email || !password) {
        set({ loading: false });
        throw new Error("Email o password no válidos");
      }

      const tokenRes = await apiFetchForm("/api/v1/login/access-token", {
        username: email,
        password,
        grant_type: "password",
      });

      const accessToken = tokenRes.access_token;
      if (!accessToken) throw new Error("No hubo access_token");

      const userRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/login/test-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userRes.ok) throw new Error("Error obteniendo usuario");

      const userJson = await userRes.json();

      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem("userId", userJson.id);

      set({
        userId: userJson.id,
        token: accessToken,
        user: userJson,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const tokenRes = await apiFetchForm("/api/v1/login/access-token", {
        username,
        password,
        grant_type: "password",
      });

      const accessToken = tokenRes.access_token;
      if (!accessToken) throw new Error("Acceso inválido");

      const userRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/login/test-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userRes.ok) throw new Error("Token inválido");

      const userJson = await userRes.json();

      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem("userId", userJson.id);

      set({
        userId: userJson.id,
        token: accessToken,
        user: userJson,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
    } catch (e) {}

    set({ userId: null, token: null, user: null });
  },

  restoreSession: async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return false;

    try {
      const userRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/login/test-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userRes.ok) throw new Error("Token inválido");

      const userJson = await userRes.json();

      set({
        token,
        userId: userJson.id,
        user: userJson,
      });

      return true;
    } catch {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      return false;
    }
  },
}));
