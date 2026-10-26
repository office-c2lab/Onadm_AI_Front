import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function readLegacyOpenState(key) {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(key) !== 'false';
}

const useSidebarStore = create(
  persist(
    set => ({
      aiStoreOpen: readLegacyOpenState('ai-store-sidebar-open'),
      adminOpen: readLegacyOpenState('admin-sidebar-open'),
      adminExpandedMenus: [],
      setAiStoreOpen: aiStoreOpen => set({ aiStoreOpen }),
      setAdminOpen: adminOpen => set({ adminOpen }),
      toggleAdminMenu: label =>
        set(state => ({
          adminExpandedMenus: state.adminExpandedMenus.includes(label)
            ? state.adminExpandedMenus.filter(item => item !== label)
            : [...state.adminExpandedMenus, label],
        })),
      expandAdminMenus: labels =>
        set(state => ({
          adminExpandedMenus: [...new Set([...state.adminExpandedMenus, ...labels])],
        })),
    }),
    {
      name: 'ondam-sidebar-state',
      partialize: state => ({
        aiStoreOpen: state.aiStoreOpen,
        adminOpen: state.adminOpen,
        adminExpandedMenus: state.adminExpandedMenus,
      }),
    }
  )
);

export default useSidebarStore;
