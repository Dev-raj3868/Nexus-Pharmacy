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

interface IssueOrderDetail {
  id: string;
  employee_type: string;
  employee_name: string;
  issue_date: Date;
  remark: string;
}

interface ItemDetail {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  remark: string;
}

const CreateIssueOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Issue Order Details Form
  const [employeeType, setEmployeeType] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [issueDate, setIssueDate] = useState<Date>();
  const [orderRemark, setOrderRemark] = useState("");
  const [issueOrderDetails, setIssueOrderDetails] = useState<IssueOrderDetail[]>([]);

  // Item Details Form
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemRemark, setItemRemark] = useState("");
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);

  // Existing inventory for autocomplete
  const [inventory, setInventory] = useState<any[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user?.id);
    if (data) setInventory(data);
  };

  const handleAddIssueOrderDetail = () => {
    if (!employeeType || !employeeName || !issueDate) {
      toast.error("Please fill in Employee Type, Employee Name, and Issue Date");
      return;
    }

    const newDetail: IssueOrderDetail = {
      id: crypto.randomUUID(),
      employee_type: employeeType,
      employee_name: employeeName,
      issue_date: issueDate,
      remark: orderRemark,
    };

    setIssueOrderDetails([...issueOrderDetails, newDetail]);
    setEmployeeType("");
    setEmployeeName("");
    setIssueDate(undefined);
    setOrderRemark("");
  };

  const handleRemoveIssueOrderDetail = (id: string) => {
    setIssueOrderDetails(issueOrderDetails.filter((d) => d.id !== id));
  };

  const handleAddItemDetail = () => {
    if (!itemId || !itemName || !quantity) {
      toast.error("Please fill in Item ID, Item Name, and Quantity");
      return;
    }

    const newItem: ItemDetail = {
      id: crypto.randomUUID(),
      item_id: itemId,
      item_name: itemName,
      quantity: parseInt(quantity),
      remark: itemRemark,
    };

    setItemDetails([...itemDetails, newItem]);
    setItemId("");
    setItemName("");
    setQuantity("");
    setItemRemark("");
  };

  const handleRemoveItemDetail = (id: string) => {
    setItemDetails(itemDetails.filter((i) => i.id !== id));
  };

 const handleSave = async () => {
  if (issueOrderDetails.length === 0) {
    toast.error("Please add at least one issue order detail");
    return;
  }

  if (itemDetails.length === 0) {
    toast.error("Please add at least one item");
    return;
  }

  setIsLoading(true);

  try {
    for (const detail of issueOrderDetails) {
      await window.context.createIssueOrder({
        employee_type: detail.employee_type,
        employee_name: detail.employee_name,
        issue_date: detail.issue_date.getTime(), // 🔴 IMPORTANT
        remark: detail.remark,
        items: itemDetails
      });
    }

    toast.success("Issue order created successfully!");
    navigate("/dashboard/issue-orders");
  } catch (error: any) {
    toast.error(error.message || "Failed to create issue order");
  } finally {
    setIsLoading(false);
  }
};

  const filteredInventory = inventory.filter(
    (item) =>
      item.item_name.toLowerCase().includes(itemName.toLowerCase()) ||
      item.item_id.toLowerCase().includes(itemName.toLowerCase())
  );

  return (
    <DashboardLayout breadcrumbs={["Inventory Management", "Issue Order", "Create"]}>
      <div className="bg-card rounded-xl shadow-card p-6">
        {/* Issue Order Information Tab */}
        <div className="border-b border-border mb-6">
          <div className="inline-block px-4 py-2 border-b-2 border-primary font-medium text-foreground">
            Issue Order Information
          </div>
        </div>

        {/* Issue Order Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground">Issue Order Details</h3>
            <button
              onClick={handleAddIssueOrderDetail}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">
                Employee Type<span className="text-destructive">*</span>
              </Label>
              <Select value={employeeType} onValueChange={setEmployeeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Nurse">Nurse</SelectItem>
                  <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Employee Name<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter employee name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="border-primary"
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">
                Issue Date<span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? format(issueDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={setIssueDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm text-foreground">Remark</Label>
              <Input
                placeholder="Enter remark"
                value={orderRemark}
                onChange={(e) => setOrderRemark(e.target.value)}
              />
            </div>
          </div>

          {/* Issue Order Details Table */}
          {issueOrderDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Issue Order Details
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Employee Type</TableHead>
                    <TableHead className="text-xs uppercase">Employee Name</TableHead>
                    <TableHead className="text-xs uppercase">Issue Date</TableHead>
                    <TableHead className="text-xs uppercase">Remark</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueOrderDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.employee_type}</TableCell>
                      <TableCell>{detail.employee_name}</TableCell>
                      <TableCell>{format(detail.issue_date, "dd-MM-yyyy")}</TableCell>
                      <TableCell>{detail.remark || "-"}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRemoveIssueOrderDetail(detail.id)}
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
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm text-foreground">Item ID</Label>
              <Input
                placeholder="XXXXXX"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="bg-muted"
              />
            </div>

            <div className="relative">
              <Label className="text-sm text-foreground">
                Item Name<span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Search item..."
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  setShowItemDropdown(true);
                }}
                onFocus={() => setShowItemDropdown(true)}
                className="border-primary"
              />
              {showItemDropdown && itemName && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-2 cursor-pointer hover:bg-muted text-foreground"
                      onClick={() => {
                        setItemId(item.item_id);
                        setItemName(item.item_name);
                        setShowItemDropdown(false);
                      }}
                    >
                      {item.item_id} - {item.item_name}
                    </div>
                  ))}
                  {filteredInventory.length === 0 && (
                    <div className="px-4 py-2 text-muted-foreground">
                      No items found
                    </div>
                  )}
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
                className="bg-muted"
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

          {/* Item Details Table */}
          {itemDetails.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 font-medium text-foreground">
                Item Details
              </div>
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="text-xs uppercase">Item ID</TableHead>
                    <TableHead className="text-xs uppercase">Item Name</TableHead>
                    <TableHead className="text-xs uppercase">Quantity</TableHead>
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
                      <TableCell>{item.remark || "-"}</TableCell>
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
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateIssueOrder;