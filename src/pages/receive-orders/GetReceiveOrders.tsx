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
import { Search, CalendarIcon, FileText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReceiveOrder {
  id: string;
  purchase_id: string;
  vendor_name: string;
  payment_status: string;
  created_at: string;
  user_id: string;
}

interface ReceiveOrderItem {
  id: string;
  item_name: string;
  received_quantity: number;
  unit: string;
  price_per_quantity: number | null;
  batch_no: string;
  gst: string | null;
  remark: string | null;
}

const GetReceiveOrders = () => {
  const { user } = useAuth();
  const [receiveId, setReceiveId] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [orders, setOrders] = useState<ReceiveOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 14;

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<ReceiveOrder | null>(null);
  const [orderItems, setOrderItems] = useState<ReceiveOrderItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = async () => {
    if (!user) return;
    setIsLoading(true);
    setHasSearched(true);

    let query = supabase
      .from("receive_orders")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (receiveId) {
      query = query.ilike("id", `%${receiveId}%`);
    }

    if (fromDate) {
      query = query.gte("created_at", format(fromDate, "yyyy-MM-dd"));
    }

    if (toDate) {
      query = query.lte("created_at", format(toDate, "yyyy-MM-dd") + "T23:59:59");
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

  const handleViewDetails = async (order: ReceiveOrder) => {
    setSelectedOrder(order);
    
    const { data, error } = await supabase
      .from("receive_order_items")
      .select("*")
      .eq("receive_order_id", order.id);

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
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="text-primary"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        {pages.map(page => (
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
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
    <DashboardLayout>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Search Filters */}
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 max-w-xs">
            <Label className="text-sm text-foreground mb-1 block">Receive ID</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Receive ID"
                value={receiveId}
                onChange={(e) => setReceiveId(e.target.value)}
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
                  {fromDate ? format(fromDate, "dd-MM-yyyy") : "(from) dd-mm-yyyy"}
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
                  {toDate ? format(toDate, "dd-MM-yyyy") : "(To) dd-mm-yyyy"}
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
              Receive Details
            </div>
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="text-xs uppercase text-primary">Receive ID</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Batch No</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Vendor Name</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Payment Status</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Created At</TableHead>
                  <TableHead className="text-xs uppercase text-primary">Created By</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No receive orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-sm">{order.purchase_id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-sm">{order.vendor_name}</TableCell>
                      <TableCell className="text-sm">{order.payment_status}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.created_at), "dd:MM")}
                      </TableCell>
                      <TableCell className="text-sm">{order.vendor_name}</TableCell>
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
              {/* Item Details Section */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Item Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Received ID</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Batch No</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.purchase_id.slice(0, 8)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Vendor Name</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.vendor_name}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Payment Status</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.payment_status}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created At</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {format(new Date(selectedOrder.created_at), "dd-MM-yyyy")}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created By</Label>
                    <div className="bg-muted rounded-lg px-4 py-2 mt-1">
                      {selectedOrder.vendor_name}
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
                        <TableHead className="text-xs uppercase">Item Name</TableHead>
                        <TableHead className="text-xs uppercase">Quantity</TableHead>
                        <TableHead className="text-xs uppercase">Unit</TableHead>
                        <TableHead className="text-xs uppercase">Price</TableHead>
                        <TableHead className="text-xs uppercase">Batch No</TableHead>
                        <TableHead className="text-xs uppercase">GST</TableHead>
                        <TableHead className="text-xs uppercase">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>{item.received_quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>₹ {item.price_per_quantity || 0}</TableCell>
                          <TableCell>{item.batch_no}</TableCell>
                          <TableCell>{item.gst || "-"}</TableCell>
                          <TableCell>{item.remark || "-"}</TableCell>
                        </TableRow>
                      ))}
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

export default GetReceiveOrders;
