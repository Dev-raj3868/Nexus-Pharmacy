import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InventoryItem {
  [key: string]: any;
}

const getVal = (row: any, variants: string[], fallback: any = "") => {
  for (const k of variants) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
  }
  return fallback;
};

// Mock inventory data - Fallback if no data is passed
const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "1",
    item_id: "MED001",
    item_name: "Paracetamol 500mg",
    category: "Analgesics",
    unit: "Tablets",
    stock: 450,
    batch_no: "BATCH-001",
    min_stock: 100,
    rack: "A1",
    product_type: "Tablet",
    price: 50,
    gst: "5%",
  },
  {
    id: "2",
    item_id: "MED002",
    item_name: "Amoxicillin 250mg",
    category: "Antibiotics",
    unit: "Capsules",
    stock: 220,
    batch_no: "BATCH-002",
    min_stock: 50,
    rack: "B2",
    product_type: "Capsule",
    price: 120,
    gst: "5%",
  },
  {
    id: "3",
    item_id: "MED003",
    item_name: "Omeprazole 20mg",
    category: "Gastrointestinal",
    unit: "Capsules",
    stock: 300,
    batch_no: "BATCH-003",
    min_stock: 75,
    rack: "C3",
    product_type: "Capsule",
    price: 80,
    gst: "5%",
  },
  {
    id: "4",
    item_id: "MED004",
    item_name: "Metformin 500mg",
    category: "Antidiabetics",
    unit: "Tablets",
    stock: 650,
    batch_no: "BATCH-004",
    min_stock: 80,
    rack: "D1",
    product_type: "Tablet",
    price: 40,
    gst: "5%",
  },
  {
    id: "5",
    item_id: "MED005",
    item_name: "Aspirin 100mg",
    category: "Analgesics",
    unit: "Tablets",
    stock: 250,
    batch_no: "BATCH-005",
    min_stock: 120,
    rack: "A2",
    product_type: "Tablet",
    price: 30,
    gst: "5%",
  },
];

const GetInventoryList = () => {
  const location = useLocation();
  // Get items from location state, fallback to mock data
  const initialItems = (location.state?.items as InventoryItem[]) || MOCK_INVENTORY;
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const itemsPerPage = 14;

  // Initialize items from state on mount
  useEffect(() => {
    if (location.state?.items) {
      setItems(location.state.items);
    }
  }, [location.state?.items]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleGetAll = () => {
    setItemName("");
    setCategory("");
    setItems(initialItems);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  return (
    <DashboardLayout breadcrumbs={["Get Inventory", "Results"]}>
      <div className="space-y-4">
        {/* Search Form */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Item Name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <button
              onClick={handleGetAll}
              className="text-primary font-medium text-sm hover:underline whitespace-nowrap"
            >
              GET ALL
            </button>
            <Button onClick={handleSearch} className="px-8">
              Search
            </Button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <span className="font-medium text-foreground">Item Details</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No inventory items found. Add items from the Inventory page.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase text-primary">Item ID</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-primary">Item Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-primary">Category</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-primary">Unit</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-primary">Total Stock</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-primary"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item: any) => (
                  <TableRow key={getVal(item, ["item_id", "itemId", "id"]) || Math.random()} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{getVal(item, ["item_id", "itemId", "id"], "-")}</TableCell>
                    <TableCell className="text-sm">{getVal(item, ["item_name", "itemName", "name"], "-")}</TableCell>
                    <TableCell className="text-sm">{getVal(item, ["category", "Category"], "-")}</TableCell>
                    <TableCell className="text-sm">{getVal(item, ["unit", "Unit"], "-")}</TableCell>
                    <TableCell className="text-sm">{getVal(item, ["stock", "quantity", "qty"], 0)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-primary font-medium text-sm hover:underline"
                      >
                        VIEW DETAILS
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={typeof page === "string"}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              # {selectedItem?.item_id}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Item Details Section */}
              <div className="border border-border rounded-lg p-6">
                <h3 className="font-medium text-foreground mb-4">Item Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Item ID</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["item_id", "itemId", "id"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Item Name</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["item_name", "itemName", "name"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Category</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["category", "Category"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Batch No</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["batch_no", "batchNo", "batch"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Unit</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["unit", "Unit"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Stock</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["stock", "quantity", "qty"], 0)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Minimum Stock</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["min_stock", "minStock", "minstock"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Rack</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {selectedItem.rack || "-"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Product type</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {getVal(selectedItem, ["product_type", "productType"], "-")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Price</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {selectedItem.price ? `₹ ${selectedItem.price}` : "-"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">GST</label>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm">
                      {selectedItem.gst || "-"}
                    </div>
                  </div>
                </div>

                {/* Item Information Table */}
                <div className="mt-6">
                  <div className="border-b border-border pb-2 mb-4">
                    <span className="font-medium text-foreground text-sm">Item Information</span>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold uppercase">Item ID</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Item Name</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Category</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Batch No</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Unit</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Stock</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Min Stock</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Rack</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Product Type</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">Price</TableHead>
                          <TableHead className="text-xs font-semibold uppercase">GST</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-sm">{getVal(selectedItem, ["item_id", "itemId", "id"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["item_name", "itemName", "name"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["category", "Category"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["batch_no", "batchNo", "batch"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["unit", "Unit"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["stock", "quantity", "qty"], 0)}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["min_stock", "minStock", "minstock"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["rack", "Rack"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["product_type", "productType"], "-")}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["price", "amount"], null) ? `₹ ${getVal(selectedItem, ["price", "amount"], null)}` : "-"}</TableCell>
                          <TableCell className="text-sm">{getVal(selectedItem, ["gst", "GST"], "-")}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GetInventoryList;
