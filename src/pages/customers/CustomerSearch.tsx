import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CustomerSearch = () => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (customerName) params.set("name", customerName);
    if (phoneNumber) params.set("phone", phoneNumber);
    navigate(`/dashboard/customers/list?${params.toString()}`);
  };

  return (
    <DashboardLayout breadcrumbs={["Customer", "Search"]}>
      <div className="max-w-xl">
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Customer Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerSearch;
