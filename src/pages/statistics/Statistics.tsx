import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

// Sample data for charts
const abcPieData = [
  { name: "High-value", value: 40, color: "hsl(var(--secondary))" },
  { name: "Moderate value", value: 35, color: "hsl(142, 76%, 70%)" },
  { name: "Low-value", value: 25, color: "hsl(142, 76%, 85%)" },
];

const vedPieData = [
  { name: "Vital", value: 35, color: "hsl(var(--secondary))" },
  { name: "Essential", value: 40, color: "hsl(142, 76%, 70%)" },
  { name: "Desirable", value: 25, color: "hsl(142, 76%, 85%)" },
];

const fsnLineData = [
  { day: "Mon", fast: 80, slow: 30, non: 10 },
  { day: "Tue", fast: 50, slow: 25, non: 15 },
  { day: "Wed", fast: 60, slow: 40, non: 20 },
  { day: "Thu", fast: 45, slow: 35, non: 25 },
  { day: "Fri", fast: 90, slow: 50, non: 30 },
  { day: "Sat", fast: 70, slow: 45, non: 20 },
  { day: "Sun", fast: 85, slow: 55, non: 25 },
];

const Statistics = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState("7days");
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("user_id", user?.id)
      .limit(10);

    if (!error && data) {
      setInventory(data);
    }
  };

  // ABC Analysis data - classify by price
  const abcData = inventory.map((item) => {
    const price = item.price || 0;
    let abcClass = "C";
    let status = "Sufficient";
    
    if (price > 500) {
      abcClass = "A";
      status = item.stock < item.min_stock ? "Reorder" : "Sufficient";
    } else if (price > 100) {
      abcClass = "B";
      status = item.stock < item.min_stock ? "Low Stock" : "Sufficient";
    }

    return {
      item: item.item_name,
      abcClass,
      category: item.category,
      stock: item.stock,
      reorderLevel: item.min_stock,
      status,
    };
  });

  // VED Analysis data
  const vedData = inventory.map((item) => {
    const category = item.category?.toLowerCase() || "";
    let stockAlert = "Sufficient Stock";
    
    if (item.stock === 0) {
      stockAlert = "Out Of Stock";
    } else if (item.stock < item.min_stock) {
      stockAlert = "Near Expiry";
    }

    return {
      item: item.item_name,
      stockQty: item.stock,
      expiryDate: "01-Sep-2025",
      stockAlert,
    };
  });

  // FSN Analysis data
  const fsnData = inventory.map((item) => {
    let fsn = "N";
    if (item.stock > 50) fsn = "F";
    else if (item.stock > 20) fsn = "S";

    return {
      item: item.item_name,
      fsn,
      lastSold: "12-May-2025",
      avgSales: Math.floor(Math.random() * 200),
      stockQty: item.stock,
      action: "Restock Soon",
    };
  });

  // Combined Analysis data
  const combinedData = inventory.slice(0, 6).map((item) => {
    const price = item.price || 0;
    let abc = "C";
    if (price > 500) abc = "A";
    else if (price > 100) abc = "B";

    const ved = item.stock === 0 ? "V" : item.stock < item.min_stock ? "E" : "D";
    const fsn = item.stock > 50 ? "F" : item.stock > 20 ? "S" : "N";

    let priority = "Low";
    if (abc === "A" || ved === "V") priority = "High Priority";
    else if (abc === "B" || ved === "E") priority = "Moderate";

    return {
      item: item.item_name,
      batchNo: item.batch_no,
      abc,
      ved,
      fsn,
      stockQty: item.stock,
      lastSold: "10-May-2025",
      expiryDate: "01-Sep-2025",
      priority,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reorder":
      case "high priority":
        return "text-destructive";
      case "low stock":
      case "out of stock":
      case "near expiry":
      case "moderate":
        return "text-amber-600";
      case "sufficient":
        return "text-green-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Time Filter Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant={timeFilter === "7days" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("7days")}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeFilter === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("30days")}
            className={timeFilter === "30days" ? "bg-secondary text-secondary-foreground" : ""}
          >
            Last 30 Days
          </Button>
          <Button
            variant={timeFilter === "quarter" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("quarter")}
            className={timeFilter === "quarter" ? "bg-secondary text-secondary-foreground" : ""}
          >
            This Quarter
          </Button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* ABC Analysis Chart */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">ABC Analysis</h3>
              <button className="text-sm text-muted-foreground flex items-center gap-1">
                View all <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                High-value
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 70%)" }}></span>
                Moderate value
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 85%)" }}></span>
                Low-value
              </span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={abcPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={false}
                  >
                    {abcPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xs text-muted-foreground">Total Value: ₹25,000</p>
                <p className="text-xs text-muted-foreground">All items in stock</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              2 A-class items below reorder level
            </p>
          </div>

          {/* VED Analysis Chart */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">VED Analysis</h3>
              <button className="text-sm text-muted-foreground flex items-center gap-1">
                View all <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Vital
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 70%)" }}></span>
                Essential
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 85%)" }}></span>
                Desirable
              </span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vedPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {vedPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <p>3 Vital items are out of stock</p>
              <p>2 Vital items expiring in next 30 days</p>
              <p>Essential: 14 (1 out of stock)</p>
              <p>Desirable: 8 (1 near expiry)</p>
            </div>
          </div>

          {/* FSN Analysis Chart */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">FSN Analysis</h3>
              <button className="text-sm text-muted-foreground flex items-center gap-1">
                View all <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-destructive"></span>
                Fast
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Slow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                Non
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fsnLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="fast" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="slow" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* ABC Analysis Table */}
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">ITEM</TableHead>
                  <TableHead className="text-xs">ABC CLASS</TableHead>
                  <TableHead className="text-xs">CATEGORY</TableHead>
                  <TableHead className="text-xs">STOCK</TableHead>
                  <TableHead className="text-xs">REORDER LEVEL</TableHead>
                  <TableHead className="text-xs">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abcData.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{row.item}</TableCell>
                    <TableCell className="text-xs">{row.abcClass}</TableCell>
                    <TableCell className="text-xs">{row.category}</TableCell>
                    <TableCell className="text-xs">{row.stock}</TableCell>
                    <TableCell className="text-xs">{row.reorderLevel}</TableCell>
                    <TableCell className={`text-xs ${getStatusColor(row.status)}`}>
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* VED Analysis Table */}
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">ITEM</TableHead>
                  <TableHead className="text-xs">STOCK QTY</TableHead>
                  <TableHead className="text-xs">EXPIRY DATE</TableHead>
                  <TableHead className="text-xs">STOCK ALERT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vedData.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{row.item}</TableCell>
                    <TableCell className="text-xs">{row.stockQty}</TableCell>
                    <TableCell className="text-xs">{row.expiryDate}</TableCell>
                    <TableCell className={`text-xs ${getStatusColor(row.stockAlert)}`}>
                      {row.stockAlert}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* FSN Analysis Table */}
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">ITEM</TableHead>
                  <TableHead className="text-xs">FSN</TableHead>
                  <TableHead className="text-xs">LAST SOLD</TableHead>
                  <TableHead className="text-xs">AVG. SALES</TableHead>
                  <TableHead className="text-xs">STOCK QTY</TableHead>
                  <TableHead className="text-xs">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fsnData.slice(0, 12).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{row.item}</TableCell>
                    <TableCell className="text-xs">{row.fsn}</TableCell>
                    <TableCell className="text-xs">{row.lastSold}</TableCell>
                    <TableCell className="text-xs">{row.avgSales}</TableCell>
                    <TableCell className="text-xs">{row.stockQty}</TableCell>
                    <TableCell className="text-xs text-primary">{row.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Combined Analysis Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Combined Analysis</h3>
          </div>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs">ITEM</TableHead>
                <TableHead className="text-xs">BATCH NO</TableHead>
                <TableHead className="text-xs">ABC</TableHead>
                <TableHead className="text-xs">VED</TableHead>
                <TableHead className="text-xs">FSN</TableHead>
                <TableHead className="text-xs">STOCK QTY</TableHead>
                <TableHead className="text-xs">LAST SOLD</TableHead>
                <TableHead className="text-xs">EXPIRY DATE</TableHead>
                <TableHead className="text-xs">PRIORITY LEVEL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs">{row.item}</TableCell>
                  <TableCell className="text-xs">{row.batchNo}</TableCell>
                  <TableCell className="text-xs">{row.abc}</TableCell>
                  <TableCell className="text-xs">{row.ved}</TableCell>
                  <TableCell className="text-xs">{row.fsn}</TableCell>
                  <TableCell className="text-xs">{row.stockQty}</TableCell>
                  <TableCell className="text-xs">{row.lastSold}</TableCell>
                  <TableCell className="text-xs">{row.expiryDate}</TableCell>
                  <TableCell className={`text-xs ${getStatusColor(row.priority)}`}>
                    {row.priority}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
