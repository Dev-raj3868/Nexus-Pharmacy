import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Check, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  item_name: string;
  item_id: string;
  category: string;
  batch_no: string;
  unit: string;
  stock: number;
  min_stock: number;
  rack: string | null;
  product_type: string | null;
  price: number | null;
  gst: string | null;
}

const InventoryManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [itemNameInput, setItemNameInput] = useState("");
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    itemId: "",
    category: "",
    batchNo: "",
    unit: "",
    stock: "",
    minStock: "",
    rack: "",
    productType: "",
    price: "",
    gst: "",
  });
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [existingItems, setExistingItems] = useState<{ label: string; value: string }[]>([]);

  // Fetch existing inventory items for dropdown
  useEffect(() => {
    const fetchExistingItems = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("inventory")
        .select("item_name")
        .eq("user_id", user.id);
      
      if (data) {
        const uniqueNames = [...new Set(data.map(i => i.item_name))];
        setExistingItems(uniqueNames.map(name => ({ label: name, value: name })));
      }
    };
    
    fetchExistingItems();
  }, [user]);

  // Fetch all inventory items
  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch inventory items",
          variant: "destructive",
        });
      } else if (data) {
        setItems(data);
      }
      setLoading(false);
    };
    
    fetchItems();
  }, [user, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = async () => {
    if (!user || !itemNameInput || !formData.itemId) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    const { data, error } = await supabase
      .from("inventory")
      .insert({
        user_id: user.id,
        item_name: itemNameInput,
        item_id: formData.itemId,
        category: formData.category,
        batch_no: formData.batchNo,
        unit: formData.unit,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.minStock) || 0,
        rack: formData.rack || null,
        product_type: formData.productType || null,
        price: formData.price ? parseFloat(formData.price) : null,
        gst: formData.gst || null,
      })
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } else if (data) {
      setItems((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      
      // Reset form
      setItemNameInput("");
      setFormData({
        itemId: "",
        category: "",
        batchNo: "",
        unit: "",
        stock: "",
        minStock: "",
        rack: "",
        productType: "",
        price: "",
        gst: "",
      });
    }
    setSaving(false);
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    }
  };

  const handleUpdate = () => {
    setUpdated(true);
    toast({
      title: "Success",
      description: "Inventory updated successfully",
    });
    setTimeout(() => setUpdated(false), 2000);
  };

  return (
    <DashboardLayout breadcrumbs={["Inventory"]}>
      <div className="space-y-6">
        {/* Material Information Tab */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border">
            <div className="px-4 py-3 bg-muted/30">
              <span className="font-medium text-foreground">Material Information</span>
            </div>
          </div>

          <div className="p-6">
            {/* Item Details Header */}
            <div className="flex items-center gap-2 mb-6">
              <span className="font-medium text-foreground">Item Details</span>
              <button
                onClick={handleAddItem}
                disabled={saving}
                className="text-primary font-medium text-sm hover:underline disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              {/* Item Name with Search Dropdown */}
              <div className="space-y-2">
                <Label>
                  Item Name<span className="text-primary">*</span>
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-start font-normal"
                    >
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      {itemNameInput || "Search item..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type new..." 
                        value={itemNameInput}
                        onValueChange={setItemNameInput}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <button
                            onClick={() => setOpen(false)}
                            className="w-full text-left px-2 py-1.5 text-sm text-primary"
                          >
                            Use "{itemNameInput}"
                          </button>
                        </CommandEmpty>
                        <CommandGroup>
                          {existingItems.map((item) => (
                            <CommandItem
                              key={item.value}
                              value={item.value}
                              onSelect={(value) => {
                                setItemNameInput(value);
                                setOpen(false);
                              }}
                            >
                              {item.label}
                            </CommandItem>
                          ))}
                          <CommandItem 
                            className="text-primary"
                            onSelect={() => setOpen(false)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Item
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Item ID */}
              <div className="space-y-2">
                <Label>
                  Item ID<span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="XXXXXX"
                  value={formData.itemId}
                  onChange={(e) => handleInputChange("itemId", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>
                  Category<span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="Lorem Ipsum"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                />
              </div>

              {/* Batch No */}
              <div className="space-y-2">
                <Label>
                  Batch No<span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="xxxxx"
                  value={formData.batchNo}
                  onChange={(e) => handleInputChange("batchNo", e.target.value)}
                />
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label>
                  Unit<span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="XXXX"
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <Label>
                  Stock<span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="XXXXX"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                />
              </div>

              {/* Minimum Stock */}
              <div className="space-y-2">
                <Label>
                  Minimum Stock<span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="XXXXX"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange("minStock", e.target.value)}
                />
              </div>

              {/* Rack */}
              <div className="space-y-2">
                <Label>Rack</Label>
                <Input
                  placeholder="loremm"
                  value={formData.rack}
                  onChange={(e) => handleInputChange("rack", e.target.value)}
                />
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <Label>Product type</Label>
                <Input
                  placeholder="Lorem Ipsum"
                  value={formData.productType}
                  onChange={(e) => handleInputChange("productType", e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  placeholder="₹ XXX"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>

              {/* GST */}
              <div className="space-y-2">
                <Label>GST</Label>
                <Input
                  placeholder="GSTR1"
                  value={formData.gst}
                  onChange={(e) => handleInputChange("gst", e.target.value)}
                />
              </div>
            </div>

            {/* Item Details Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : items.length > 0 ? (
              <div className="mt-6">
                <div className="border-b border-border pb-2 mb-4">
                  <span className="font-medium text-foreground">Item Details</span>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold uppercase">Item Name</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Item ID</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Category</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Batch No</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Unit</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Stock</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Min. Stock</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Rack</TableHead>
                        <TableHead className="text-xs font-semibold uppercase">Product Type</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{item.item_name}</TableCell>
                          <TableCell className="text-sm">{item.item_id}</TableCell>
                          <TableCell className="text-sm">{item.category}</TableCell>
                          <TableCell className="text-sm">{item.batch_no}</TableCell>
                          <TableCell className="text-sm">{item.unit}</TableCell>
                          <TableCell className="text-sm">{item.stock}</TableCell>
                          <TableCell className="text-sm">{item.min_stock}</TableCell>
                          <TableCell className="text-sm">{item.rack || "-"}</TableCell>
                          <TableCell className="text-sm">{item.product_type || "-"}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
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
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No inventory items yet. Add your first item above.
              </div>
            )}
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleUpdate}
            className={`${
              updated
                ? "bg-green-500 hover:bg-green-600"
                : "bg-primary hover:bg-primary/90"
            } text-primary-foreground px-8`}
          >
            {updated ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Updated
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryManagement;
