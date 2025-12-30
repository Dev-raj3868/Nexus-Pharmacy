import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parse, isWithinInterval } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface GstReportItem {
  id: string;
  invoiceNo: string;
  invoiceType: string;
  date: string;
  party: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

// Mock data for GST reports
const mockData: GstReportItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  invoiceNo: `INV${String(i + 1001).padStart(4, "0")}`,
  invoiceType: ["SALE", "PURCHASE", "RETURN"][i % 3],
  date: format(new Date(2025, Math.floor(i / 15), (i % 28) + 1), "yyyy-MM-dd"),
  party: `Party ${String.fromCharCode(65 + (i % 26))}`,
  taxableAmount: Math.floor(Math.random() * 50000) + 5000,
  cgst: Math.floor(Math.random() * 2000) + 200,
  sgst: Math.floor(Math.random() * 2000) + 200,
  igst: Math.floor(Math.random() * 1000) + 100,
  total: Math.floor(Math.random() * 60000) + 6000,
}));

const GstReportList = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const type = searchParams.get("type");
  const fromDateParam = searchParams.get("fromDate");
  const toDateParam = searchParams.get("toDate");
  const invoiceTypeParam = searchParams.get("invoiceType");
  const partyParam = searchParams.get("party");

  const filteredData = useMemo(() => {
    if (type === "all") return mockData;

    return mockData.filter((item) => {
      let matches = true;

      if (fromDateParam && toDateParam) {
        const itemDate = parse(item.date, "yyyy-MM-dd", new Date());
        const fromDate = parse(fromDateParam, "yyyy-MM-dd", new Date());
        const toDate = parse(toDateParam, "yyyy-MM-dd", new Date());
        matches = matches && isWithinInterval(itemDate, { start: fromDate, end: toDate });
      }

      if (invoiceTypeParam) {
        matches = matches && item.invoiceType.toLowerCase().includes(invoiceTypeParam.toLowerCase());
      }

      if (partyParam) {
        matches = matches && item.party.toLowerCase().includes(partyParam.toLowerCase());
      }

      return matches;
    });
  }, [type, fromDateParam, toDateParam, invoiceTypeParam, partyParam]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString("en-IN")}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages - 1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 2, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <DashboardLayout breadcrumbs={["GST Reports", "Results"]}>
      <div className="space-y-4">
        {/* Filter badges */}
        {type === "search" && (
          <div className="flex flex-wrap gap-2">
            {fromDateParam && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <CalendarIcon className="h-4 w-4" />
                {format(parse(fromDateParam, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")}(From)
              </Badge>
            )}
            {toDateParam && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <CalendarIcon className="h-4 w-4" />
                {format(parse(toDateParam, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")}(To)
              </Badge>
            )}
            {invoiceTypeParam && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <Filter className="h-4 w-4" />
                Invoice Type: {invoiceTypeParam}
              </Badge>
            )}
            {partyParam && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <Filter className="h-4 w-4" />
                Party: {partyParam}
              </Badge>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="font-medium text-foreground">Item Details</span>
          </div>
          <Table>
            <TableHeader className="bg-primary/10">
              <TableRow>
                <TableHead className="text-primary font-semibold">INVOICE NO</TableHead>
                <TableHead className="text-primary font-semibold">INVOICE TYPE</TableHead>
                <TableHead className="text-primary font-semibold">DATE</TableHead>
                <TableHead className="text-primary font-semibold">PARTY</TableHead>
                <TableHead className="text-primary font-semibold">TAXABLE AMOUNT</TableHead>
                <TableHead className="text-primary font-semibold">CGST</TableHead>
                <TableHead className="text-primary font-semibold">SGST</TableHead>
                <TableHead className="text-primary font-semibold">IGST</TableHead>
                <TableHead className="text-primary font-semibold">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.invoiceNo}</TableCell>
                    <TableCell>{item.invoiceType}</TableCell>
                    <TableCell>{format(parse(item.date, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{item.party}</TableCell>
                    <TableCell>{formatCurrency(item.taxableAmount)}</TableCell>
                    <TableCell>{formatCurrency(item.cgst)}</TableCell>
                    <TableCell>{formatCurrency(item.sgst)}</TableCell>
                    <TableCell>{formatCurrency(item.igst)}</TableCell>
                    <TableCell>{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2">...</span>
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GstReportList;
