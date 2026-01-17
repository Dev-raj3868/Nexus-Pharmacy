import { useState } from "react";
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
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

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
}

const getVal = (row: any, variants: string[], fallback: any = "") => {
  for (const k of variants) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
  }
  return fallback;
};
/* ---------------- COMPONENT ---------------- */

const InventoryManagement = () => {
  const [open, setOpen] = useState(false);
  const [itemNameInput, setItemNameInput] = useState("");
  const [updated, setUpdated] = useState(false);
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    itemId: "",
    category: "",
    batchNo: "",
    unit: "",
    minStock: "",
    rack: "",
    productType: "",
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [existingItems] = useState<{ label: string; value: string }[]>([]);

  /* ---------------- HANDLERS ---------------- */

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = async () => {
    if (
      !itemNameInput ||
      !formData.itemId ||
      !formData.category ||
      !formData.batchNo ||
      !formData.unit ||
      !formData.minStock
    ) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: formData.itemId,
        name: itemNameInput,
        category: formData.category,
        batchNo: formData.batchNo,
        unit: formData.unit,
        minStock: Number(formData.minStock),
        rack: formData.rack || null,
        productType: formData.productType || null,
      };

      console.log("💾 Saving inventory:", payload);

      await window.context.createInventory(payload);

      toast.success("Item added successfully");

      setItemNameInput("");
      setFormData({
        itemId: "",
        category: "",
        batchNo: "",
        unit: "",
        minStock: "",
        rack: "",
        productType: "",
      });
    } catch (err) {
      console.error("❌ Inventory save failed", err);
      toast.error("Failed to save inventory");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    toast.info("Delete will be handled via Electron DB");
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdate = () => {
    setUpdated(true);
    toast.success("Inventory updated successfully");
    setTimeout(() => setUpdated(false), 2000);
  };

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <DashboardLayout breadcrumbs={["Inventory"]}>
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border">
            <div className="px-4 py-3 bg-muted/30">
              <span className="font-medium text-foreground">
                Material Information
              </span>
            </div>
          </div>

          <div className="p-6">
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

            <div className="grid grid-cols-6 gap-4 mb-6">
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

              <div className="space-y-2">
                <Label>Item ID *</Label>
                <Input
                  value={formData.itemId}
                  onChange={(e) =>
                    handleInputChange("itemId", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Batch No *</Label>
                <Input
                  value={formData.batchNo}
                  onChange={(e) =>
                    handleInputChange("batchNo", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) =>
                    handleInputChange("unit", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Stock *</Label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    handleInputChange("minStock", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Rack</Label>
                <Input
                  value={formData.rack}
                  onChange={(e) =>
                    handleInputChange("rack", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <Input
                  value={formData.productType}
                  onChange={(e) =>
                    handleInputChange("productType", e.target.value)
                  }
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : items.length > 0 ? (
              <div className="mt-6">
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Batch No</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Min. Stock</TableHead>
                        <TableHead>Rack</TableHead>
                        <TableHead>Product Type</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item: any) => (
                        <TableRow key={getVal(item, ["item_id", "itemId", "id"]) || Math.random()}>
                          <TableCell>{getVal(item, ["item_name", "itemName", "name"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["item_id", "itemId", "id"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["category", "Category"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["batch_no", "batchNo", "batch"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["unit", "Unit"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["min_stock", "minStock", "minstock"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["rack", "Rack"], "-")}</TableCell>
                          <TableCell>{getVal(item, ["product_type", "productType"], "-")}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-destructive"
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

        <div className="flex justify-end">
          <Button
            onClick={handleUpdate}
            className={`${updated
              ? "bg-green-500 hover:bg-green-600"
              : "bg-primary hover:bg-primary/90"
              } text-primary-foreground px-8`}
          >
            {updated ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Updated
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
