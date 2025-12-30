import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Clipboard,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const weeklyData = [
  { day: "M", value: 40 },
  { day: "T", value: 20 },
  { day: "W", value: 10 },
  { day: "TH", value: 29 },
  { day: "F", value: 11 },
  { day: "ST", value: 71 },
  { day: "S", value: 83 },
];

const stockData = [
  { id: "MED001", name: "Paracetamol 500mg", minStock: "100", currentStock: "45" },
  { id: "MED002", name: "Amoxicillin 250mg", minStock: "50", currentStock: "22" },
  { id: "MED003", name: "Omeprazole 20mg", minStock: "75", currentStock: "30" },
  { id: "MED004", name: "Metformin 500mg", minStock: "80", currentStock: "65" },
  { id: "MED005", name: "Aspirin 100mg", minStock: "120", currentStock: "25" },
  { id: "MED006", name: "Cetirizine 10mg", minStock: "60", currentStock: "18" },
  { id: "MED007", name: "Ibuprofen 400mg", minStock: "90", currentStock: "42" },
  { id: "MED008", name: "Pantoprazole 40mg", minStock: "70", currentStock: "35" },
];

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [purchaseDropdownOpen, setPurchaseDropdownOpen] = useState(false);
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false);

  const handleQuickAction = (label: string, action?: string) => {
    if (label === "Get Inventory") {
      navigate("/dashboard/get-inventory");
    } else if (label === "Create Purchase order") {
      if (action === "create") {
        navigate("/dashboard/purchase-orders/create");
      } else if (action === "get") {
        navigate("/dashboard/purchase-orders");
      }
    } else if (label === "Create Receive order") {
      if (action === "create") {
        navigate("/dashboard/receive-orders/create");
      } else if (action === "get") {
        navigate("/dashboard/receive-orders");
      }
    }
  };

  return (
    <DashboardLayout>
      {/* Profile Summary Card 
      {profile && (
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Profile Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Pharmacy</p>
              <p className="font-medium text-foreground">{profile.pharmacy_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{profile.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium text-foreground">{profile.clinic_location || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DL No</p>
              <p className="font-medium text-foreground">{profile.dl_no || "Not set"}</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Create Bill */}
        <div
          onClick={() => navigate("/dashboard/bill-template/create")}
          className="bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-card transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-card shadow-sm flex items-center justify-center text-2xl">
            💵
          </div>
          <span className="font-medium text-foreground flex-1">Create Bill</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Get Inventory */}
        <div
          onClick={() => handleQuickAction("Get Inventory")}
          className="bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-card transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-card shadow-sm flex items-center justify-center text-2xl">
            📦
          </div>
          <span className="font-medium text-foreground flex-1">Get Inventory</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Purchase Order with Dropdown */}
        <DropdownMenu open={purchaseDropdownOpen} onOpenChange={setPurchaseDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-full bg-card shadow-sm flex items-center justify-center text-2xl">
                📋
              </div>
              <span className="font-medium text-foreground flex-1">Purchase order</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card">
            <DropdownMenuItem onClick={() => handleQuickAction("Create Purchase order", "create")}>
              Create
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("Create Purchase order", "get")}>
              Get
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Receive Order with Dropdown */}
        <DropdownMenu open={receiveDropdownOpen} onOpenChange={setReceiveDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-card transition-all group">
              <div className="w-12 h-12 rounded-full bg-card shadow-sm flex items-center justify-center text-2xl">
                📥
              </div>
              <span className="font-medium text-foreground flex-1">Receive order</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card">
            <DropdownMenuItem onClick={() => handleQuickAction("Create Receive order", "create")}>
              Create
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("Create Receive order", "get")}>
              Get
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Stock Table */}
        <div className="col-span-2 bg-card rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Button variant="destructive" size="sm" className="text-xs">
              Low Stock Alert
            </Button>
            <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Item ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Item Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Min Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Current Stock</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-primary font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{item.minStock}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${parseInt(item.currentStock) < parseInt(item.minStock) / 2 ? 'text-destructive' : 'text-foreground'}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-primary hover:text-primary/80">
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weekly Stats Chart */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Weekly stats</h3>
            <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
