import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Trash2, FileSpreadsheet, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface OrderDetail {
  id: string;
  purchase_order_id: string;
  vendor_name: string;
  payment_status: string;
  delivery_status: string;
}

interface ItemDetail {
  id: string;
  item_id: string;
  item_name: string;
  category: string;
  unit: string;
  received_quantity: number;
  purchase_rate: number;
  is_batch: boolean;
  batch_id?: string;
  mrp?: number;
  expiry_date?: string;
  supplier_name?: string;
  received_on?: string;
  remark?: string;
}

const CreateInventoryReceive = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Order Details States
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [deliveryStatus, setDeliveryStatus] = useState("Completed");
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);

  // Item Details Common States
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [remark, setRemark] = useState("");
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);

  // Batch Specific States
  const [isBatch, setIsBatch] = useState("No");
  const [batchId, setBatchId] = useState("");
  const [mrp, setMrp] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [receivedOn, setReceivedOn] = useState("");

  // Excel Mapping States
  const [excelLink, setExcelLink] = useState("");
  const [excelRows, setExcelRows] = useState<any[][]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [hasSavedMapping, setHasSavedMapping] = useState(false);
  const [mapping, setMapping] = useState({
    item_id: "",
    item_name: "",
    received_quantity: "",
    purchase_rate: "",
    category: "",
    unit: "",
    remark: "",
    is_batch: "",
    batch_id: "",
    mrp: "",
    supplier_name: "",
    expiry_date: "",
    received_on: ""
  });

  // --- Functions ---

  const handleAddOrderDetail = () => {
    if (!purchaseOrderId || !vendorName) {
      toast.error("Fill in Purchase Order ID and Vendor Name");
      return;
    }
    const newDetail: OrderDetail = {
      id: crypto.randomUUID(),
      purchase_order_id: purchaseOrderId,
      vendor_name: vendorName,
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
    };
    setOrderDetails([...orderDetails, newDetail]);
    setPurchaseOrderId(""); setVendorName("");
  };

  const handleRemoveOrderDetail = (id: string) => {
    setOrderDetails(orderDetails.filter((d) => d.id !== id));
  };

  const resetItemForm = () => {
    setItemId(""); setItemName(""); setReceivedQuantity("");
    setPurchaseRate(""); setCategory(""); setUnit(""); setRemark("");
    setIsBatch("No"); setBatchId(""); setMrp("");
    setSupplierName(""); setExpiryDate(""); setReceivedOn("");
  };

  const handleAddItem = () => {
    if (!itemName || !receivedQuantity || !purchaseRate) {
      toast.error("Item Name, Quantity, and Purchase Rate are required");
      return;
    }

    if (isBatch === "Yes" && (!batchId || !expiryDate || !mrp)) {
      toast.error("Batch ID, Expiry Date, and MRP are required for batch tracking");
      return;
    }

    const newItem: ItemDetail = {
      id: crypto.randomUUID(),
      item_id: itemId || `ITM-${Date.now()}`,
      item_name: itemName,
      category,
      unit,
      received_quantity: Number(receivedQuantity),
      purchase_rate: Number(purchaseRate),
      is_batch: isBatch === "Yes",
      batch_id: isBatch === "Yes" ? batchId : "",
      mrp: isBatch === "Yes" ? Number(mrp) : 0,
      expiry_date: isBatch === "Yes" ? expiryDate : "",
      supplier_name: isBatch === "Yes" ? supplierName : "",
      received_on: isBatch === "Yes" ? receivedOn : "",
      remark
    };

    setItemDetails([...itemDetails, newItem]);
    resetItemForm();
    toast.success(`${itemName} added`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      if (!rows.length) return toast.error("Excel file empty");
      
      setExcelHeaders(rows[0].map(String));
      setExcelRows(rows);
      setShowMapping(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const applyMapping = () => {
    if (!mapping.item_name || !mapping.received_quantity) {
      toast.error("Minimum mapping (Name & Qty) required");
      return;
    }
    const hIdx: any = {};
    excelHeaders.forEach((h, i) => hIdx[h] = i);

    const parsedItems = excelRows.slice(1).filter(r => r.length > 0).map(row => {
      const bVal = String(row[hIdx[mapping.is_batch]] || "").toLowerCase();
      const isB = ["yes", "true", "1"].includes(bVal);
      return {
        id: crypto.randomUUID(),
        item_id: String(row[hIdx[mapping.item_id]] || `ITM-${Date.now()}`),
        item_name: String(row[hIdx[mapping.item_name]]),
        received_quantity: Number(row[hIdx[mapping.received_quantity]]),
        purchase_rate: Number(row[hIdx[mapping.purchase_rate]] || 0),
        category: String(row[hIdx[mapping.category]] || ""),
        unit: String(row[hIdx[mapping.unit]] || ""),
        is_batch: isB,
        batch_id: isB ? String(row[hIdx[mapping.batch_id]] || "") : "",
        mrp: isB ? Number(row[hIdx[mapping.mrp]] || 0) : 0,
        expiry_date: isB ? String(row[hIdx[mapping.expiry_date]] || "") : "",
        supplier_name: isB ? String(row[hIdx[mapping.supplier_name]] || "") : "",
        received_on: isB ? String(row[hIdx[mapping.received_on]] || "") : "",
        remark: String(row[hIdx[mapping.remark]] || ""),
      };
    });
    setItemDetails([...itemDetails, ...parsedItems]);
    setShowMapping(false);
    toast.success("Excel data merged");
  };

  const saveMapping = () => {
    localStorage.setItem("inventoryExcelMapping", JSON.stringify(mapping));
    toast.success("Default mapping saved");
  };

  useEffect(() => {
    const saved = localStorage.getItem("inventoryExcelMapping");
    if (saved) setMapping(JSON.parse(saved));
  }, []);

  const handleSave = async () => {
    if (!itemDetails.length) return toast.error("Add at least one item");
    setIsLoading(true);
    try {
      // Integration point for your backend/Supabase
      await (window as any).context?.createReceiveMaterial({ orderDetails, itemDetails });
      toast.success("Inventory Receive Created!");
      navigate("/dashboard/inventory-receive");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Inventory Receive", "Create"]}>
      <div className="bg-card rounded-xl shadow-card p-6 space-y-8 max-w-[1400px] mx-auto">
        
        {/* SECTION 1: ORDER DETAILS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-lg text-foreground">Order Details</h3>
            <Button variant="ghost" size="sm" onClick={handleAddOrderDetail} className="text-primary hover:bg-primary/10">
              <PlusCircle className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
            <div><Label>PO ID</Label><Input placeholder="PO-XXXX" value={purchaseOrderId} onChange={e => setPurchaseOrderId(e.target.value)} /></div>
            <div><Label>Vendor Name*</Label><Input placeholder="Vendor Name" value={vendorName} onChange={e => setVendorName(e.target.value)} /></div>
            <div><Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Partial">Partial</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Delivery Status</Label>
              <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Transit">In Transit</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          {orderDetails.length > 0 && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/20"><TableRow>
                  <TableHead>PO ID</TableHead><TableHead>Vendor</TableHead><TableHead>Payment</TableHead><TableHead>Delivery</TableHead><TableHead className="w-10"></TableHead>
                </TableRow></TableHeader>
                <TableBody>{orderDetails.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.purchase_order_id}</TableCell><TableCell>{d.vendor_name}</TableCell><TableCell>{d.payment_status}</TableCell><TableCell>{d.delivery_status}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveOrderDetail(d.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </div>
          )}
        </section>

        {/* SECTION 2: ITEM ENTRY */}
        <section className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="font-bold text-lg text-foreground">Item Details</h3>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="excel-upload" />
                <label htmlFor="excel-upload" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700 transition-colors text-sm font-medium">
                  <FileSpreadsheet className="w-4 h-4" /> Import Excel
                </label>
              </div>
              <Input placeholder="Excel Link..." value={excelLink} onChange={e => setExcelLink(e.target.value)} className="w-48 h-9" />
            </div>
          </div>

          <div className="space-y-6">
            {/* ROW 1: Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Item ID</Label><Input value={itemId} onChange={e => setItemId(e.target.value)} className="bg-muted" /></div>
              <div className="space-y-2"><Label>Item Name*</Label><Input placeholder="Enter Name" value={itemName} onChange={e => setItemName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Medicine">Medicine</SelectItem><SelectItem value="Equipment">Equipment</SelectItem><SelectItem value="Supplies">Supplies</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Piece">Piece</SelectItem><SelectItem value="Strip">Strip</SelectItem><SelectItem value="Box">Box</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            {/* ROW 2: The Toggle Logic (Image 1 vs Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-primary font-bold">Is Batch?*</Label>
                <Select value={isBatch} onValueChange={setIsBatch}>
                  <SelectTrigger className="border-primary ring-offset-background focus:ring-primary"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                </Select>
              </div>

              {isBatch === "No" ? (
                <>
                  <div className="space-y-2"><Label>Stock Quantity*</Label><Input type="number" value={receivedQuantity} onChange={e => setReceivedQuantity(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Purchase Rate*</Label><Input type="number" value={purchaseRate} onChange={e => setPurchaseRate(e.target.value)} /></div>
                  <Button onClick={handleAddItem} className="w-full bg-primary hover:bg-primary/90">Add Item</Button>
                </>
              ) : (
                <>
                  <div className="space-y-2"><Label>Batch ID*</Label><Input placeholder="Batch #" value={batchId} onChange={e => setBatchId(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Quantity*</Label><Input type="number" value={receivedQuantity} onChange={e => setReceivedQuantity(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Expiry Date*</Label><Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
                </>
              )}
            </div>

            {/* ROW 3: Extra Fields for Batch Mode (Image 2 only) */}
            {isBatch === "Yes" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-primary/5 p-4 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2"><Label>Purchase Rate*</Label><Input type="number" value={purchaseRate} onChange={e => setPurchaseRate(e.target.value)} /></div>
                <div className="space-y-2"><Label>MRP*</Label><Input type="number" value={mrp} onChange={e => setMrp(e.target.value)} /></div>
                <div className="space-y-2"><Label>Supplier Name</Label><Input placeholder="Supplier" value={supplierName} onChange={e => setSupplierName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Received On</Label><Input type="date" value={receivedOn} onChange={e => setReceivedOn(e.target.value)} /></div>
                <Button onClick={handleAddItem} className="w-full bg-primary">Add Batch Item</Button>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: ITEMS TABLE */}
        <section className="pt-8 border-t">
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/80">
                <TableRow>
                  <TableHead>Item Details</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemDetails.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No items added yet.</TableCell></TableRow>
                ) : (
                  itemDetails.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-bold text-foreground">{item.item_name}</div>
                        <div className="text-[10px] uppercase text-muted-foreground">{item.item_id} | {item.category}</div>
                      </TableCell>
                      <TableCell>
                        {item.is_batch ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">BATCH: {item.batch_id}</span>
                            <span className="text-[10px] text-destructive mt-1">Exp: {item.expiry_date}</span>
                          </div>
                        ) : <span className="text-xs text-muted-foreground italic">Standard Stock</span>}
                      </TableCell>
                      <TableCell><div className="font-semibold">{item.received_quantity} {item.unit}</div></TableCell>
                      <TableCell>
                        <div className="text-xs">Cost: ₹{item.purchase_rate}</div>
                        {item.is_batch && <div className="text-xs font-bold text-primary">MRP: ₹{item.mrp}</div>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setItemDetails(itemDetails.filter(i => i.id !== item.id))}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-8">
            <Button onClick={handleSave} disabled={isLoading} size="lg" className="min-w-[200px] shadow-lg">
              {isLoading ? "Saving Entry..." : "Finalize Inventory Receive"}
            </Button>
          </div>
        </section>
      </div>

      {/* EXCEL MAPPING DIALOG */}
      <Dialog open={showMapping} onOpenChange={setShowMapping}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader><DialogTitle className="text-xl">Map Excel Columns</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 overflow-y-auto pr-2">
            {Object.keys(mapping).map((key) => (
              <div key={key} className="space-y-1">
                <Label className="capitalize text-xs font-semibold">{key.replace('_', ' ')}</Label>
                <Select value={(mapping as any)[key]} onValueChange={v => setMapping({...mapping, [key]: v})}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Choose Header" /></SelectTrigger>
                  <SelectContent>{excelHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" onClick={() => setShowMapping(false)}>Cancel</Button>
            <Button variant="secondary" onClick={saveMapping}>Set as Default</Button>
            <Button onClick={applyMapping} className="bg-green-600 hover:bg-green-700">Apply Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreateInventoryReceive;