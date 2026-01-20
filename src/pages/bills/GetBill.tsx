import { useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import Logo from "@/components/Logo";

interface Bill {
  id: string;
  bill_number: string;
  patient_name: string;
  patient_phone: string | null;
  total_amount: number;
  payment_status: string;
  bill_date: string;
  created_at: string;
}

const GetBill = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [searchId, setSearchId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchDate, setSearchDate] = useState<Date | undefined>();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPatientFilter, setSearchPatientFilter] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 14;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleSearch = async () => {
    if (!user) return;

    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from("bills")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (searchId.trim()) {
        query = query.ilike("bill_number", `%${searchId}%`);
      }
      if (patientName.trim()) {
        query = query.ilike("patient_name", `%${patientName}%`);
      }
      if (phoneNumber.trim()) {
        query = query.ilike("patient_phone", `%${phoneNumber}%`);
      }
      if (searchDate) {
        query = query.eq("bill_date", format(searchDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch bills",
          variant: "destructive",
        });
      } else {
        setBills(data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter((bill) =>
    bill.patient_name.toLowerCase().includes(searchPatientFilter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailOpen(true);
  };

  const handleReset = () => {
    setSearchId("");
    setPatientName("");
    setPhoneNumber("");
    setSearchDate(undefined);
    setBills([]);
    setSearched(false);
    setCurrentPage(1);
    setSearchPatientFilter("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Get Bills</h1>
        </div>

        {/* Search Filters */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Bill ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !searchDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchDate ? format(searchDate, "dd-MM-yy") : "DD-MM-YY"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={searchDate}
                onSelect={setSearchDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

        {/* Results */}
        {searched && (
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
              {filteredBills.length > 0 && (
                <Input
                  placeholder="Filter by patient name..."
                  value={searchPatientFilter}
                  onChange={(e) => setSearchPatientFilter(e.target.value)}
                  className="max-w-xs"
                />
              )}
            </div>

            {filteredBills.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bills found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill Number</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Bill Date</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.bill_number}</TableCell>
                          <TableCell>{bill.patient_name}</TableCell>
                          <TableCell>{bill.patient_phone || "-"}</TableCell>
                          <TableCell>{format(new Date(bill.bill_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>₹{bill.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                bill.payment_status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : bill.payment_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              )}
                            >
                              {bill.payment_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(bill)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Bill Details Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div ref={printRef} className="space-y-6">
              {selectedBill && (
                <>
                  <div className="text-center">
                    <Logo />
                    <h2 className="text-xl font-bold mt-4">Bill Details</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Bill Information</h3>
                      <p><strong>Bill Number:</strong> {selectedBill.bill_number}</p>
                      <p><strong>Bill Date:</strong> {format(new Date(selectedBill.bill_date), "dd/MM/yyyy")}</p>
                      <p><strong>Payment Status:</strong> {selectedBill.payment_status}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Patient Information</h3>
                      <p><strong>Name:</strong> {selectedBill.patient_name}</p>
                      <p><strong>Phone:</strong> {selectedBill.patient_phone || "N/A"}</p>
                    </div>
                  </div>

                  {/* Bill items would go here - simplified for now */}
                  <div className="text-center">
                    <p className="text-lg font-semibold">Total Amount: ₹{selectedBill.total_amount.toFixed(2)}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handlePrint()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GetBill;
