import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface IssueOrder {
  id: string;
  employee_type: string;
  employee_name: string;
  issue_date: string;
  remark: string | null;
  created_at: string;
  user_id: string;
}

interface IssueOrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  remark: string | null;
}

const GetIssueOrders = () => {
  const { user } = useAuth();
  const [issueId, setIssueId] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [orders, setOrders] = useState<IssueOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 14;

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<IssueOrder | null>(null);
  const [orderItems, setOrderItems] = useState<IssueOrderItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = async () => {
    if (!user) return;
    setIsLoading(true);
    setHasSearched(true);

    let query = supabase
      .from("issue_orders")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (issueId) {
      query = query.ilike("id", `%${issueId}%`);
    }

    if (fromDate) {
      query = query.gte("issue_date", format(fromDate, "yyyy-MM-dd"));
    }

    if (toDate) {
      query = query.lte("issue_date", format(toDate, "yyyy-MM-dd"));
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (!error && data) {
      setOrders(data);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }

    setIsLoading(false);
  };

  const handleViewDetails = async (order: IssueOrder) => {
    setSelectedOrder(order);

    const { data, error } = await supabase
      .from("issue_order_items")
      .select("*")
      .eq("issue_order_id", order.id);

    if (!error && data) {
      setOrderItems(data);
    }

    setIsDetailOpen(true);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-end gap-2 mt-4 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="text-primary"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className={currentPage === page ? "bg-primary" : ""}
          >
            {page}
          </Button>
        ))}

        {end < totalPages && (
          <>
            <span className="text-muted-foreground">...</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="text-primary"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  useEffect(() => {
    if (hasSearched) {
      handleSearch();
    }
  }, [currentPage]);

  return (
    <DashboardLayout breadcrumbs={["Inventory Management", "Issue Order", "Search"]}>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Search Filters */}
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 max-w-xs">
            <Label className="text-sm text-foreground mb-1 block">Issue ID</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Issue ID"
                value={issueId}
                onChange={(e) => setIssueId(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <Label className="text-sm text-foreground mb-1 block">From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 max-w-xs">
            <Label className="text-sm text-foreground mb-1 block">To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSearch} disabled={isLoading} className="bg-primary">
            Search
          </Button>
        </div>

        {/* Results Table */}
        {hasSearched && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
              Issue Order Details
            </div>
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="text-xs uppercase text-primary">Issue ID</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Employee Type</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Employee Name</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Issue Date</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Created At</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Remark</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No issue orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-sm">{order.employee_type}</TableCell>
                      <TableCell className="text-sm">{order.employee_name}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.issue_date), "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.created_at), "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">{order.remark || "-"}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary hover:text-primary/80"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {orders.length > 0 && renderPagination()}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              # {selectedOrder?.id.slice(0, 10).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Details Section */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Issue Order Details</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Issue ID</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Employee Type</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.employee_type}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Employee Name</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.employee_name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Issue Date</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {format(new Date(selectedOrder.issue_date), "dd-MM-yyyy")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Created At</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {format(new Date(selectedOrder.created_at), "dd-MM-yyyy HH:mm")}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Remark</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.remark || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Information Table */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Item Details</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                    Item Information
                  </div>
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow>
                        <TableHead className="text-xs uppercase">Item ID</TableHead>
                        <TableHead className="text-xs uppercase">Item Name</TableHead>
                        <TableHead className="text-xs uppercase">Quantity</TableHead>
                        <TableHead className="text-xs uppercase">Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.item_id}</TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.remark || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {orderItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GetIssueOrders;