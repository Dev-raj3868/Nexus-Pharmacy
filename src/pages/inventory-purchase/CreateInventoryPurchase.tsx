import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

interface PurchaseOrderDetail {
  id: string;
  expected_date: Date;
  supplier_name: string;
  payment_status: string;
}

interface ItemDetail {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  category: string;
  unit: string;
  remark: string;
}

const CreateInventoryPurchase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Purchase Order Details
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [supplierName, setSupplierName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState<PurchaseOrderDetail[]>([]);

  // Item Details
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [remark, setRemark] = useState("");
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);

  // Distributors for dropdown
  const [distributors, setDistributors] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDistributors();
    }
  }, [user]);

  const fetchDistributors = async () => {
    const { data } = await supabase
      .from("distributors")
      .select("*")
      .eq("user_id", user?.id);
    if (data) setDistributors(data);
  };

  const handleAddPurchaseOrderDetail = () => {
    if (!expectedDate || !supplierName) {
      toast.error("Please fill in Expected Date and Supplier Name");
      return;
    }

    const newDetail: PurchaseOrderDetail = {
      id: crypto.randomUUID(),
      expected_date: expectedDate,
      supplier_name: supplierName,
      payment_status: paymentStatus,
    };

    setPurchaseOrderDetails([...purchaseOrderDetails, newDetail]);
    setExpectedDate(undefined);
    setSupplierName("");
    setPaymentStatus("Pending");
  };

  const handleRemovePurchaseOrderDetail = (id: string) => {
    setPurchaseOrderDetails(purchaseOrderDetails.filter((d) => d.id !== id));
  };

  const handleAddItemDetail = () => {
    if (!itemName || !quantity) {
      toast.error("Please fill in Item Name and Quantity");
      return;
    }

    const newItem: ItemDetail = {
      id: crypto.randomUUID(),
      item_id: itemId || `ITEM-${Date.now()}`,
      item_name: itemName,
      quantity: parseInt(quantity),
      category: category,
      unit: unit,
      remark: remark,
    };

    setItemDetails([...itemDetails, newItem]);
    setItemId("");
    setItemName("");
    setQuantity("");
    setCategory("");
    setUnit("");
    setRemark("");
  };

  const handleRemoveItemDetail = (id: string) => {
    setItemDetails(itemDetails.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (purchaseOrderDetails.length === 0) {
      toast.error("Please add at least one purchase order detail");
      return;
    }

    if (itemDetails.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setIsLoading(true);

    try {
      for (const purchaseOrder of purchaseOrderDetails) {
        const { data: order, error: orderError } = await supabase
          .from("purchase_orders")
          .insert({
            user_id: user?.id,
            supplier_id: crypto.randomUUID(),
            supplier_name: purchaseOrder.supplier_name,
            requisition_date: format(new Date(), "yyyy-MM-dd"),
            expected_date: format(purchaseOrder.expected_date, "yyyy-MM-dd"),
            status: purchaseOrder.payment_status,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = itemDetails.map((item) => ({
          purchase_order_id: order.id,
          user_id: user?.id,
          item_name: item.item_name,
          quantity: item.quantity,
          category: item.category,
          unit: item.unit || "Unit",
          remark: item.remark,
        }));

        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      toast.success("Inventory purchase order created successfully!");
      navigate("/dashboard/inventory-purchase");
    } catch (error: any) {
      toast.error(error.message || "Failed to create inventory purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Inventory Purchase", "Create"]}>
      <div className="bg-card rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6 border-b border-border pb-3">
          Purchase Order Information
        </h2>

        {/* Purchase Order Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Purchase Order Details</h3>
            <button
              onClick={handleAddPurchaseOrderDetail}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">Expected Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {expectedDate ? format(expectedDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedDate}
                    onSelect={setExpectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm text-foreground">Supplier Name</Label>
              <Input
                placeholder="Lorem"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Payment Status<span className="text-destructive">*</span>
              </Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purchase Order Details Table */}
          {purchaseOrderDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Expected Date</TableHead>
                    <TableHead className="text-xs uppercase">Supplier Name</TableHead>
                    <TableHead className="text-xs uppercase">Payment Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrderDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{format(detail.expected_date, "dd-MM-yyyy")}</TableCell>
                      <TableCell>{detail.supplier_name}</TableCell>
                      <TableCell>{detail.payment_status}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemovePurchaseOrderDetail(detail.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Item Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Item Details</h3>
            <button
              onClick={handleAddItemDetail}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">Item ID</Label>
              <Input
                placeholder="xxxxxx"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="bg-muted"
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Item Name<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Lorem"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="bg-muted"
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Quantity<span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="# xxxxxx"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-muted"
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Piece">Piece</SelectItem>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Bottle">Bottle</SelectItem>
                  <SelectItem value="Strip">Strip</SelectItem>
                  <SelectItem value="Pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-foreground">Remark</Label>
              <Input
                placeholder="Lorem"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="bg-muted"
              />
            </div>
          </div>

          {/* Item Details Table */}
          {itemDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Item ID</TableHead>
                    <TableHead className="text-xs uppercase">Item Name</TableHead>
                    <TableHead className="text-xs uppercase">Quantity</TableHead>
                    <TableHead className="text-xs uppercase">Category</TableHead>
                    <TableHead className="text-xs uppercase">Unit</TableHead>
                    <TableHead className="text-xs uppercase">Remark</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemDetails.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_id}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.remark}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveItemDetail(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateInventoryPurchase;