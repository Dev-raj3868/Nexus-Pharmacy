import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const CustomerList = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const nameFilter = searchParams.get("name") || "";
  const phoneFilter = searchParams.get("phone") || "";

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, age, gender, created_at", { count: "exact" });

      if (nameFilter) {
        query = query.or(`first_name.ilike.%${nameFilter}%,last_name.ilike.%${nameFilter}%`);
      }
      if (phoneFilter) {
        query = query.ilike("phone", `%${phoneFilter}%`);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching customers:", error);
      } else {
        setCustomers(data || []);
        setTotalCount(count || 0);
      }
      
      setLoading(false);
    };

    fetchCustomers();
  }, [user, nameFilter, phoneFilter, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      items.push(
        <PaginationItem key="ellipsis">
          <span className="px-3">...</span>
        </PaginationItem>
      );
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <DashboardLayout breadcrumbs={["Customer", "Search", "Get Customer List"]}>
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-foreground">Customer Details</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Phone Number</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Age</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Gender</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">Created At</TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="text-sm">
                        {customer.first_name} {customer.last_name}
                      </TableCell>
                      <TableCell className="text-sm">{customer.phone}</TableCell>
                      <TableCell className="text-sm">{customer.age || "—"}</TableCell>
                      <TableCell className="text-sm">{customer.gender || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(customer.created_at), "dd:MM")}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dashboard/customers/${customer.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View Profile
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-end p-4 border-t border-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerList;
