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
import { Search, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface PurchaseDetail {
  id: string;
  purchase_id: string;
  payment_status: string;
  delivery_status: string;
  vendor_name: string;
}

interface ProductDetail {
  id: string;
  item_id: string;
  item_name: string;
  category: string;
  unit: string;
  received_quantity: number;
  batch_no: string;
  price_per_quantity: number;
  gst: string;
  remark: string;
}

const CreateReceiveOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Purchase Details Form
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [showPurchaseDropdown, setShowPurchaseDropdown] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [deliveryStatus, setDeliveryStatus] = useState("Pending");
  const [vendorName, setVendorName] = useState("");
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);

  // Product Details Form
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [pricePerQuantity, setPricePerQuantity] = useState("");
  const [gst, setGst] = useState("");
  const [remark, setRemark] = useState("");
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);

  // Existing purchase orders for dropdown
  const [existingPurchaseOrders, setExistingPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchPurchaseOrders();
    }
  }, [user]);

  const fetchPurchaseOrders = async () => {
    try {
      if (window.context?.getPurchaseOrders) {
        const data = await window.context.getPurchaseOrders({ userId: user?.id });
        setExistingPurchaseOrders(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch purchase orders via context:", err);
    }
  };

  const handleAddPurchaseDetail = () => {
    if (!purchaseSearch || !vendorName) {
      toast.error("Please fill in Purchase ID and Vendor Name");
      return;
    }

    const newDetail: PurchaseDetail = {
      id: crypto.randomUUID(),
      purchase_id: purchaseSearch,
      payment_status: paymentStatus,
      delivery_status: deliveryStatus,
      vendor_name: vendorName,
    };

    setPurchaseDetails([...purchaseDetails, newDetail]);
    setPurchaseSearch("");
    setPaymentStatus("Pending");
    setDeliveryStatus("Pending");
    setVendorName("");
  };

  const handleRemovePurchaseDetail = (id: string) => {
    setPurchaseDetails(purchaseDetails.filter((d) => d.id !== id));
  };

  const handleAddProductDetail = () => {
    if (!itemId || !itemName || !receivedQuantity || !batchNo) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newProduct: ProductDetail = {
      id: crypto.randomUUID(),
      item_id: itemId,
      item_name: itemName,
      category: category,
      unit: unit,
      received_quantity: parseInt(receivedQuantity),
      batch_no: batchNo,
      price_per_quantity: parseFloat(pricePerQuantity) || 0,
      gst: gst,
      remark: remark,
    };

    setProductDetails([...productDetails, newProduct]);
    // Reset form
    setItemId("");
    setItemName("");
    setCategory("");
    setUnit("");
    setReceivedQuantity("");
    setBatchNo("");
    setPricePerQuantity("");
    setGst("");
    setRemark("");
  };

  const handleRemoveProductDetail = (id: string) => {
    setProductDetails(productDetails.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (purchaseDetails.length === 0) {
      toast.error("Please add at least one purchase detail");
      return;
    }

    if (productDetails.length === 0) {
      toast.error("Please add at least one product detail");
      return;
    }

    setIsLoading(true);

    try {
      // Create receive order for each purchase detail via Electron context
      for (const purchase of purchaseDetails) {
        const payload = {
          purchaseDetails: {
            purchaseId: purchase.purchase_id,
            paymentStatus: purchase.payment_status,
            deliveryStatus: purchase.delivery_status,
            vendorName: purchase.vendor_name,
          },
          data: {
            products: productDetails.map((product) => ({
              id: product.id,
              item_id: product.item_id,
              item_name: product.item_name,
              category: product.category,
              unit: product.unit,
              received_quantity: product.received_quantity,
              batch_no: product.batch_no,
              price_per_quantity: product.price_per_quantity,
              gst: product.gst,
              remark: product.remark,
            })),
          },
        };

        if (!window.context?.createReceiveMaterial) {
          throw new Error("createReceiveMaterial is not available on window.context");
        }

        await window.context.createReceiveMaterial(payload);
      }

      toast.success("Receive order created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to create receive order:", error);
      toast.error(error.message || "Failed to create receive order");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPurchaseOrders = existingPurchaseOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(purchaseSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Material Information Tab */}
        <div className="border-b border-border mb-6">
          <div className="inline-block px-4 py-2 border-b-2 border-primary font-medium text-foreground">
            Material Information
          </div>
        </div>

        {/* Purchase Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Purchase Details</h3>
            <button
              onClick={handleAddPurchaseDetail}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Label className="text-sm text-foreground">
                Purchase ID<span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search purchase..."
                  value={purchaseSearch}
                  onChange={(e) => {
                    setPurchaseSearch(e.target.value);
                    setShowPurchaseDropdown(true);
                  }}
                  onFocus={() => setShowPurchaseDropdown(true)}
                  className="pl-9"
                />
              </div>
              {showPurchaseDropdown && purchaseSearch && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  <div
                    className="px-4 py-2 text-primary cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setShowPurchaseDropdown(false);
                    }}
                  >
                    Non Purchase ID item
                  </div>
                  {filteredPurchaseOrders.map((order) => (
                    <div
                      key={order.id}
                      className="px-4 py-2 cursor-pointer hover:bg-muted text-foreground"
                      onClick={() => {
                        setPurchaseSearch(order.id.slice(0, 8));
                        setVendorName(order.supplier_name);
                        setShowPurchaseDropdown(false);
                      }}
                    >
                      {order.id.slice(0, 8)} - {order.supplier_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm text-foreground">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-foreground">Vendor Name</Label>
              <Input
                placeholder="Enter vendor name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
          </div>

          {/* Purchase Details Table */}
          {purchaseDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Purchase Details
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Purchase ID</TableHead>
                    <TableHead className="text-xs uppercase">Payment Status</TableHead>
                    <TableHead className="text-xs uppercase">Delivery Status</TableHead>
                    <TableHead className="text-xs uppercase">Vendor Name</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.purchase_id}</TableCell>
                      <TableCell>{detail.payment_status}</TableCell>
                      <TableCell>{detail.delivery_status}</TableCell>
                      <TableCell>{detail.vendor_name}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemovePurchaseDetail(detail.id)}
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

        {/* Product Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Product Details</h3>
            <button
              onClick={handleAddProductDetail}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">
                Item ID<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter item ID"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Item Name<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">Category</Label>
              <Input
                placeholder="Enter category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Unit<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Received Quantity<span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">
                Batch NO<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter batch no"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Price Per Quantity<span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Enter price"
                value={pricePerQuantity}
                onChange={(e) => setPricePerQuantity(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                GST<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter GST"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Remark<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>

          {/* Product Details Table */}
          {productDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Product Details
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Item ID</TableHead>
                    <TableHead className="text-xs uppercase">Item Name</TableHead>
                    <TableHead className="text-xs uppercase">Category</TableHead>
                    <TableHead className="text-xs uppercase">Unit</TableHead>
                    <TableHead className="text-xs uppercase">Received Quantity</TableHead>
                    <TableHead className="text-xs uppercase">Batch No</TableHead>
                    <TableHead className="text-xs uppercase">Price Per Quantity</TableHead>
                    <TableHead className="text-xs uppercase">GST</TableHead>
                    <TableHead className="text-xs uppercase">Remark</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productDetails.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.item_id}</TableCell>
                      <TableCell>{product.item_name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.received_quantity}</TableCell>
                      <TableCell>{product.batch_no}</TableCell>
                      <TableCell>₹{product.price_per_quantity}</TableCell>
                      <TableCell>{product.gst}</TableCell>
                      <TableCell>{product.remark}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveProductDetail(product.id)}
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

export default CreateReceiveOrder;
