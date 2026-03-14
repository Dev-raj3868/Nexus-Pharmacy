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
import { Trash2 } from "lucide-react";
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
  received_quantity: number;
  category: string;
  unit: string;
  remark: string;
}

const CreateInventoryReceive = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Order Details
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [deliveryStatus, setDeliveryStatus] = useState("Completed");
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);

  // Item Details
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [remark, setRemark] = useState("");
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
  const [excelLink, setExcelLink] = useState("");


  //mapping details for excel
  const [excelRows, setExcelRows] = useState<any[][]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);

  const [mapping, setMapping] = useState({
    item_id: "",
    item_name: "",
    received_quantity: "",
    category: "",
    unit: "",
    remark: "",
  });
  const [hasSavedMapping, setHasSavedMapping] = useState(false);

  const handleAddOrderDetail = () => {
    if (!purchaseOrderId || !vendorName) {
      toast.error("Please fill in Purchase Order ID and Vendor Name");
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
    setPurchaseOrderId("");
    setVendorName("");
    setPaymentStatus("Pending");
    setDeliveryStatus("Completed");
  };
  const handleImportExcel = async () => {
    // const excelLink = prompt("Paste Excel file link");

    if (!excelLink) return;

    try {
      const response = await fetch(excelLink);
      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      const parsedItems = rows
        .slice(2) // skip first two rows
        .filter((row) => row && row.length > 2) // remove empty rows
        .map((row) => ({
          id: crypto.randomUUID(),
          item_id: row[1] || `ITEM-${Date.now()}`,
          item_name: row[2],
          received_quantity: Number(row[3]),
          category: row[4] || "",
          unit: row[5] || "",
          remark: row[6] || "",
        }));

      setItemDetails((prev) => [...prev, ...parsedItems]);
      console.log("Parsed Items:", parsedItems);

      // setItemDetails((prev) => [...prev, ...parsedItems]);

      toast.success("Excel data imported successfully");
    } catch (err) {
      toast.error("Failed to import Excel file");
    }
  };
  const handleRemoveOrderDetail = (id: string) => {
    setOrderDetails(orderDetails.filter((d) => d.id !== id));
  };

  const handleAddItemDetail = () => {
    if (!itemName || !receivedQuantity) {
      toast.error("Please fill in Item Name and Received Quantity");
      return;
    }

    const newItem: ItemDetail = {
      id: crypto.randomUUID(),
      item_id: itemId || `ITEM-${Date.now()}`,
      item_name: itemName,
      received_quantity: parseInt(receivedQuantity),
      category: category,
      unit: unit,
      remark: remark,
    };

    setItemDetails([...itemDetails, newItem]);
    setItemId("");
    setItemName("");
    setReceivedQuantity("");
    setCategory("");
    setUnit("");
    setRemark("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setHasSavedMapping(false);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      if (!rows.length) {
        toast.error("Excel file empty");
        return;
      }

      const headers = rows[0].map(String);

      setExcelHeaders(headers);
      setExcelRows(rows);

      const saved = localStorage.getItem("inventoryExcelMapping");

      if (saved) {
        const savedMapping = JSON.parse(saved);

        const filteredMapping: any = {};

        Object.entries(savedMapping).forEach(([key, value]) => {
          if (headers.includes(value as string)) {
            filteredMapping[key] = value;
          }
        });

        if (Object.keys(filteredMapping).length > 0) {
          setMapping((prev) => ({
            ...prev,
            ...filteredMapping,
          }));

          setHasSavedMapping(true);
        }
      }

      setShowMapping(true);
    };

    reader.readAsArrayBuffer(file);
  };

  const applyMapping = () => {
    if (!mapping.item_name || !mapping.received_quantity) {
      toast.error("Item Name and Quantity mapping required");
      return;
    }

    const headerIndex: any = {};

    excelHeaders.forEach((h, i) => {
      headerIndex[h] = i;
    });

    const parsedItems = excelRows
      .slice(1)
      .filter((row) => row && row.length > 0)
      .map((row) => ({
        id: crypto.randomUUID(),
        item_id:
          row[headerIndex[mapping.item_id]] || `ITEM-${Date.now()}`,
        item_name: row[headerIndex[mapping.item_name]],
        received_quantity: Number(
          row[headerIndex[mapping.received_quantity]]
        ),
        category: row[headerIndex[mapping.category]] || "",
        unit: row[headerIndex[mapping.unit]] || "",
        remark: row[headerIndex[mapping.remark]] || "",
      }));

    setItemDetails((prev) => [...prev, ...parsedItems]);

    setShowMapping(false);

    toast.success("Excel imported successfully");
  };

  const saveMapping = () => {
    localStorage.setItem(
      "inventoryExcelMapping",
      JSON.stringify(mapping)
    );

    toast.success("Mapping saved for future imports");
  };

  useEffect(() => {
    const saved = localStorage.getItem("inventoryExcelMapping");

    if (saved) {
      setMapping(JSON.parse(saved));
    }
  }, []);

  const handleRemoveItemDetail = (id: string) => {
    setItemDetails(itemDetails.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (orderDetails.length === 0) {
      toast.error("Please add at least one order detail")
      return
    }

    if (itemDetails.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    setIsLoading(true)

    try {
      await window.context.createReceiveMaterial({
        orderDetails,   // names unchanged
        itemDetails
      })

      toast.success("Inventory receive order created successfully!")
      navigate("/dashboard/inventory-receive")
    } catch (error: any) {
      toast.error(error.message || "Failed to create inventory receive order")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Inventory Receive", "Create"]}>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Order Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Order Details</h3>
            <button
              onClick={handleAddOrderDetail}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">Purchase Order ID</Label>
              <Input
                placeholder="xxxxx"
                value={purchaseOrderId}
                onChange={(e) => setPurchaseOrderId(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Vendor Name<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Lorem"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
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

            <div>
              <Label className="text-sm text-foreground">Delivery Status</Label>
              <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Details Table */}
          {orderDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Purchase Order ID</TableHead>
                    <TableHead className="text-xs uppercase">Vendor Name</TableHead>
                    <TableHead className="text-xs uppercase">Payment Status</TableHead>
                    <TableHead className="text-xs uppercase">Delivery Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.purchase_order_id}</TableCell>
                      <TableCell>{detail.vendor_name}</TableCell>
                      <TableCell>{detail.payment_status}</TableCell>
                      <TableCell>{detail.delivery_status}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveOrderDetail(detail.id)}
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


            <Input
              placeholder="Paste Excel file link"
              value={excelLink}
              onChange={(e) => setExcelLink(e.target.value)}
            />

            <Button onClick={handleImportExcel}>
              Import Excel
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
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
                Received Quantity<span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="# xxxxxx"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(e.target.value)}
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
                    <TableHead className="text-xs uppercase">Received Quantity</TableHead>
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
                      <TableCell>{item.received_quantity}</TableCell>
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
      <Dialog open={showMapping} onOpenChange={setShowMapping}>
        <DialogContent className="max-w-lg">

          <DialogHeader>
            <DialogTitle>Map Excel Columns</DialogTitle>
          </DialogHeader>

          {hasSavedMapping && (
            <p className="text-sm text-muted-foreground">
              Saved mapping detected. Adjust if needed.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">

            <div>
              <Label>Item ID</Label>
              <Select
                value={mapping.item_id}
                onValueChange={(v) =>
                  setMapping({ ...mapping, item_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {excelHeaders.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Item Name *</Label>
              <Select
                value={mapping.item_name}
                onValueChange={(v) =>
                  setMapping({ ...mapping, item_name: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {excelHeaders.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Received Quantity *</Label>
              <Select
                value={mapping.received_quantity}
                onValueChange={(v) =>
                  setMapping({ ...mapping, received_quantity: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {excelHeaders.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={mapping.category}
                onValueChange={(v) =>
                  setMapping({ ...mapping, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {excelHeaders.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Unit</Label>
              <Select
                value={mapping.unit}
                onValueChange={(v) =>
                  setMapping({ ...mapping, unit: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {excelHeaders.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Remark</Label>
              <Select
                value={mapping.remark}
                onValueChange={(v) =>
                  setMapping({ ...mapping, remark: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {excelHeaders.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter className="mt-4 flex gap-2">

            <Button
              variant="outline"
              onClick={() => setShowMapping(false)}
            >
              Cancel
            </Button>

            <Button
              variant="secondary"
              onClick={saveMapping}
            >
              Save Mapping
            </Button>

            <Button onClick={applyMapping}>
              Import Data
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreateInventoryReceive;