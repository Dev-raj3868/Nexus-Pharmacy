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
import { CalendarIcon, Search, Trash2, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

interface SupplierInfo {
  id: string;
  supplier_id: string;
  supplier_name: string;
  requisition_date: Date;
  expected_date: Date;
  status: string;
}

interface ItemInfo {
  id: string;
  item_name: string;
  quantity: number;
  category: string;
  unit: string;
  unit_price: number;
  total_price: number;
  remark: string;
}

interface PaymentInfo {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
}

const steps = ["Supplier Information", "Item Information", "Payment Information"];

const CreatePurchaseOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Supplier Information
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [requisitionDate, setRequisitionDate] = useState<Date>();
  const [expectedDate, setExpectedDate] = useState<Date>();
  const [status, setStatus] = useState("Pending");
  const [supplierList, setSupplierList] = useState<SupplierInfo[]>([]);

  // Item Information
  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [itemRemark, setItemRemark] = useState("");
  const [itemList, setItemList] = useState<ItemInfo[]>([]);

  // Payment Information
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentList, setPaymentList] = useState<PaymentInfo[]>([]);

  // Existing distributors for dropdown
  const [distributors, setDistributors] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDistributors();
      fetchInventory();
    }
  }, [user]);

  const fetchDistributors = async () => {
    try {
      if (window.context?.getDistributors) {
        const data = await window.context.getDistributors({ userId: user?.id });
        setDistributors(data || []);
        return;
      }
    } catch (err) {
      console.error("Failed to fetch distributors via context:", err);
    }

  };
// 🔽 ONLY CHANGED SECTIONS ARE MARKED

// -------------------- INVENTORY FETCH --------------------
const fetchInventory = async () => {
  try {
    if (window.context?.getInventory) {
      // ✅ backend expects filters, not userId
      const data = await window.context.getInventory({});
      setInventory(data || []);
      return;
    }
  } catch (err) {
    console.error("Failed to fetch inventory via context:", err);
  }

  // ✅ fallback WITHOUT user_id (local app)

};

// -------------------- INVENTORY FILTER --------------------
const filteredInventory = inventory.filter((item) => {
  const search = itemSearch.toLowerCase();

  return (
    item.item_name?.toLowerCase().includes(search) ||
    item.id?.toLowerCase().includes(search)
  );
});


  const handleAddSupplier = () => {
    if (!supplierId || !supplierName || !requisitionDate || !expectedDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newSupplier: SupplierInfo = {
      id: crypto.randomUUID(),
      supplier_id: supplierId,
      supplier_name: supplierName,
      requisition_date: requisitionDate,
      expected_date: expectedDate,
      status: status,
    };

    setSupplierList([...supplierList, newSupplier]);
    setSupplierId("");
    setSupplierName("");
    setRequisitionDate(undefined);
    setExpectedDate(undefined);
    setStatus("Pending");
  };

  const handleRemoveSupplier = (id: string) => {
    setSupplierList(supplierList.filter((s) => s.id !== id));
  };

  const handleAddItem = () => {
    if (!itemSearch || !quantity || !category || !unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newItem: ItemInfo = {
      id: crypto.randomUUID(),
      item_name: itemSearch,
      quantity: parseInt(quantity),
      category: category,
      unit: unit,
      unit_price: parseFloat(unitPrice) || 0,
      total_price: parseFloat(totalPrice) || 0,
      remark: itemRemark,
    };

    setItemList([...itemList, newItem]);
    setItemSearch("");
    setQuantity("");
    setCategory("");
    setUnit("");
    setUnitPrice("");
    setTotalPrice("");
    setItemRemark("");
  };

  const handleRemoveItem = (id: string) => {
    setItemList(itemList.filter((i) => i.id !== id));
  };

  const handleAddPayment = () => {
    if (!paymentAmount || !paymentMethod || !paymentStatus) {
      toast.error("Please fill in all payment fields");
      return;
    }

    const newPayment: PaymentInfo = {
      id: crypto.randomUUID(),
      amount: parseFloat(paymentAmount),
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    };

    setPaymentList([...paymentList, newPayment]);
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentStatus("");
  };

  const handleRemovePayment = (id: string) => {
    setPaymentList(paymentList.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
  if (supplierList.length === 0) {
    toast.error("Please add at least one supplier");
    return;
  }

  if (itemList.length === 0) {
    toast.error("Please add at least one item");
    return;
  }

  setIsLoading(true);

  try {
    for (const supplier of supplierList) {
      const payload = {
        purchase_order_no: `PO-${Date.now()}`,
        supplier_name: supplier.supplier_name,
        supplier_id: supplier.supplier_id,
        order_date: format(supplier.requisition_date, "yyyy-MM-dd"),
        expected_date: format(supplier.expected_date, "yyyy-MM-dd"),
        status: supplier.status,

        total_amount: itemList.reduce(
          (sum, it) => sum + (it.total_price || 0),
          0
        ),

        // ✅ EVERYTHING GOES INTO data
        data: {
          items: itemList.map((it) => ({
            item_id: it.id,
            item_name: it.item_name,
            category: it.category,
            unit: it.unit,
            quantity: it.quantity,
            price: it.unit_price,
            gst: 0,
            total: it.total_price,
            remark: it.remark,
          })),

          payments: paymentList.map((p) => ({
            payment_id: p.id,
            amount: p.amount,
            payment_method: p.payment_method,
            payment_status: p.payment_status,
          })),
        },

        remark: "",
      };

      if (!window.context?.createPurchaseOrder) {
        throw new Error("createPurchaseOrder is not available");
      }

      await window.context.createPurchaseOrder(payload);
    }

    toast.success("Purchase order created successfully!");
    navigate("/dashboard");
  } catch (error: any) {
    toast.error(error.message || "Failed to create purchase order");
  } finally {
    setIsLoading(false);
  }
};

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "upcoming";
  };

  return (
    <DashboardLayout>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  getStepStatus(index) === "completed" && "text-primary",
                  getStepStatus(index) === "current" && "text-foreground",
                  getStepStatus(index) === "upcoming" && "text-muted-foreground"
                )}
                onClick={() => setCurrentStep(index)}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border-2",
                    getStepStatus(index) === "completed" &&
                    "bg-secondary border-secondary text-secondary-foreground",
                    getStepStatus(index) === "current" &&
                    "border-secondary bg-card",
                    getStepStatus(index) === "upcoming" &&
                    "border-muted-foreground bg-card"
                  )}
                >
                  {getStepStatus(index) === "completed" && (
                    <Check className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2",
                      index < currentStep ? "bg-secondary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Supplier Information</h3>
            <button
              onClick={handleAddSupplier}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">
                Supplier ID<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter supplier ID"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Supplier Name<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter supplier name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Requisition Date<span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !requisitionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {requisitionDate
                      ? format(requisitionDate, "dd-MM-yyyy")
                      : "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={requisitionDate}
                    onSelect={setRequisitionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Expected Date<span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDate
                      ? format(expectedDate, "dd-MM-yyyy")
                      : "dd-mm-yyyy"}
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
              <Label className="text-sm text-foreground">
                Status<span className="text-destructive">*</span>
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Supplier Table */}
          {supplierList.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Supplier Information
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Supplier ID</TableHead>
                    <TableHead className="text-xs uppercase">Supplier's Name</TableHead>
                    <TableHead className="text-xs uppercase">Requisition Date</TableHead>
                    <TableHead className="text-xs uppercase">Expected Date</TableHead>
                    <TableHead className="text-xs uppercase">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierList.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.supplier_id}</TableCell>
                      <TableCell>{supplier.supplier_name}</TableCell>
                      <TableCell>
                        {format(supplier.requisition_date, "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(supplier.expected_date, "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell>{supplier.status}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveSupplier(supplier.id)}
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

        {/* Item Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Item Information</h3>
            <button
              onClick={handleAddItem}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Label className="text-sm text-foreground">
                Item Name<span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search item..."
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  className="pl-9"
                />
              </div>
              {showItemDropdown && itemSearch && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-2 cursor-pointer hover:bg-muted text-foreground"
                      onClick={() => {
                        setItemSearch(item.item_name);
                        setCategory(item.category);
                        setUnit(item.unit);
                        setShowItemDropdown(false);
                      }}
                    >
                      {item.item_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Quantity<span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Category<span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Surgical">Surgical</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Unit<span className="text-destructive">*</span>
              </Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pcs">Pcs</SelectItem>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Strip">Strip</SelectItem>
                  <SelectItem value="Bottle">Bottle</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-foreground">Unit Price</Label>
              <Input
                type="number"
                placeholder="₹XXX"
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(e.target.value);
                  const total =
                    parseFloat(e.target.value) * parseInt(quantity || "0");
                  setTotalPrice(total.toString());
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">
                Total Price<span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="₹X,XXX"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">Remark</Label>
              <Input
                placeholder="Enter remark"
                value={itemRemark}
                onChange={(e) => setItemRemark(e.target.value)}
              />
            </div>
          </div>

          {/* Item Table */}
          {itemList.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Item Information
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Item Name</TableHead>
                    <TableHead className="text-xs uppercase">Quantity</TableHead>
                    <TableHead className="text-xs uppercase">Category</TableHead>
                    <TableHead className="text-xs uppercase">Unit</TableHead>
                    <TableHead className="text-xs uppercase">Unit Price</TableHead>
                    <TableHead className="text-xs uppercase">Total Price</TableHead>
                    <TableHead className="text-xs uppercase">Remark</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>₹{item.unit_price}</TableCell>
                      <TableCell>₹{item.total_price}</TableCell>
                      <TableCell>{item.remark}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
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

        {/* Payment Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Payment Information</h3>
            <button
              onClick={handleAddPayment}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">Amount</Label>
              <Input
                type="number"
                placeholder="₹XXX"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-foreground">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Table */}
          {paymentList.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Payment Information
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Amount</TableHead>
                    <TableHead className="text-xs uppercase">Payment Method</TableHead>
                    <TableHead className="text-xs uppercase">Payment Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentList.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>₹{payment.amount}</TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>{payment.payment_status}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemovePayment(payment.id)}
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
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatePurchaseOrder;
