import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const GstReportSearch = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [invoiceType, setInvoiceType] = useState("");
  const [party, setParty] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", format(fromDate, "yyyy-MM-dd"));
    if (toDate) params.set("toDate", format(toDate, "yyyy-MM-dd"));
    if (invoiceType) params.set("invoiceType", invoiceType);
    if (party) params.set("party", party);
    params.set("type", "search");
    navigate(`/dashboard/gst-reports/list?${params.toString()}`);
  };

  const handleGetAll = () => {
    navigate("/dashboard/gst-reports/list?type=all");
  };

  return (
    <DashboardLayout breadcrumbs={["GST Reports"]}>
      <div className="max-w-4xl mx-auto pt-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* From Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "dd-MM-yyyy") : "(from) dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* To Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "dd-MM-yyyy") : "(To) dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Invoice Type */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Invoice Type"
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Party */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Party"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="link"
              onClick={handleGetAll}
              className="text-primary font-semibold px-0"
            >
              GET ALL
            </Button>
            <Button onClick={handleSearch} className="px-8">
              Search
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GstReportSearch;
