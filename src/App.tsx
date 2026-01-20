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
import CreateIssueOrder from "./pages/issue-orders/CreateIssueOrder";
import GetIssueOrders from "./pages/issue-orders/GetIssueOrders";
import CreateBillTemplate from "./pages/bill-template/CreateBillTemplate";
import GetBillTemplate from "./pages/bill-template/GetBillTemplate";
import CreateBill from "./pages/bills/CreateBill";
import Statistics from "./pages/statistics/Statistics";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";
import CreateInventoryPurchase from "./pages/inventory-purchase/CreateInventoryPurchase";
import GetInventoryPurchase from "./pages/inventory-purchase/GetInventoryPurchase";
import CreateInventoryReceive from "./pages/inventory-receive/CreateInventoryReceive";
import GetInventoryReceive from "./pages/inventory-receive/GetInventoryReceive";
import CreateDebitCredit from "./pages/debit-credit/CreateDebitCredit";
import GetDebitCredit from "./pages/debit-credit/GetDebitCredit";

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
            <Route path="/dashboard/inventory" element={<GetInventorySearch />} />
            <Route path="/dashboard/inventory/get" element={<GetInventoryList />} />
            <Route path="/dashboard/inventory/create" element={<InventoryManagement />} />
            <Route path="/dashboard/receive-orders/create" element={<CreateReceiveOrder />} />
            <Route path="/dashboard/receive-orders" element={<GetReceiveOrders />} />
            <Route path="/dashboard/purchase-orders/create" element={<CreatePurchaseOrder />} />
            <Route path="/dashboard/purchase-orders" element={<GetPurchaseOrders />} />
            <Route path="/dashboard/issue-orders/create" element={<CreateIssueOrder />} />
            <Route path="/dashboard/issue-orders" element={<GetIssueOrders />} />
            <Route path="/dashboard/bill-template/create" element={<CreateBillTemplate />} />
            <Route path="/dashboard/bill-template" element={<GetBillTemplate />} />
            <Route path="/dashboard/bills/create" element={<CreateBill />} />
            <Route path="/dashboard/statistics" element={<Statistics />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            {/* New Inventory Purchase routes (separate from home page) */}
            <Route path="/dashboard/inventory-purchase/create" element={<CreateInventoryPurchase />} />
            <Route path="/dashboard/inventory-purchase" element={<GetInventoryPurchase />} />
            {/* New Inventory Receive routes (separate from home page) */}
            <Route path="/dashboard/inventory-receive/create" element={<CreateInventoryReceive />} />
            <Route path="/dashboard/inventory-receive" element={<GetInventoryReceive />} />
            {/* Debit/Credit routes */}
            <Route path="/dashboard/debit-credit/create" element={<CreateDebitCredit />} />
            <Route path="/dashboard/debit-credit" element={<GetDebitCredit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;