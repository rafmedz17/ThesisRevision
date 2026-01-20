import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/stores/ui-store";

const DepartmentSelector = () => {
  const navigate = useNavigate();
  const setSelectedDepartment = useUIStore(state => state.setSelectedDepartment);

  const departments = [
    {
      id: 'college',
      title: 'College Department',
      icon: GraduationCap,
      color: 'from-primary/5 to-primary/10',
      path: '/college'
    },
    {
      id: 'senior-high',
      title: 'Senior High School',
      icon: BookOpen,
      color: 'from-accent/5 to-accent/10',
      path: '/senior-high'
    }
  ];

  const handleDepartmentSelect = (dept: typeof departments[0]) => {
    setSelectedDepartment(dept.id as 'college' | 'senior-high');
    navigate(dept.path);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {departments.map((dept) => {
        const IconComponent = dept.icon;
        
        return (
          <Card 
            key={dept.id}
            className="group relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-normal hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            onClick={() => handleDepartmentSelect(dept)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-100 transition-opacity duration-normal`} />
            
            <div className="relative p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-surface-variant group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-normal">
                  <IconComponent className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-heading mb-3 group-hover:text-primary transition-colors duration-normal">
                {dept.title}
              </h3>
              
              <Button 
                variant="outline" 
                className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-normal"
              >
                Explore Thesis
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-normal" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DepartmentSelector;