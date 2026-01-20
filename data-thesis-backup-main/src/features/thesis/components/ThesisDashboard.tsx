import { useState, useEffect, useMemo, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Filter } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";
import { useThesisList } from "../hooks/useThesis";
import { ThesisFilters, Thesis } from "@/types/thesis";
import SearchInput from "@/components/shared/SearchInput";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ThesisCard from "./ThesisCard";
import ThesisViewDialog from "./ThesisViewDialog";
import AppHeader from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ThesisDashboardProps {
  department: 'college' | 'senior-high';
}

const ThesisDashboard = ({ department }: ThesisDashboardProps) => {
  const { searchQuery } = useUIStore();
  const { programs, fetchPrograms } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState<ThesisFilters>({
    department,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [departmentTotal, setDepartmentTotal] = useState<number>(0);

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Fetch total count for department (unfiltered)
  useEffect(() => {
    const fetchDepartmentTotal = async () => {
      try {
        const response = await api.get('/thesis', {
          params: {
            department,
            page: 1,
            pageSize: 1 // We only need the total count, not the data
          }
        });
        setDepartmentTotal(response.data.total);
      } catch (error) {
        console.error('Failed to fetch department total:', error);
      }
    };
    fetchDepartmentTotal();
  }, [department]);

  // Fetch unique years for this department
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get('/thesis/years/unique', {
          params: { department }
        });
        setAvailableYears(response.data);
      } catch (error) {
        console.error('Failed to fetch years:', error);
      }
    };
    fetchYears();
  }, [department]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Memoize filters to prevent unnecessary re-renders
  const currentFilters = useMemo(() => ({
    ...filters,
    search: searchQuery || undefined,
  }), [filters, searchQuery]);

  const { data, isLoading, isFetching, error } = useThesisList(currentFilters, currentPage, pageSize);

  const handleThesisClick = useCallback((thesis: Thesis) => {
    setSelectedThesis(thesis);
    setIsViewDialogOpen(true);
  }, []);

  const departmentTitle = department === 'college' ? 'College Department' : 'Senior High School';

  const handleFilterChange = useCallback((key: keyof ThesisFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Memoize filtered programs to prevent unnecessary recalculations
  const departmentPrograms = useMemo(() =>
    programs.filter(p => p.department === department && p.isActive),
    [programs, department]
  );

  // Only show full-page loading on initial load (no data yet)
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading thesis collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Something went wrong</p>
          <p className="text-muted-foreground mb-4">Unable to load thesis data</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AppHeader />

      {/* Department & Stats */}
      <div className="container mx-auto px-4 py-4">
        <div>
          <h1 className="text-xl font-semibold">{departmentTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {departmentTotal} research papers available
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters & Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex items-center gap-2">
                <SearchInput
                  placeholder={`Search ${department} thesis...`}
                  className="w-full sm:w-auto"
                />
                {isFetching && (
                  <LoadingSpinner size="sm" className="text-primary" />
                )}
              </div>

              <div className="flex gap-2">
                <Select 
                  value={filters.program || 'all'} 
                  onValueChange={(value) => handleFilterChange('program', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {departmentPrograms.map(program => (
                      <SelectItem key={program.id} value={program.name}>{program.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.year?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('year', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {data?.data.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No thesis found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <>
            {/* Thesis List */}
            <div className="space-y-4 mb-8">
              {data?.data.map((thesis) => (
                <ThesisCard 
                  key={thesis.id} 
                  thesis={thesis}
                  onClick={handleThesisClick}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {data && data.data.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Items per page:</span>
                  <Select 
                    value={pageSize.toString()} 
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1); // Reset to first page
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === data.totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        if (!showPage) {
                          // Show ellipsis for skipped pages
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <span className="px-4">...</span>
                              </PaginationItem>
                            );
                          }
                          return null;
                        }

                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
                          className={currentPage === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}

                {/* Page info - only show if multiple pages exist */}
                {data.totalPages > 1 && (
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {data.totalPages}
                  </div>
                )}
                
                {/* Show message if only one page exists */}
                {data.totalPages === 1 && (
                  <div className="text-sm text-muted-foreground">
                    Showing all {data.data.length} items
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* View Dialog */}
      <ThesisViewDialog 
        thesis={selectedThesis}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        showPdfPreview={isAuthenticated}
      />
    </div>
  );
};

export default ThesisDashboard;
