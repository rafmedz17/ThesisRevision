import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchInput = ({
  placeholder = "Search thesis...",
  className,
  onSearch
}: SearchInputProps) => {
  const { searchQuery, setSearchQuery } = useUIStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Sync local state with store on mount or when searchQuery changes externally
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounce the search query update to the store
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
      onSearch?.(localQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);

  const handleChange = (value: string) => {
    setLocalQuery(value);
  };

  const clearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localQuery}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-10 bg-surface border-input-border focus:ring-2 focus:ring-primary/10 transition-all duration-normal"
      />
      {localQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;