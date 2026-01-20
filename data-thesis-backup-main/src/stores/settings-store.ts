import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface Program {
  id: string;
  name: string;
  department: 'college' | 'senior-high';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  id: string;
  schoolName: string;
  schoolLogo?: string;
  headerBackground?: string;
  aboutContent: string;
  updatedAt: string;
}

interface SettingsState {
  // Programs
  programs: Program[];
  setPrograms: (programs: Program[]) => void;
  addProgram: (program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProgram: (id: string, program: Partial<Program>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  getProgramsByDepartment: (department: 'college' | 'senior-high') => Program[];
  fetchPrograms: () => Promise<void>;

  // System Settings
  systemSettings: SystemSettings;
  setSystemSettings: (settings: SystemSettings) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  fetchSystemSettings: () => Promise<void>;
}

// Initial mock data
const initialPrograms: Program[] = [
  // College Programs
  {
    id: '1',
    name: 'Bachelor of Science in Computer Science',
    department: 'college',
    description: 'Study of computation, algorithms, and information systems',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bachelor of Science in Business Administration',
    department: 'college',
    description: 'Business management and entrepreneurship program',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Bachelor of Arts in Education',
    department: 'college',
    description: 'Teacher education and pedagogical studies',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Senior High Programs
  {
    id: '4',
    name: 'Science, Technology, Engineering, and Mathematics (STEM)',
    department: 'senior-high',
    description: 'Focus on science and mathematics disciplines',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Accountancy, Business, and Management (ABM)',
    department: 'senior-high',
    description: 'Business and accounting fundamentals',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Humanities and Social Sciences (HUMSS)',
    department: 'senior-high',
    description: 'Social sciences and humanities studies',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const initialSystemSettings: SystemSettings = {
  id: '1',
  schoolName: 'Tayabas Western Academy',
  schoolLogo: undefined,
  headerBackground: undefined,
  aboutContent: 'Access a comprehensive collection of thesis and research papers from our academic community. Explore groundbreaking work across departments and programs.',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Programs state
      programs: initialPrograms,

      setPrograms: (programs) => {
        set({ programs });
      },

      fetchPrograms: async () => {
        try {
          const response = await api.get('/programs');
          set({ programs: response.data });
        } catch (error) {
          console.error('Failed to fetch programs:', error);
          throw error;
        }
      },

      addProgram: async (program) => {
        try {
          const response = await api.post('/programs', program);
          set((state) => ({
            programs: [...state.programs, response.data],
          }));
        } catch (error) {
          console.error('Failed to add program:', error);
          throw error;
        }
      },

      updateProgram: async (id, updates) => {
        try {
          const response = await api.put(`/programs/${id}`, updates);
          set((state) => ({
            programs: state.programs.map((program) =>
              program.id === id ? response.data : program
            ),
          }));
        } catch (error) {
          console.error('Failed to update program:', error);
          throw error;
        }
      },

      deleteProgram: async (id) => {
        try {
          await api.delete(`/programs/${id}`);
          set((state) => ({
            programs: state.programs.filter((program) => program.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete program:', error);
          throw error;
        }
      },

      getProgramsByDepartment: (department) => {
        return get().programs.filter(
          (program) => program.department === department && program.isActive
        );
      },

      // System Settings state
      systemSettings: initialSystemSettings,

      setSystemSettings: (settings) => {
        set({ systemSettings: settings });
      },

      fetchSystemSettings: async () => {
        try {
          const response = await api.get('/settings');
          set({ systemSettings: response.data });
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          throw error;
        }
      },

      updateSystemSettings: async (settings) => {
        try {
          const response = await api.put('/settings', settings);
          set({ systemSettings: response.data });
        } catch (error) {
          console.error('Failed to update settings:', error);
          throw error;
        }
      },
    }),
    {
      name: 'thesis-archive-settings',
    }
  )
);
