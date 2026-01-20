export interface StudentAssistant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'student-assistant';
}

export interface StudentAssistantFormData {
  username: string;
  firstName: string;
  lastName: string;
  password?: string;
}
