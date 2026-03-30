import { create } from "zustand";

type MobileSidebarState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useMobileSidebarStore = create<MobileSidebarState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
