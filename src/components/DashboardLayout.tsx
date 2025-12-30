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
  const [distributorsOpen, setDistributorsOpen] = useState(
    location.pathname.includes("/dashboard/distributors")
  );
  const [receiveOrdersOpen, setReceiveOrdersOpen] = useState(
    location.pathname.includes("/dashboard/receive-orders")
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

  const sidebarItems = [
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Package, label: "Inventory", path: "/dashboard/inventory" },
    { icon: Users, label: "Customers", path: "/dashboard/customers" },
    { icon: BarChart3, label: "Statistics", path: "/dashboard/statistics" },
    { icon: FileSpreadsheet, label: "GST Reports", path: "/dashboard/gst-reports" },
  ];

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
          {/* <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
            {profile?.pharmacy_name?.charAt(0) || "P"}
          </div> */}
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
            sidebarOpen ? "w-48" : "w-16"
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

          <nav className="px-3 space-y-1">
            {sidebarItems.slice(0, 3).map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}

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

            {/* Receive Orders Dropdown */}
            <Collapsible open={receiveOrdersOpen} onOpenChange={setReceiveOrdersOpen}>
              <CollapsibleTrigger
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname.includes("/dashboard/receive-orders")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Package className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">Receive Orders</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        receiveOrdersOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1 mt-1">
                <Link
                  to="/dashboard/receive-orders/create"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === "/dashboard/receive-orders/create"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {sidebarOpen && <span>Create</span>}
                </Link>
                <Link
                  to="/dashboard/receive-orders"
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === "/dashboard/receive-orders"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                  {sidebarOpen && <span>Get</span>}
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {sidebarItems.slice(3).map((item, index) => (
              <Link
                key={index + 3}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
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
