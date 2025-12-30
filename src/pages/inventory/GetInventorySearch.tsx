import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const GetInventorySearch = () => {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (itemName) params.set("itemName", itemName);
    if (category) params.set("category", category);
    navigate(`/dashboard/get-inventory/list?${params.toString()}`);
  };

  const handleGetAll = () => {
    navigate("/dashboard/get-inventory/list?all=true");
  };

  return (
    <DashboardLayout breadcrumbs={["Get Inventory"]}>
      <div className="max-w-xl">
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <div className="space-y-4">
            {/* Item Name Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleGetAll}
                className="text-primary font-medium text-sm hover:underline"
              >
                GET ALL
              </button>
              <Button onClick={handleSearch} className="px-8">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GetInventorySearch;
