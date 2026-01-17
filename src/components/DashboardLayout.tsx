import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import {
  User,
  FileText,
  Package,
  Truck,
  Users,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  Search,
  Home,
  Menu,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  List,
  ShoppingCart,
  PackageCheck,
  Send,
  CreditCard,
  Boxes,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
}

const DashboardLayout = ({ children, breadcrumbs = [] }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Main Inventory Management dropdown
  const [inventoryMgmtOpen, setInventoryMgmtOpen] = useState(
    location.pathname.includes("/dashboard/inventory") ||
    location.pathname.includes("/dashboard/purchase-orders") ||
    location.pathname.includes("/dashboard/receive-orders") ||
    location.pathname.includes("/dashboard/issue-orders") ||
    location.pathname.includes("/dashboard/inventory-purchase") ||
    location.pathname.includes("/dashboard/inventory-receive") ||
    location.pathname.includes("/dashboard/debit-credit")
  );
  
  // Sub-dropdowns within Inventory Management
  const [inventoryOpen, setInventoryOpen] = useState(
    location.pathname.includes("/dashboard/inventory") &&
    !location.pathname.includes("/dashboard/inventory-purchase") &&
    !location.pathname.includes("/dashboard/inventory-receive")
  );
  const [inventoryPurchaseOpen, setInventoryPurchaseOpen] = useState(
    location.pathname.includes("/dashboard/inventory-purchase")
  );
  const [inventoryReceiveOpen, setInventoryReceiveOpen] = useState(
    location.pathname.includes("/dashboard/inventory-receive")
  );
  const [purchaseOpen, setPurchaseOpen] = useState(
    location.pathname.includes("/dashboard/purchase-orders")
  );
  const [receiveOpen, setReceiveOpen] = useState(
    location.pathname.includes("/dashboard/receive-orders")
  );
  const [issueOpen, setIssueOpen] = useState(
    location.pathname.includes("/dashboard/issue-orders")
  );
  const [debitCreditOpen, setDebitCreditOpen] = useState(
    location.pathname.includes("/dashboard/debit-credit")
  );
  
  const [distributorsOpen, setDistributorsOpen] = useState(
    location.pathname.includes("/dashboard/distributors")
  );
  const [billTemplateOpen, setBillTemplateOpen] = useState(
    location.pathname.includes("/dashboard/bill-template")
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = () => {
    if (profile) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  const getFullName = () => {
    if (profile) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user.email?.split("@")[0] || "User";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <Button variant="hero" size="sm" className="text-xs">
            Upgrade to <span className="font-bold ml-1">Pro</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-light tracking-wider">
            <span className="text-primary font-semibold">PHAR</span>
            <span className="text-muted-foreground">MACY</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground">Welcome</span>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-foreground font-semibold">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">{getFullName()}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <span className="text-xs font-medium text-secondary-foreground">
              {profile?.pharmacy_name?.slice(0, 6).toUpperCase() || "NEXUS"}
            </span>
          </div>
        </div>
      </header>

      {/* Sub Header with Breadcrumbs */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            {breadcrumbs.length === 0 ? (
              <>
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">Home</span>
              </>
            ) : (
              breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  <span
                    className={`text-sm ${
                      index === breadcrumbs.length - 1
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {crumb}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-10" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-56" : "w-16"
          } bg-card border-r border-border min-h-[calc(100vh-120px)] transition-all duration-300 relative`}
        >
          <div className="p-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Profile Link */}
            <Link
              to="/dashboard/profile"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === "/dashboard/profile"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Profile</span>}
            </Link>

            {/* Inventory Management Main Dropdown */}
            <Collapsible open={inventoryMgmtOpen} onOpenChange={setInventoryMgmtOpen}>
              <CollapsibleTrigger
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname.includes("/dashboard/inventory") ||
                  location.pathname.includes("/dashboard/purchase-orders") ||
                  location.pathname.includes("/dashboard/receive-orders") ||
                  location.pathname.includes("/dashboard/issue-orders") ||
                  location.pathname.includes("/dashboard/debit-credit")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Boxes className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">Inventory Mgmt</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        inventoryMgmtOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1 mt-1">
                {/* Inventory Sub-dropdown */}
                <Collapsible open={inventoryOpen} onOpenChange={setInventoryOpen}>
                  <CollapsibleTrigger
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname.includes("/dashboard/inventory") &&
                      !location.pathname.includes("/dashboard/inventory-purchase") &&
                      !location.pathname.includes("/dashboard/inventory-receive")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Package className="w-4 h-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">Inventory</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            inventoryOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <Link
                      to="/dashboard/inventory/create"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/inventory/create"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {sidebarOpen && <span>Create</span>}
                    </Link>
                    <Link
                      to="/dashboard/inventory"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/inventory"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <List className="w-3 h-3" />
                      {sidebarOpen && <span>Get</span>}
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                {/* Inventory Purchase Sub-dropdown (NEW - separate from home page) */}
                <Collapsible open={inventoryPurchaseOpen} onOpenChange={setInventoryPurchaseOpen}>
                  <CollapsibleTrigger
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname.includes("/dashboard/inventory-purchase")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">Inventory Purchase</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            inventoryPurchaseOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <Link
                      to="/dashboard/inventory-purchase/create"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/inventory-purchase/create"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {sidebarOpen && <span>Create</span>}
                    </Link>
                    <Link
                      to="/dashboard/inventory-purchase"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/inventory-purchase"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <List className="w-3 h-3" />
                      {sidebarOpen && <span>Get</span>}
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                {/* Inventory Receive Sub-dropdown (NEW - separate from home page) */}
                <Collapsible open={inventoryReceiveOpen} onOpenChange={setInventoryReceiveOpen}>
                  <CollapsibleTrigger
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname.includes("/dashboard/inventory-receive")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <PackageCheck className="w-4 h-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">Inventory Receive</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            inventoryReceiveOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <Link
                      to="/dashboard/inventory-receive/create"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/inventory-receive/create"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {sidebarOpen && <span>Create</span>}
                    </Link>
                    <Link
                      to="/dashboard/inventory-receive"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/inventory-receive"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <List className="w-3 h-3" />
                      {sidebarOpen && <span>Get</span>}
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                {/* Issue Sub-dropdown */}
                <Collapsible open={issueOpen} onOpenChange={setIssueOpen}>
                  <CollapsibleTrigger
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname.includes("/dashboard/issue-orders")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Send className="w-4 h-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">Issue</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            issueOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <Link
                      to="/dashboard/issue-orders/create"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/issue-orders/create"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {sidebarOpen && <span>Create</span>}
                    </Link>
                    <Link
                      to="/dashboard/issue-orders"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/issue-orders"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <List className="w-3 h-3" />
                      {sidebarOpen && <span>Get</span>}
                    </Link>
                  </CollapsibleContent>
                </Collapsible>

                {/* Debit/Credit Sub-dropdown */}
                <Collapsible open={debitCreditOpen} onOpenChange={setDebitCreditOpen}>
                  <CollapsibleTrigger
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname.includes("/dashboard/debit-credit")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">Debit/Credit</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            debitCreditOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <Link
                      to="/dashboard/debit-credit/create"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/debit-credit/create"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {sidebarOpen && <span>Create</span>}
                    </Link>
                    <Link
                      to="/dashboard/debit-credit"
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        location.pathname === "/dashboard/debit-credit"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <List className="w-3 h-3" />
                      {sidebarOpen && <span>Get</span>}
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              </CollapsibleContent>
            </Collapsible>

            {/* Customers Link */}
            <Link
              to="/dashboard/customers"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname.includes("/dashboard/customers")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Customers</span>}
            </Link>

            {/* Bill Template Dropdown */}
            <Collapsible open={billTemplateOpen} onOpenChange={setBillTemplateOpen}>
              <CollapsibleTrigger
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname.includes("/dashboard/bill-template")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">Bill Template</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        billTemplateOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1 mt-1">
                <Link
                  to="/dashboard/bill-template/create"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === "/dashboard/bill-template/create"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {sidebarOpen && <span>Create</span>}
                </Link>
                <Link
                  to="/dashboard/bill-template"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === "/dashboard/bill-template"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                  {sidebarOpen && <span>Get</span>}
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Distributors Dropdown */}
            <Collapsible open={distributorsOpen} onOpenChange={setDistributorsOpen}>
              <CollapsibleTrigger
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname.includes("/dashboard/distributors")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Truck className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">Distributors</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        distributorsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1 mt-1">
                <Link
                  to="/dashboard/distributors/create"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === "/dashboard/distributors/create"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {sidebarOpen && <span>Create</span>}
                </Link>
                <Link
                  to="/dashboard/distributors"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === "/dashboard/distributors"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                  {sidebarOpen && <span>Get</span>}
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Statistics Link */}
            <Link
              to="/dashboard/statistics"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === "/dashboard/statistics"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Statistics</span>}
            </Link>

            {/* GST Reports Link */}
            <Link
              to="/dashboard/gst-reports"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname.includes("/dashboard/gst-reports")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>GST Reports</span>}
            </Link>
          </nav>

          <div className="absolute bottom-4 left-0 w-full px-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;