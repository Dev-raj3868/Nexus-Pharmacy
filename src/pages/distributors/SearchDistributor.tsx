import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const SearchDistributor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Enter supplier name to search");
      return;
    }

    navigate(`/distributors/list?supplier=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <DashboardLayout breadcrumbs={["Distributor", "Search"]}>
      <div className="bg-card rounded-lg border border-border p-6 max-w-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Supplier Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchDistributor;
