import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calendar, Eye, MapPin } from "lucide-react";
import { Thesis } from "@/types/thesis";

interface ThesisCardProps {
  thesis: Thesis;
  onClick?: (thesis: Thesis) => void;
}

const ThesisCard = ({ thesis, onClick }: ThesisCardProps) => {
  return (
    <Card 
      className="group transition-all duration-normal hover:shadow-md border-border/50 hover:border-primary/20 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
        {/* Left side - Thesis info */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-normal">
            {thesis.title}
          </h3>
          
          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="line-clamp-1">
                {thesis.authors.map(author => author.name).join(' & ')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{thesis.program}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{thesis.year}</span>
            </div>
            {thesis.shelfLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{thesis.shelfLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side - View button */}
        <div className="flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(thesis);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ThesisCard;
