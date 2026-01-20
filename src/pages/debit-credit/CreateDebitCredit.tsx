import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";

interface ProductDetail {
  id: string;
  noteId: string;
  noteType: string;
  issueDate: string;
  purchaseOrderId: string;
  reason: string;
  receivedId: string;
  total: string;
  vendorName: string;
}

interface ItemDetail {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  price: string;
  batchNo: string;
  gst: string;
  reason: string;
}

const CreateDebitCredit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Purchase Details form
  const [noteId, setNoteId] = useState("");
  const [noteType, setNoteType] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [receivedId, setReceivedId] = useState("");
  const [total, setTotal] = useState("");
  const [vendorName, setVendorName] = useState("");

  // Product Details table
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);

  // Item Details form
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemBatchNo, setItemBatchNo] = useState("");
  const [itemGst, setItemGst] = useState("");
  const [itemReason, setItemReason] = useState("");

  // Item Details table
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProductDetail = () => {
    if (!noteId || !noteType) {
      toast({
        title: "Error",
        description: "Note ID and Note Type are required",
        variant: "destructive",
      });
      return;
    }

    const newProduct: ProductDetail = {
      id: crypto.randomUUID(),
      noteId,
      noteType,
      issueDate,
      purchaseOrderId,
      reason,
      receivedId,
      total,
      vendorName,
    };

    setProductDetails([...productDetails, newProduct]);
    
    // Clear form
    setNoteId("");
    setNoteType("");
    setIssueDate("");
    setPurchaseOrderId("");
    setReason("");
    setReceivedId("");
    setTotal("");
    setVendorName("");
  };

  const removeProductDetail = (id: string) => {
    setProductDetails(productDetails.filter((p) => p.id !== id));
  };

  const addItemDetail = () => {
    if (!itemName || !itemQuantity || !itemUnit) {
      toast({
        title: "Error",
        description: "Name, Quantity, and Unit are required",
        variant: "destructive",
      });
      return;
    }

    const newItem: ItemDetail = {
      id: crypto.randomUUID(),
      name: itemName,
      quantity: itemQuantity,
      unit: itemUnit,
      price: itemPrice,
      batchNo: itemBatchNo,
      gst: itemGst,
      reason: itemReason,
    };

    setItemDetails([...itemDetails, newItem]);

    // Clear form
    setItemName("");
    setItemQuantity("");
    setItemUnit("");
    setItemPrice("");
    setItemBatchNo("");
    setItemGst("");
    setItemReason("");
  };

  const removeItemDetail = (id: string) => {
    setItemDetails(itemDetails.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    if (productDetails.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product detail",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create debit credit notes from product details
     for (const product of productDetails) {
  await window.context.createCreditDebitNote({
    note_id: product.noteId,
    note_type: product.noteType,
    issue_date: product.issueDate,
    purchase_order_id: product.purchaseOrderId,
    reason: product.reason,
    received_id: product.receivedId,
    total: Number(product.total) || 0,
    vendor_name: product.vendorName,
    items: itemDetails.map((item) => ({
      item_name: item.name,
      quantity: Number(item.quantity) || 0,
      unit: item.unit,
      price: Number(item.price) || 0,
      batch_no: item.batchNo,
      gst: item.gst,
      reason: item.reason,
    })),
  });
}

      toast({
        title: "Success",
        description: "Debit/Credit note created successfully",
      });

      navigate("/dashboard/debit-credit");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create debit/credit note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Debit/Credit", "Create"]}>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Debit Credit Information</h3>
            
            {/* Purchase Details Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Purchase Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="noteId">
                    Note ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="noteId"
                    placeholder="Lorem"
                    value={noteId}
                    onChange={(e) => setNoteId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noteType">
                    Note Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Debit">Debit</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseOrderId">
                    Purchase order ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="purchaseOrderId"
                    placeholder="lorem"
                    value={purchaseOrderId}
                    onChange={(e) => setPurchaseOrderId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    placeholder="loremm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receivedId">Received ID</Label>
                  <Input
                    id="receivedId"
                    placeholder="loremm"
                    value={receivedId}
                    onChange={(e) => setReceivedId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total">Total</Label>
                  <Input
                    id="total"
                    placeholder="loremm"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    placeholder="loremm"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={addProductDetail} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to List
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Details Table */}
            {productDetails.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-2">Product Details</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>NOTE ID</TableHead>
                        <TableHead>NOTE TYPE</TableHead>
                        <TableHead>ISSUE DATE</TableHead>
                        <TableHead>PURCHASE ORDER ID</TableHead>
                        <TableHead>REASON</TableHead>
                        <TableHead>RECEIVED ID</TableHead>
                        <TableHead>TOTAL</TableHead>
                        <TableHead>VENDOR NAME</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productDetails.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.noteId}</TableCell>
                          <TableCell>{product.noteType}</TableCell>
                          <TableCell>{product.issueDate}</TableCell>
                          <TableCell>{product.purchaseOrderId}</TableCell>
                          <TableCell>{product.reason}</TableCell>
                          <TableCell>{product.receivedId}</TableCell>
                          <TableCell>{product.total}</TableCell>
                          <TableCell>{product.vendorName}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProductDetail(product.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Item Details Section */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">Item Details</h4>
                <Button
                  onClick={addItemDetail}
                  variant="link"
                  size="sm"
                  className="text-primary"
                >
                  Add
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Name</Label>
                  <Input
                    id="itemName"
                    placeholder="Lorem"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemQuantity">Quantity</Label>
                  <Input
                    id="itemQuantity"
                    placeholder="XXXXXX"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemUnit">Unit</Label>
                  <Input
                    id="itemUnit"
                    placeholder="xxx"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemPrice">Price</Label>
                  <Input
                    id="itemPrice"
                    placeholder="₹ xxxxxx"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemBatchNo">Batch No</Label>
                  <Input
                    id="itemBatchNo"
                    placeholder="xxxxx"
                    value={itemBatchNo}
                    onChange={(e) => setItemBatchNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemGst">GST</Label>
                  <Input
                    id="itemGst"
                    placeholder="loremm"
                    value={itemGst}
                    onChange={(e) => setItemGst(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemReason">Reason</Label>
                  <Input
                    id="itemReason"
                    placeholder="loremm"
                    value={itemReason}
                    onChange={(e) => setItemReason(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Item Details Table */}
            {itemDetails.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-2">Item Details</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#e8f5e9]">
                      <TableRow>
                        <TableHead>NAME</TableHead>
                        <TableHead>QUANTITY</TableHead>
                        <TableHead>UNIT</TableHead>
                        <TableHead>PRICE</TableHead>
                        <TableHead>BATCH NO</TableHead>
                        <TableHead>GST</TableHead>
                        <TableHead>REASON</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemDetails.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>₹ {item.price}</TableCell>
                          <TableCell>{item.batchNo}</TableCell>
                          <TableCell>{item.gst}</TableCell>
                          <TableCell>{item.reason}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItemDetail(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateDebitCredit;