import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Department = 'college' | 'senior-high' | null;
export type ViewMode = 'grid' | 'list';

interface UIState {
  // Navigation & Department
  selectedDepartment: Department;
  setSelectedDepartment: (department: Department) => void;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // View Preferences
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // UI States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Modal States
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Navigation & Department
        selectedDepartment: null,
        setSelectedDepartment: (department) => 
          set({ selectedDepartment: department }, false, 'setSelectedDepartment'),
        
        // Search & Filters
        searchQuery: '',
        setSearchQuery: (query) => 
          set({ searchQuery: query }, false, 'setSearchQuery'),
        
        // View Preferences
        viewMode: 'grid',
        setViewMode: (mode) => 
          set({ viewMode: mode }, false, 'setViewMode'),
        
        // UI States
        isLoading: false,
        setIsLoading: (loading) => 
          set({ isLoading: loading }, false, 'setIsLoading'),
        
        isMobileMenuOpen: false,
        setIsMobileMenuOpen: (open) => 
          set({ isMobileMenuOpen: open }, false, 'setIsMobileMenuOpen'),
        
        // Modal States
        activeModal: null,
        setActiveModal: (modal) => 
          set({ activeModal: modal }, false, 'setActiveModal'),
        
        // Theme
        isDarkMode: false,
        toggleDarkMode: () => 
          set((state) => ({ isDarkMode: !state.isDarkMode }), false, 'toggleDarkMode'),
      }),
      {
        name: 'thesis-archive-ui',
        partialize: (state) => ({
          selectedDepartment: state.selectedDepartment,
          viewMode: state.viewMode,
          isDarkMode: state.isDarkMode,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);