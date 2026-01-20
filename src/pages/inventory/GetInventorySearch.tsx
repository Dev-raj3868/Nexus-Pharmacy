import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

// Type definitions for window.context
// declare global {
//   interface Window {
//     context: {
//       [x: string]: any;
//       getInventory?: (filters?: { name?: string; category?: string }) => Promise<any[]>;
//       createDistributor: (data: any) => Promise<string>;
//       writeDistributor: (id: string, data: string) => Promise<void>;
//     };
//   }
// }

const GetInventorySearch = () => {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await window.context.getInventory({
        name: itemName || undefined,
        category: category || undefined,
      });
      console.log("Search Results:", data);
      navigate("/dashboard/inventory/get", {
        state: { items: data },
      });
    } catch (error) {
      console.error("Failed to search inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAll = async () => {
    setLoading(true);
    try {
      const data = await window.context.getInventory();
      console.log("All Inventory Items:", data);
      navigate("/dashboard/inventory/get", {
        state: { items: data },
      });
    } catch (error) {
      console.error("Failed to fetch all inventory:", error);
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleGetAll}
                className="text-primary font-medium text-sm hover:underline disabled:opacity-50"
                disabled={loading}
              >
                GET ALL
              </button>
              <Button
                onClick={handleSearch}
                className="px-8"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GetInventorySearch;
