import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useSearchParams } from "react-router-dom";

interface Distributor {
  id: string;
  supplierName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  remark?: string;
}

const ITEMS_PER_PAGE = 15;

const DistributorList = () => {
  const [searchParams] = useSearchParams();
  const supplier = searchParams.get("supplier") || "";

  const [data, setData] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!supplier) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await window.context.getDistributors({
          supplierName: supplier,
        });

        setData(results || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch distributors");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supplier]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginated = data.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout breadcrumbs={["Distributor", "List"]}>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium">
            Results for: <b>{supplier}</b>
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No results found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.supplierName}</TableCell>
                    <TableCell>{d.phoneNumber}</TableCell>
                    <TableCell>{d.email || "-"}</TableCell>
                    <TableCell>{d.address}</TableCell>
                    <TableCell>{d.remark || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="px-2 text-sm">
                  {page} / {totalPages}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DistributorList;
