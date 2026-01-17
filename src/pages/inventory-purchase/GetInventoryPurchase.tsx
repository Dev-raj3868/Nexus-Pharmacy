import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

const GetInventoryPurchase = () => {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("purchase_orders")
        .select("*, purchase_order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fromDate) {
        query = query.gte("expected_date", format(fromDate, "yyyy-MM-dd"));
      }
      if (toDate) {
        query = query.lte("expected_date", format(toDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      handleSearch();
    }
  }, [user]);

  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Inventory Purchase", "Get"]}>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Search Filters */}
        <div className="border border-border rounded-xl p-6 mb-6" style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)" }}>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-card",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {fromDate ? format(fromDate, "dd-MM-yyyy") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-card",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {toDate ? format(toDate, "dd-MM-yyyy") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Results Table */}
        {purchaseOrders.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="text-xs uppercase">Order ID</TableHead>
                  <TableHead className="text-xs uppercase">Supplier Name</TableHead>
                  <TableHead className="text-xs uppercase">Expected Date</TableHead>
                  <TableHead className="text-xs uppercase">Status</TableHead>
                  <TableHead className="text-xs uppercase">Items Count</TableHead>
                  <TableHead className="text-xs uppercase">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{order.supplier_name}</TableCell>
                    <TableCell>
                      {format(new Date(order.expected_date), "dd-MM-yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          order.status === "Pending" && "bg-yellow-100 text-yellow-800",
                          order.status === "Approved" && "bg-green-100 text-green-800",
                          order.status === "Completed" && "bg-blue-100 text-blue-800",
                          order.status === "Cancelled" && "bg-red-100 text-red-800"
                        )}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{order.purchase_order_items?.length || 0}</TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "dd-MM-yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {purchaseOrders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            No purchase orders found. Try adjusting your search filters.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GetInventoryPurchase;