export interface StudentAssistant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'student-assistant';
}

export interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'student';
}

export interface StudentAssistantFormData {
  username: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface StudentFormData {
  username: string;
  firstName: string;
  lastName: string;
  password?: string;
}
