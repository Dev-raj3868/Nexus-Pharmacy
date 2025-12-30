import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateDistributor from "./pages/distributors/CreateDistributor";
import GetDistributors from "./pages/distributors/GetDistributors";
import CustomerSearch from "./pages/customers/CustomerSearch";
import CustomerList from "./pages/customers/CustomerList";
import GstReportSearch from "./pages/gst-reports/GstReportSearch";
import GstReportList from "./pages/gst-reports/GstReportList";
import InventoryManagement from "./pages/inventory/InventoryManagement";
import GetInventorySearch from "./pages/inventory/GetInventorySearch";
import GetInventoryList from "./pages/inventory/GetInventoryList";
import CreateReceiveOrder from "./pages/receive-orders/CreateReceiveOrder";
import GetReceiveOrders from "./pages/receive-orders/GetReceiveOrders";
import CreatePurchaseOrder from "./pages/purchase-orders/CreatePurchaseOrder";
import GetPurchaseOrders from "./pages/purchase-orders/GetPurchaseOrders";
import CreateBillTemplate from "./pages/bill-template/CreateBillTemplate";
import GetBillTemplate from "./pages/bill-template/GetBillTemplate";
import Statistics from "./pages/statistics/Statistics";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/distributors/create" element={<CreateDistributor />} />
            <Route path="/dashboard/distributors" element={<GetDistributors />} />
            <Route path="/dashboard/customers" element={<CustomerSearch />} />
            <Route path="/dashboard/customers/list" element={<CustomerList />} />
            <Route path="/dashboard/gst-reports" element={<GstReportSearch />} />
            <Route path="/dashboard/gst-reports/list" element={<GstReportList />} />
            <Route path="/dashboard/inventory" element={<InventoryManagement />} />
            <Route path="/dashboard/get-inventory" element={<GetInventorySearch />} />
            <Route path="/dashboard/get-inventory/list" element={<GetInventoryList />} />
            <Route path="/dashboard/receive-orders/create" element={<CreateReceiveOrder />} />
            <Route path="/dashboard/receive-orders" element={<GetReceiveOrders />} />
            <Route path="/dashboard/purchase-orders/create" element={<CreatePurchaseOrder />} />
            <Route path="/dashboard/purchase-orders" element={<GetPurchaseOrders />} />
            <Route path="/dashboard/bill-template/create" element={<CreateBillTemplate />} />
            <Route path="/dashboard/bill-template" element={<GetBillTemplate />} />
            <Route path="/dashboard/statistics" element={<Statistics />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
