import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, FileText, X, Pencil, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  requisition_date: string;
  expected_date: string;
  status: string;
  created_at: string;
}

interface PurchaseOrderItem {
  id: string;
  item_name: string;
  quantity: number;
  category: string | null;
  unit_price: number | null;
  unit: string;
  total_price: number | null;
  remark: string | null;
}

interface PurchaseOrderPayment {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
}

const GetPurchaseOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [purchaseId, setPurchaseId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [orderPayments, setOrderPayments] = useState<PurchaseOrderPayment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSearch = async () => {
    if (!user) return;
    setLoading(true);
    setSearched(true);
    try {
      const filters: any = {};
      if (purchaseId) filters.purchase_order_no = purchaseId;
      if (vendorName) filters.supplier_name = vendorName;
      if (fromDate) filters.fromDate = format(fromDate, "yyyy-MM-dd");
      if (toDate) filters.toDate = format(toDate, "yyyy-MM-dd");

      if (window.context?.getPurchaseOrders) {
        const rows = await window.context.getPurchaseOrders(filters);
        console.log("getPurchaseOrders result:", rows);
        const mapped = (rows || []).map((r: any) => ({
          id: r.id,
          supplier_id: r.supplier_id || r.supplierId || r.purchase_order_no || "",
          supplier_name: r.supplier_name || r.supplierName || r.supplier || "",
          requisition_date: r.order_date || r.requisition_date || r.data?.order_date || r.data?.requisition_date || new Date().toISOString(),
          expected_date: r.expected_date || r.data?.expected_date || "",
          status: r.status || "",
          created_at: r.created_at || r.createdAt || new Date().toISOString(),
          raw: r,
        }));
        setOrders(mapped);
        setCurrentPage(1);
      } else {
        // fallback to supabase if context not available
        let query = supabase
          .from("purchase_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (purchaseId) query = query.ilike("supplier_id", `%${purchaseId}%`);
        if (vendorName) query = query.ilike("supplier_name", `%${vendorName}%`);
        if (fromDate) query = query.gte("requisition_date", format(fromDate, "yyyy-MM-dd"));
        if (toDate) query = query.lte("requisition_date", format(toDate, "yyyy-MM-dd"));

        const { data, error } = await query;
        if (error) {
          toast({ title: "Error", description: "Failed to fetch purchase orders", variant: "destructive" });
        } else {
          setOrders(data || []);
          setCurrentPage(1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch purchase orders:", err);
      toast({ title: "Error", description: "Failed to fetch purchase orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setSaved(false);
    try {
      if (window.context?.getPurchaseOrderById) {
        const res = await window.context.getPurchaseOrderById(order.id);
        console.log("getPurchaseOrderById result:", res);
        // res.data should be parsed by backend; it may contain `items` or `data.items` or `data.productDetails`
const raw = res

// 🔥 normalize deeply
const normalizedData =
  raw?.data?.data ||   // <-- THIS FIX
  raw?.data ||
  {}

const items =
  normalizedData.items ||
  raw?.items ||
  []

const payments =
  normalizedData.payments ||
  raw?.payments ||
  []

setOrderItems(items)
setOrderPayments(payments)

        // normalize items to PurchaseOrderItem shape
        const normItems = (items || []).map((it: any, idx: number) => ({
          id: it.id || it.item_id || it.itemId || `i-${idx}`,
          item_name: it.item_name || it.itemName || it.name || "",
          quantity: Number(it.quantity || it.qty || it.receivedQty || it.received_quantity || 0),
          category: it.category || null,
          unit_price: Number(it.unit_price || it.unitPrice || it.price || it.rate || 0),
          unit: it.unit || "",
          total_price: Number(it.total || it.total_price || it.totalPrice || 0),
          remark: it.remark || it.notes || null,
        }));

        const normPayments = (payments || []).map((p: any, idx: number) => ({
          id: p.id || `pay-${idx}`,
          amount: Number(p.amount || p.value || 0),
          payment_method: p.payment_method || p.method || "",
          payment_status: p.payment_status || p.status || "",
        }));

        setOrderItems(normItems);
        setOrderPayments(normPayments);
        setIsModalOpen(true);
      } else {
        // fallback: clear
        setOrderItems([]);
        setOrderPayments([]);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load purchase order details:", err);
      setOrderItems([]);
      setOrderPayments([]);
      setIsModalOpen(true);
    }
  };

  const handleSave = () => {
    setSaved(true);
    toast({
      title: "Success",
      description: "Changes saved successfully",
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const totalAmount = orderPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout breadcrumbs={["Purchase Orders", "Get"]}>
      {/* Search Form */}
      <div className="bg-card rounded-xl shadow-card p-6 mb-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Purchase ID"
              value={purchaseId}
              onChange={(e) => setPurchaseId(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Vendor Name"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "dd-MM-yyyy") : "(from) dd-mm-yyyy"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "dd-MM-yyyy") : "(To) dd-mm-yyyy"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
        <div className="flex justify-end">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      {searched && (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <span className="font-semibold text-foreground">Purchase Order Details</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#e8f5e9]">
                <TableHead className="text-foreground font-semibold">SUPPLIER ID</TableHead>
                <TableHead className="text-foreground font-semibold">SUPPLIER NAME</TableHead>
                <TableHead className="text-foreground font-semibold">REQUISITION DATE</TableHead>
                <TableHead className="text-foreground font-semibold">EXPECTED DATE</TableHead>
                <TableHead className="text-foreground font-semibold">PAYMENT STATUS</TableHead>
                <TableHead className="text-foreground font-semibold">STATUS</TableHead>
                <TableHead className="text-foreground font-semibold">AMOUNT</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.supplier_id}</TableCell>
                    <TableCell>{order.supplier_name}</TableCell>
                    <TableCell>{format(new Date(order.requisition_date), "dd-MM-yy")}</TableCell>
                    <TableCell>{format(new Date(order.expected_date), "dd-MM-yy")}</TableCell>
                    <TableCell>
  {orderPayments.length
    ? orderPayments[0]?.payment_status
    : "Pending"}
</TableCell>

                    <TableCell className="text-success font-medium">
                      {order.status}
                    </TableCell>
                    <TableCell>
  ₹ {orderPayments.reduce((s, p) => s + Number(p.amount), 0)}
</TableCell>

                    <TableCell>
                      <button
                        onClick={() => handleViewOrder(order)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {totalPages > 3 && (
                    <>
                      <PaginationItem>
                        <span className="px-2">...</span>
                      </PaginationItem>
                      {Array.from({ length: 3 }, (_, i) => totalPages - 2 + i).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              # {selectedOrder?.supplier_id}
            </DialogTitle>
            <button onClick={() => setIsModalOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </DialogHeader>

          <div ref={printRef} className="space-y-6 p-4">
            {/* Supplier Details */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <span className="font-semibold">Supplier Details</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Supplier Information</span>
                  <button className="flex items-center gap-1 text-primary text-sm">
                    Edit <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#e8f5e9]">
                      <TableHead>SUPPLIER ID</TableHead>
                      <TableHead>SUPPLIER'S NAME</TableHead>
                      <TableHead>REQUISITION DATE</TableHead>
                      <TableHead>EXPECTED DATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedOrder?.supplier_id}</TableCell>
                      <TableCell>{selectedOrder?.supplier_name}</TableCell>
                      <TableCell>
                        {selectedOrder && format(new Date(selectedOrder.requisition_date), "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell>
                        {selectedOrder && format(new Date(selectedOrder.expected_date), "dd-MM-yyyy")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Item Details */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <span className="font-semibold">Item Details</span>
              </div>
              <div className="p-4">
                <span className="font-medium mb-2 block">Item Information</span>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#e8f5e9]">
                      <TableHead>ITEM NAME</TableHead>
                      <TableHead>QUANTITY</TableHead>
                      <TableHead>CATEGORY</TableHead>
                      <TableHead>UNIT PRICE</TableHead>
                      <TableHead>UNIT</TableHead>
                      <TableHead>TOTAL PRICE</TableHead>
                      <TableHead>REMARK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.category || "-"}</TableCell>
                        <TableCell>₹ {item.unit_price || 0}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>₹ {item.total_price || 0}</TableCell>
                        <TableCell>{item.remark || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {orderItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <span className="font-semibold">Payment Details</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Payment Information</span>
                  <button className="flex items-center gap-1 text-primary text-sm">
                    Edit <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#e8f5e9]">
                      <TableHead>AMOUNT</TableHead>
                      <TableHead>PAYMENT METHOD</TableHead>
                      <TableHead>PAYMENT STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>₹ {payment.amount}</TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>{payment.payment_status}</TableCell>
                      </TableRow>
                    ))}
                    {orderPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No payments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant="default" onClick={() => handlePrint()}>
                Print Preview
              </Button>
              <Button variant="outline" className="text-primary border-primary" onClick={() => handlePrint()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <Button
              onClick={handleSave}
              className={saved ? "bg-success hover:bg-success/90" : ""}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GetPurchaseOrders;
