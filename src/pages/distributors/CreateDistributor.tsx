import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface DistributorRow {
  id: string;
  supplier_name: string;
  phone_number: string;
  email: string;
  address: string;
  remark: string;
}

const CreateDistributor = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    supplier_name: "",
    phone_number: "",
    email: "",
    address: "",
    remark: "",
  });

  const [distributors, setDistributors] = useState<DistributorRow[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addDistributor = () => {
    if (!formData.supplier_name || !formData.phone_number || !formData.address) {
      toast.error("Please fill in Supplier Name, Phone Number, and Address");
      return;
    }

    const newDistributor: DistributorRow = {
      id: crypto.randomUUID(),
      ...formData,
    };

    setDistributors((prev) => [...prev, newDistributor]);
    setFormData({
      supplier_name: "",
      phone_number: "",
      email: "",
      address: "",
      remark: "",
    });
  };

  const removeDistributor = (id: string) => {
    setDistributors((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please login to save distributors");
      return;
    }

    if (distributors.length === 0) {
      toast.error("Please add at least one distributor");
      return;
    }

    setSaving(true);
    try {
      const distributorsToInsert = distributors.map((d) => ({
        user_id: user.id,
        supplier_name: d.supplier_name,
        phone_number: d.phone_number,
        email: d.email || null,
        address: d.address,
        remark: d.remark || null,
      }));

      const { error } = await supabase.from("distributors").insert(distributorsToInsert);
      if (error) throw error;

      setSaved(true);
      toast.success("Details saved successfully!");

      // ⛔ NO REDIRECT, NO NAVIGATION
      // stays on same page

    } catch (error: any) {
      toast.error(error.message || "Failed to save distributors");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={["Distributor", "Create"]}>
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="border-b border-border pb-4 mb-6">
          <h2 className="text-lg font-medium text-foreground">Distributor Information</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-foreground">Distributor Details</h3>
            <Button
              variant="link"
              size="sm"
              onClick={addDistributor}
              className="text-primary p-0 h-auto"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Supplier Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Lorem"
                value={formData.supplier_name}
                onChange={(e) => handleInputChange("supplier_name", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="XXXXXX"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input
                placeholder="Lorem@gmail.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="lorem"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Remark</Label>
              <Input
                placeholder="loremm"
                value={formData.remark}
                onChange={(e) => handleInputChange("remark", e.target.value)}
                className="bg-muted/30"
              />
            </div>
          </div>

          {distributors.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground mb-3">Distributor Details</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead className="text-xs font-semibold text-primary uppercase">
                        Supplier Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-primary uppercase">
                        Phone Number
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-primary uppercase">
                        Email
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-primary uppercase">
                        Address
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-primary uppercase">
                        Remark
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributors.map((distributor) => (
                      <TableRow key={distributor.id}>
                        <TableCell className="text-sm">{distributor.supplier_name}</TableCell>
                        <TableCell className="text-sm">{distributor.phone_number}</TableCell>
                        <TableCell className="text-sm">{distributor.email}</TableCell>
                        <TableCell className="text-sm">{distributor.address}</TableCell>
                        <TableCell className="text-sm">{distributor.remark}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDistributor(distributor.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className={saved ? "bg-green-600 text-white" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : saving ? (
                "Saving..."
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateDistributor;
