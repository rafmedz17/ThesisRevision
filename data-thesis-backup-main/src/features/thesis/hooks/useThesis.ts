import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Thesis, ThesisResponse, ThesisFilters } from '@/types/thesis';
import { toast } from 'sonner';

// Mock data for development
const mockTheses: Thesis[] = [
  // College - Computer Science
  {
    id: '1',
    title: 'Machine Learning Applications in Healthcare Data Analysis',
    abstract: 'This research explores the implementation of machine learning algorithms for analyzing healthcare data patterns and improving diagnostic accuracy. The study focuses on developing predictive models that can assist healthcare professionals in making data-driven decisions.',
    authors: [{ id: '1', name: 'John Smith',}],
    advisors: [{ id: '1', name: 'Dr. Sarah Johnson' }],
    department: 'college',
    program: 'Computer Science',
    year: 2024,
  },
  {
    id: '2',
    title: 'Blockchain Technology for Supply Chain Management',
    abstract: 'An innovative approach to implementing blockchain technology in supply chain systems to improve transparency, traceability, and efficiency in logistics operations.',
    authors: [{ id: '5', name: 'David Chen' }],
    advisors: [{ id: '1', name: 'Dr. Sarah Johnson' }],
    department: 'college',
    program: 'Computer Science',
    year: 2023,
  },
  {
    id: '3',
    title: 'Cybersecurity Threats in IoT Devices: Detection and Prevention',
    abstract: 'This study examines security vulnerabilities in Internet of Things devices and proposes advanced detection mechanisms and prevention strategies.',
    authors: [{ id: '6', name: 'Lisa Wang' }],
    advisors: [{ id: '4', name: 'Dr. Mark Thompson' }],
    department: 'college',
    program: 'Computer Science',
    year: 2023,
  },
  {
    id: '4',
    title: 'Natural Language Processing for Sentiment Analysis in Social Media',
    abstract: 'Developing NLP models to analyze sentiment patterns in social media posts and their applications in brand monitoring and market research.',
    authors: [{ id: '7', name: 'James Martinez' }],
    advisors: [{ id: '1', name: 'Dr. Sarah Johnson' }],
    department: 'college',
    program: 'Computer Science',
    year: 2024,
  },
  // College - Environmental Science
  {
    id: '5',
    title: 'Climate Change Impact on Local Ecosystems: A Comprehensive Study',
    abstract: 'An in-depth analysis of how climate change affects local biodiversity and ecosystem dynamics. This research provides valuable insights into environmental conservation strategies and sustainable development practices.',
    authors: [
      { id: '2', name: 'Emily Davis' },
      { id: '3', name: 'Michael Brown' }
    ],
    advisors: [{ id: '2', name: 'Dr. Robert Wilson' }],
    department: 'college',
    program: 'Environmental Science',
    year: 2024,
  },
  {
    id: '6',
    title: 'Sustainable Water Management in Urban Areas',
    abstract: 'Research on innovative water conservation techniques and sustainable management practices for urban environments facing water scarcity challenges.',
    authors: [{ id: '8', name: 'Sarah Green' }],
    advisors: [{ id: '2', name: 'Dr. Robert Wilson' }],
    department: 'college',
    program: 'Environmental Science',
    year: 2023,
  },
  {
    id: '7',
    title: 'Renewable Energy Sources and Their Environmental Impact',
    abstract: 'Comparative analysis of various renewable energy sources including solar, wind, and hydroelectric power, and their effects on local environments.',
    authors: [{ id: '9', name: 'Kevin Park' }],
    advisors: [{ id: '5', name: 'Dr. Elizabeth Moore' }],
    department: 'college',
    program: 'Environmental Science',
    year: 2024,
  },
  // College - Business Administration
  {
    id: '8',
    title: 'Digital Marketing Strategies for Small Businesses',
    abstract: 'Exploring effective digital marketing approaches and their implementation in small business environments to enhance brand visibility and customer engagement.',
    authors: [{ id: '10', name: 'Amanda Lee' }],
    advisors: [{ id: '6', name: 'Prof. Richard Davis' }],
    department: 'college',
    program: 'Business Administration',
    year: 2024,
  },
  {
    id: '9',
    title: 'Impact of Remote Work on Employee Productivity and Satisfaction',
    abstract: 'Analyzing the effects of remote work arrangements on employee performance, work-life balance, and overall job satisfaction in modern organizations.',
    authors: [{ id: '11', name: 'Robert Kim' }],
    advisors: [{ id: '7', name: 'Dr. Patricia White' }],
    department: 'college',
    program: 'Business Administration',
    year: 2023,
  },
  {
    id: '10',
    title: 'Sustainable Business Practices and Corporate Social Responsibility',
    abstract: 'Investigating how businesses integrate sustainability initiatives and CSR programs to create long-term value for stakeholders and society.',
    authors: [{ id: '12', name: 'Maria Santos' }],
    advisors: [{ id: '6', name: 'Prof. Richard Davis' }],
    department: 'college',
    program: 'Business Administration',
    year: 2024,
  },
  // College - Engineering
  {
    id: '11',
    title: 'Smart City Infrastructure: IoT Integration in Urban Systems',
    abstract: 'Design and implementation of IoT-based smart city solutions for traffic management, waste management, and energy optimization in urban areas.',
    authors: [{ id: '13', name: 'Daniel Wright' }],
    advisors: [{ id: '8', name: 'Engr. Thomas Anderson' }],
    department: 'college',
    program: 'Engineering',
    year: 2024,
  },
  {
    id: '12',
    title: 'Renewable Energy Grid Integration: Challenges and Solutions',
    abstract: 'Technical analysis of integrating renewable energy sources into existing power grids and addressing stability and efficiency challenges.',
    authors: [{ id: '14', name: 'Jennifer Taylor' }],
    advisors: [{ id: '9', name: 'Dr. Christopher Lee' }],
    department: 'college',
    program: 'Engineering',
    year: 2023,
  },
  // Senior High - STEM
  {
    id: '13',
    title: 'Physics of Renewable Energy: Solar Panel Efficiency Study',
    abstract: 'Investigating factors affecting solar panel efficiency and proposing methods to optimize energy conversion in various environmental conditions.',
    authors: [{ id: '15', name: 'Chris Anderson' }],
    advisors: [{ id: '10', name: 'Mr. Steven Garcia' }],
    department: 'senior-high',
    program: 'STEM',
    year: 2024,
  },
  {
    id: '14',
    title: 'Mathematical Modeling of Disease Spread in Communities',
    abstract: 'Using mathematical models to understand and predict disease transmission patterns in local communities and evaluate intervention strategies.',
    authors: [{ id: '16', name: 'Nicole Chen' }],
    advisors: [{ id: '11', name: 'Ms. Rachel Martinez' }],
    department: 'senior-high',
    program: 'STEM',
    year: 2023,
  },
  {
    id: '15',
    title: 'Chemistry of Natural Products: Plant-Based Medicine Research',
    abstract: 'Exploring the chemical composition and medicinal properties of local plant species for potential pharmaceutical applications.',
    authors: [{ id: '17', name: 'Marcus Johnson' }],
    advisors: [{ id: '12', name: 'Dr. Angela Brown' }],
    department: 'senior-high',
    program: 'STEM',
    year: 2024,
  },
  // Senior High - Humanities and Social Sciences
  {
    id: '16',
    title: 'Social Media Influence on Teen Mental Health Awareness',
    abstract: 'This capstone project examines the correlation between social media usage and mental health awareness among teenagers. The research includes surveys and analysis of digital behavior patterns.',
    authors: [{ id: '4', name: 'Ashley Rodriguez' }],
    advisors: [{ id: '3', name: 'Ms. Jennifer Lee' }],
    department: 'senior-high',
    program: 'Humanities and Social Sciences',
    year: 2024,
  },
  {
    id: '17',
    title: 'Cultural Identity and Language Preservation in Modern Society',
    abstract: 'Examining the importance of language preservation in maintaining cultural identity and proposing strategies for promoting indigenous languages.',
    authors: [{ id: '18', name: 'Sofia Reyes' }],
    advisors: [{ id: '13', name: 'Ms. Catherine Lopez' }],
    department: 'senior-high',
    program: 'Humanities and Social Sciences',
    year: 2023,
  },
  {
    id: '18',
    title: 'Impact of Literature on Social Change and Awareness',
    abstract: 'Analyzing how literature influences social movements and raises awareness about important societal issues throughout history.',
    authors: [{ id: '19', name: 'Emma Wilson' }],
    advisors: [{ id: '14', name: 'Mr. David Harris' }],
    department: 'senior-high',
    program: 'Humanities and Social Sciences',
    year: 2024,
  },
  // Senior High - Accountancy and Business Management
  {
    id: '19',
    title: 'Financial Literacy Among High School Students: A Survey Study',
    abstract: 'Assessing the level of financial literacy among senior high school students and proposing educational interventions to improve money management skills.',
    authors: [{ id: '20', name: 'Joshua Cruz' }],
    advisors: [{ id: '15', name: 'Ms. Mary Johnson' }],
    department: 'senior-high',
    program: 'Accountancy and Business Management',
    year: 2024,
  },
  {
    id: '20',
    title: 'Entrepreneurship Skills Development in Secondary Education',
    abstract: 'Exploring methods to develop entrepreneurial mindset and skills among senior high school students through practical business projects.',
    authors: [{ id: '21', name: 'Isabella Garcia' }],
    advisors: [{ id: '16', name: 'Mr. Robert Santos' }],
    department: 'senior-high',
    program: 'Accountancy and Business Management',
    year: 2023,
  },
];

// Query Keys
export const thesisKeys = {
  all: ['thesis'] as const,
  lists: () => [...thesisKeys.all, 'list'] as const,
  list: (filters: ThesisFilters) => [...thesisKeys.lists(), filters] as const,
  details: () => [...thesisKeys.all, 'detail'] as const,
  detail: (id: string) => [...thesisKeys.details(), id] as const,
};

// Fetch thesis list with filters and pagination
export const useThesisList = (filters: ThesisFilters = {}, page: number = 1, limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...thesisKeys.list(filters), page, limit],
    queryFn: async (): Promise<ThesisResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.department) params.append('department', filters.department);
      if (filters.program) params.append('program', filters.program);
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/thesis?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled, // Only fetch when enabled is true
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
};

// Fetch single thesis details
export const useThesisDetail = (id: string) => {
  return useQuery({
    queryKey: thesisKeys.detail(id),
    queryFn: async (): Promise<Thesis> => {
      const response = await api.get(`/thesis/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Download thesis mutation
export const useDownloadThesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thesisId: string) => {
      const response = await api.get(`/thesis/${thesisId}`);
      const thesis = response.data;

      if (thesis.pdfUrl) {
        // Create PDF URL (handles both Cloudinary and local URLs)
        let pdfFullUrl = thesis.pdfUrl;

        // If URL is not complete, construct it from backend URL
        if (!thesis.pdfUrl.startsWith('http://') && !thesis.pdfUrl.startsWith('https://')) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const baseUrl = apiUrl.replace('/api', '');
          pdfFullUrl = `${baseUrl}${thesis.pdfUrl}`;
        }

        // Open PDF in new tab
        window.open(pdfFullUrl, '_blank', 'noopener,noreferrer');

        toast.success('Opening PDF', {
          description: 'The PDF will open in a new tab.',
        });
      } else {
        throw new Error('PDF not available');
      }

      return { success: true };
    },
    onSuccess: (_data, thesisId) => {
      // Invalidate and refetch thesis data to update download count
      queryClient.invalidateQueries({ queryKey: thesisKeys.detail(thesisId) });
      queryClient.invalidateQueries({ queryKey: thesisKeys.lists() });
    },
    onError: () => {
      toast.error('Download failed', {
        description: 'Unable to download the thesis. Please try again.',
      });
    },
  });
};

// Delete thesis mutation
export const useDeleteThesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thesisId: string) => {
      const response = await api.delete(`/thesis/${thesisId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Thesis deleted successfully', {
        description: 'The thesis has been permanently removed.',
      });
      // Invalidate and refetch thesis lists
      queryClient.invalidateQueries({ queryKey: thesisKeys.lists() });
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
    onError: (error: any) => {
      toast.error('Delete failed', {
        description: error.response?.data?.error || 'Unable to delete the thesis. Please try again.',
      });
    },
  });
};