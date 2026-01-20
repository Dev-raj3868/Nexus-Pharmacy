import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isValid } from "date-fns";

const safeFormat = (
  value?: number,
  pattern: string = "dd-MM-yyyy"
) => {
  if (!value) return "-";
  const d = new Date(value);
  return isValid(d) ? format(d, pattern) : "-";
};

interface DebitCreditNote {
  id: string;
  note_id: string;
  note_type: string;
  issue_date: number;        // ✅ timestamp
  purchase_order_id: string | null;
  reason: string | null;
  received_id: string | null;
  total: number;
  vendor_name: string | null;
  createdAt: number;         // ✅ timestamp
  updatedAt: number;
  items?: DebitCreditItem[];
}

interface DebitCreditItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  price: number;
  batch_no: string | null;
  gst: string | null;
  reason: string | null;
  category: string | null;
}

const GetDebitCredit = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [notes, setNotes] = useState<DebitCreditNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<DebitCreditNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [searchNoteId, setSearchNoteId] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail modal
  const [selectedNote, setSelectedNote] = useState<DebitCreditNote | null>(null);
  const [selectedItems, setSelectedItems] = useState<DebitCreditItem[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

 useEffect(() => {
  fetchNotes();
}, []);

  const fetchNotes = async () => {
    if (!user) return;

    setLoading(true);
    try {
    const data = await window.context.getCreditDebitNotes();

setNotes(data);
setFilteredNotes(data);

      setNotes(data || []);
      setFilteredNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch debit/credit notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = [...notes];

    if (searchNoteId) {
      filtered = filtered.filter((note) =>
        note.note_id.toLowerCase().includes(searchNoteId.toLowerCase())
      );
    }

if (fromDate) {
  filtered = filtered.filter(
    (note) => note.issue_date && new Date(note.issue_date) >= fromDate
  );
}

   if (toDate) {
  filtered = filtered.filter(
    (note) => note.issue_date && new Date(note.issue_date) <= toDate
  );
}


    setFilteredNotes(filtered);
    setCurrentPage(1);
  };

 const openDetailModal = (note: DebitCreditNote & { items?: DebitCreditItem[] }) => {
  setSelectedNote(note);
  setSelectedItems(note.items || []);
  setDetailModalOpen(true);
};


  // Pagination logic
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotes = filteredNotes.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  return (
    <DashboardLayout breadcrumbs={["Inventory Mgmt", "Debit/Credit", "Get"]}>
      <div className="space-y-6">
        {/* Search Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Note ID"
                    value={searchNoteId}
                    onChange={(e) => setSearchNoteId(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="min-w-[180px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "dd-MM-yyyy") : "(from) dd-mm-yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="min-w-[180px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "dd-MM-yyyy") : "(To) dd-mm-yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Debit Credit Details</h3>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No debit/credit notes found
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-primary">NOTE ID</TableHead>
                        <TableHead className="text-primary">NOTE TYPE</TableHead>
                        <TableHead className="text-primary">REASON</TableHead>
                        <TableHead className="text-primary">TOTAL</TableHead>
                        <TableHead className="text-primary">VENDOR NAME</TableHead>
                        <TableHead className="text-primary">CREATED AT</TableHead>
                        <TableHead className="text-primary">CREATED BY</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentNotes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell>{note.note_id}</TableCell>
                          <TableCell>{note.note_type}</TableCell>
                          <TableCell>{note.reason || "-"}</TableCell>
                          <TableCell>{note.total}</TableCell>
                          <TableCell>{note.vendor_name || "-"}</TableCell>
                          <TableCell>
                           <TableCell>
  {safeFormat(note.createdAt, "HH:mm")}
</TableCell>

                          </TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetailModal(note)}
                            >
                              <FileText className="w-4 h-4 text-primary" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={idx} className="px-2">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={idx}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                # {selectedNote?.note_id}
              </DialogTitle>
            </DialogHeader>

            {selectedNote && (
              <div className="space-y-6">
                {/* Item Details Section */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-4">Item Details</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Received ID</p>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          {selectedNote.received_id || "-"}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          Pending
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Status</p>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          Pending
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Note ID</p>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          {selectedNote.note_id}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Note Type</p>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          {selectedNote.note_type}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vendor Name</p>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          {selectedNote.vendor_name || "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items Table */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-4">Item Details</h4>

                    {selectedItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No items found
                      </p>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-[#e8f5e9]">
                            <TableRow>
                              <TableHead>ITEM ID</TableHead>
                              <TableHead>ITEM NAME</TableHead>
                              <TableHead>CATEGORY</TableHead>
                              <TableHead>UNIT</TableHead>
                              <TableHead>RECEIVED QUANTITY</TableHead>
                              <TableHead>BATCH NO</TableHead>
                              <TableHead>PRICE PER QUANTITY</TableHead>
                              <TableHead>GST</TableHead>
                              <TableHead>REMARK</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.id.slice(0, 7)}</TableCell>
                                <TableCell>{item.item_name}</TableCell>
                                <TableCell>{item.category || "-"}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.batch_no || "-"}</TableCell>
                                <TableCell>₹{item.price}</TableCell>
                                <TableCell>{item.gst || "-"}</TableCell>
                                <TableCell>{item.reason || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GetDebitCredit;