import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CAREERS, type CareerKey, type CareerProfile } from "@/lib/career-links";

type Ripple = { x: number; y: number; id: number; color: string };

type Ctx = {
  active: CareerKey;
  profile: CareerProfile;
  setActive: (key: CareerKey, e?: { clientX: number; clientY: number } | React.MouseEvent) => void;
  ripple: Ripple | null;
};

const CareerCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "careerpilot.activeCareer";

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [active, setActiveState] = useState<CareerKey>("frontend");
  const [ripple, setRipple] = useState<Ripple | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CareerKey | null;
      if (saved && CAREERS[saved]) setActiveState(saved);
    } catch { /* ignore */ }
  }, []);

  const setActive = useCallback<Ctx["setActive"]>((key, e) => {
    setActiveState(key);
    try { localStorage.setItem(STORAGE_KEY, key); } catch { /* ignore */ }
    if (e && "clientX" in e && "clientY" in e) {
      setRipple({ x: e.clientX, y: e.clientY, id: Date.now(), color: CAREERS[key].glow });
    }
  }, []);

  const value = useMemo<Ctx>(() => ({
    active,
    profile: CAREERS[active],
    setActive,
    ripple,
  }), [active, ripple, setActive]);

  return <CareerCtx.Provider value={value}>{children}</CareerCtx.Provider>;
}

export function useCareer() {
  const ctx = useContext(CareerCtx);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}
