import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface Distributor {
  id: string;
  supplier_name: string;
  phone_number: string;
  email: string | null;
  address: string;
  remark: string | null;
}

const ITEMS_PER_PAGE = 15;

const GetDistributors = () => {
  const { user } = useAuth();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // final applied search value
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

 const fetchDistributors = async () => {
  if (!user || !searchQuery) return

  setLoading(true)
  try {
    /* -------------------------------
       1️⃣ ELECTRON (LOCAL DB)
    --------------------------------*/
    const filters = {
      supplier_name: searchQuery
    }

    const localResults = await window.context.getDistributors(filters)

    /* -------------------------------
       2️⃣ SUPABASE (CLOUD)
    --------------------------------*/
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

 
    /* -------------------------------
       3️⃣ UPDATE UI
    --------------------------------*/
    setDistributors( localResults || [])
    setTotalCount(localResults.length)

  } catch (error: any) {
    toast.error(error.message || "Error fetching data")
  } finally {
    setLoading(false)
  }
}


  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Enter supplier name to search");
      return;
    }
    setCurrentPage(1);
    setSearchQuery(searchTerm);
  };

  useEffect(() => {
    if (searchQuery) fetchDistributors();
  }, [searchQuery, currentPage]);


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const pageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, "...", totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  return (
    <DashboardLayout breadcrumbs={["Distributor", "Search", "Get Distributor List"]}>
      {/* 🔍 Search Bar */}
      <div className="bg-card rounded-lg border border-border p-4 max-w-sm mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Supplier Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
            Search
          </Button>
        </div>
      </div>

      {/* 📌 Results Section (only after search) */}
      {searchQuery && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium">Showing results for: <b>{searchQuery}</b></h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : distributors.length === 0 ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              No results found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20">
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributors.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.supplier_name}</TableCell>
                      <TableCell>{d.phone_number}</TableCell>
                      <TableCell>{d.email || "-"}</TableCell>
                      <TableCell>{d.address}</TableCell>
                      <TableCell>{d.remark || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 📌 Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 p-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>

                  {pageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2">...</span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={currentPage === p ? "default" : "outline"}
                        onClick={() => setCurrentPage(Number(p))}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default GetDistributors;
