import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

const GetInventoryReceive = () => {
  const { user } = useAuth();
  const [vendorName, setVendorName] = useState("");
  const [receiveOrderId, setReceiveOrderId] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [receiveOrders, setReceiveOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true)

    try {
      const data = await window.context.getReceiveMaterials({
        vendorName,
        purchaseId: receiveOrderId,
        fromDate: fromDate?.getTime(),
        toDate: toDate?.getTime(),
      })

      setReceiveOrders(data || [])
    } catch (error) {
      console.error("Error fetching receive materials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      handleSearch();
    }
  }, [user]);

  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Inventory Receive", "Get"]}>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Search Filters */}
        <div className="border border-border rounded-xl p-6 mb-6" style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)" }}>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Vendor Name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Receive Order ID"
                  value={receiveOrderId}
                  onChange={(e) => setReceiveOrderId(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
            </div>

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
                    {fromDate ? format(fromDate, "dd-MM-yyyy") : "16-01-2026"}
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
                    {toDate ? format(toDate, "dd-MM-yyyy") : "16-01-2026"}
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
        {receiveOrders.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="text-xs uppercase">Order ID</TableHead>
                  <TableHead className="text-xs uppercase">Vendor Name</TableHead>
                  <TableHead className="text-xs uppercase">Purchase ID</TableHead>
                  <TableHead className="text-xs uppercase">Payment Status</TableHead>
                  <TableHead className="text-xs uppercase">Delivery Status</TableHead>
                  <TableHead className="text-xs uppercase">Items Count</TableHead>
                  <TableHead className="text-xs uppercase">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiveOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{order.vendorName}</TableCell>
                    <TableCell>{order.purchaseId}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          order.paymentStatus === "Pending" && "bg-yellow-100 text-yellow-800",
                          order.paymentStatus === "Paid" && "bg-green-100 text-green-800",
                          order.paymentStatus === "Partial" && "bg-orange-100 text-orange-800"
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          order.deliveryStatus === "Pending" && "bg-yellow-100 text-yellow-800",
                          order.deliveryStatus === "Completed" && "bg-green-100 text-green-800",
                          order.deliveryStatus === "In Transit" && "bg-blue-100 text-blue-800"
                        )}
                      >
                        {order.deliveryStatus}
                      </span>
                    </TableCell>

                    <TableCell>{order.data.itemDetails.length}</TableCell>

                    <TableCell>
                      {format(new Date(order.createdAt), "dd-MM-yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {receiveOrders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            No receive orders found. Try adjusting your search filters.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GetInventoryReceive;