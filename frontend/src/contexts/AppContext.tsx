import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { storage } from "@/src/utils/storage";
import type { Lang } from "@/src/i18n";

const TOKEN_KEY = "alberto_token";
const LANG_KEY = "alberto_lang";

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

type Ctx = {
  token: string | null;
  username: string | null;
  lang: Lang;
  ready: boolean;
  setLang: (l: Lang) => void;
  login: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AppCtx = createContext<Ctx | undefined>(undefined);

async function secureGet(k: string): Promise<string | null> {
  try { return await SecureStore.getItemAsync(k); } catch { return null; }
}
async function secureSet(k: string, v: string) {
  try { await SecureStore.setItemAsync(k, v); } catch {}
}
async function secureDel(k: string) {
  try { await SecureStore.deleteItemAsync(k); } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [lang, setLangState] = useState<Lang>("pt");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [tk, savedLang] = await Promise.all([
        secureGet(TOKEN_KEY),
        storage.getItem(LANG_KEY),
      ]);
      if (tk) {
        setToken(tk);
        setUsername("alberto");
      }
      if (savedLang === "pt" || savedLang === "en") setLangState(savedLang);
      setReady(true);
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.setItem(LANG_KEY, l);
  }, []);

  const login = useCallback(async (u: string, p: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
    if (!res.ok) throw new Error("invalid");
    const data = await res.json();
    await secureSet(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUsername(data.username);
  }, []);

  const logout = useCallback(async () => {
    await secureDel(TOKEN_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  const apiFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(`${API}${path}`, { ...init, headers });
    },
    [token]
  );

  const value = useMemo(
    () => ({ token, username, lang, ready, setLang, login, logout, apiFetch }),
    [token, username, lang, ready, setLang, login, logout, apiFetch]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
