import React, { createContext, useContext, useMemo, useState } from 'react';

export type Role = 'assistant' | 'guest';
export type Session = { name: string; role: Role; deviceId: string } | null;

type AuthCtx = {
  session: Session;
  setSession: (s: Session) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);

  const signOut = () => {
    // si agregas un endpoint /api/auth/logout, llámalo aquí
    setSession(null);
  };

  const value = useMemo(() => ({ session, setSession, signOut }), [session]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
