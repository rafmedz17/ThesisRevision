export interface Author {
  id: string;
  name: string;
  // email?: string;
}

export interface Advisor {
  id: string;
  name: string;
  // title: string;
  // department: string;
}

export interface Thesis {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  advisors: Advisor[];
  department: 'college' | 'senior-high';
  program: string;
  year: number;
  // dateSubmitted: string;
  // keywords: string[];
  pdfUrl?: string;
  shelfLocation?: string;
  // coverImageUrl?: string;
  // status: 'published' | 'draft' | 'under-review';
  // downloadCount: number;
  // viewCount: number;
  // category: string;
  // language: string;
  // pages: number;
  // createdAt: string;
  // updatedAt: string;
}

export interface ThesisFilters {
  department?: 'college' | 'senior-high';
  program?: string;
  year?: number;
  category?: string;
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ThesisResponse = PaginatedResponse<Thesis>;