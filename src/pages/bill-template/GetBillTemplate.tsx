import { useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, FileText, Pencil, Printer } from "lucide-react";
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

const GetBillTemplate = () => {
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
  setLoading(true)
  setSearched(true)

  try {
    const data = await window.context.getInvoices({
      billId: searchId,
      patientName,
      phoneNumber,
      billDate: searchDate
        ? format(searchDate, 'yyyy-MM-dd')
        : undefined
    })

    setBills(data || [])
    setCurrentPage(1)
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.message || 'Failed to fetch bills',
      variant: 'destructive'
    })
    setBills([])
  } finally {
    setLoading(false)
  }
}

  const handleViewBill = async (bill: Bill) => {
  const fullBill = await window.context.getInvoiceById(bill.id)
  setSelectedBill({ ...bill, ...fullBill })
  setDetailOpen(true)
}


  const filteredBills = searchPatientFilter
    ? bills.filter((bill) =>
        bill.patient_name.toLowerCase().includes(searchPatientFilter.toLowerCase())
      )
    : bills;

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout breadcrumbs={["Bill Template", "Get"]}>
      {/* Search Form */}
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
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      {searched && (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground px-3 py-1 bg-muted rounded">Bill List</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search Patient Name"
                  value={searchPatientFilter}
                  onChange={(e) => setSearchPatientFilter(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#e8f5e9]">
                <TableHead className="text-foreground font-semibold">BILL ID</TableHead>
                <TableHead className="text-foreground font-semibold">PATIENT NAME</TableHead>
                <TableHead className="text-foreground font-semibold">PHONE NUMBER</TableHead>
                <TableHead className="text-foreground font-semibold">TOTAL AMOUNT</TableHead>
                <TableHead className="text-foreground font-semibold">PAYMENT STATUS</TableHead>
                <TableHead className="text-foreground font-semibold">BILL DATE</TableHead>
                <TableHead className="text-foreground font-semibold">BILL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No bills found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.bill_number}</TableCell>
                    <TableCell>{bill.patient_name}</TableCell>
                    <TableCell>{bill.patient_phone || "-"}</TableCell>
                    <TableCell>₹{bill.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        bill.payment_status === "Paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {bill.payment_status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(bill.bill_date), "dd-MM-yyyy")}</TableCell>
                    <TableCell>
                      <button 
                        className="text-primary hover:text-primary/80"
                        onClick={() => handleViewBill(bill)}
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-primary"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {totalPages > 3 && (
                    <>
                      <PaginationItem>
                        <span className="px-2">...</span>
                      </PaginationItem>
                      {Array.from({ length: 3 }, (_, i) => totalPages - 2 + i).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-primary"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Bill Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBill && (
            <>
              <div ref={printRef} className="p-8 bg-white text-black">
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Logo />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">{profile?.pharmacy_name || "Pharmacy Name"}</h1>
                      <p className="text-sm text-gray-600">{profile?.pharmacy_address || "Address"}</p>
                      <p className="text-sm">GSTIN: {profile?.pharmacy_gst_number || "XXXXXXXX"}</p>
                      <p className="text-sm">FSSAI: {profile?.fssai_id || "XXXXXXXX"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">INVOICE</p>
                    <p className="text-sm">Bill No: {selectedBill.bill_number}</p>
                    <p className="text-sm">Date: {format(new Date(selectedBill.bill_date), "dd/MM/yyyy")}</p>
                  </div>
                </div>

                {/* Drug License */}
                <div className="mb-4 text-sm">
                  <p>DL No: {profile?.dl_no || "XXXXXXXX"}</p>
                </div>

                {/* Patient Information */}
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Patient Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Name: {selectedBill.patient_name}</p>
                    <p>Phone: {selectedBill.patient_phone || "-"}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="flex justify-end mb-4">
                  <div className="w-64 text-sm">
                    <div className="flex justify-between py-1 font-bold border-t">
                      <span>Total:</span>
                      <span>₹{selectedBill.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Payment Status:</span>
                      <span>{selectedBill.payment_status}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t text-sm">
                  <div className="flex justify-end">
                    <div className="text-center">
                      <div className="w-32 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handlePrint()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GetBillTemplate;
