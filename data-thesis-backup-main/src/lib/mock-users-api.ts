import { StudentAssistant, StudentAssistantFormData } from '@/types/user';

// Mock data
const mockStudentAssistants: StudentAssistant[] = [
  {
    id: '1',
    username: 'assistant1',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student-assistant',
  },
  {
    id: '2',
    username: 'assistant2',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'student-assistant',
  },
];

let assistants = [...mockStudentAssistants];

export const mockUsersApi = {
  // Get all student assistants
  getStudentAssistants: async (): Promise<StudentAssistant[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...assistants]), 500);
    });
  },

  // Get single student assistant
  getStudentAssistant: async (id: string): Promise<StudentAssistant | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const assistant = assistants.find((a) => a.id === id);
        resolve(assistant || null);
      }, 300);
    });
  },

  // Create student assistant
  createStudentAssistant: async (
    data: StudentAssistantFormData
  ): Promise<StudentAssistant> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAssistant: StudentAssistant = {
          id: Math.random().toString(36).substring(2, 11),
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'student-assistant',
        };
        assistants.push(newAssistant);
        resolve(newAssistant);
      }, 500);
    });
  },

  // Update student assistant
  updateStudentAssistant: async (
    id: string,
    data: Partial<StudentAssistantFormData>
  ): Promise<StudentAssistant> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = assistants.findIndex((a) => a.id === id);
        if (index === -1) {
          reject(new Error('Student assistant not found'));
          return;
        }
        assistants[index] = {
          ...assistants[index],
          ...data,
        };
        resolve(assistants[index]);
      }, 500);
    });
  },

  // Delete student assistant
  deleteStudentAssistant: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = assistants.findIndex((a) => a.id === id);
        if (index === -1) {
          reject(new Error('Student assistant not found'));
          return;
        }
        assistants = assistants.filter((a) => a.id !== id);
        resolve();
      }, 500);
    });
  },
};
