"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Mode } from "@/lib/domain/types";

export type RoleView = "payer" | "worker" | "auditor";
interface AppCtx {
  mode: Mode;
  role: RoleView;
  setRole: (r: RoleView) => void;
  paletteOpen: boolean;
  setPaletteOpen: (o: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (o: boolean) => void;
  activityOpen: boolean;
  setActivityOpen: (o: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (o: boolean) => void;
}
const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleView>("payer");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    try {
      const r = localStorage.getItem("pp-role");
      if (r === "payer" || r === "worker" || r === "auditor") setRoleState(r);
    } catch {}
  }, []);
  const setRole = useCallback((r: RoleView) => {
    setRoleState(r);
    try {
      localStorage.setItem("pp-role", r);
    } catch {}
  }, []);
  const value = useMemo(
    () => ({ mode, role, setRole, paletteOpen, setPaletteOpen, shortcutsOpen, setShortcutsOpen, activityOpen, setActivityOpen, mobileNavOpen, setMobileNavOpen }),
    [mode, role, setRole, paletteOpen, shortcutsOpen, activityOpen, mobileNavOpen],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
