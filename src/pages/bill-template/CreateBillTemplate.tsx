import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useReactToPrint } from "react-to-print";

interface FieldConfig {
  enabled: boolean;
  value?: string;
}

interface BillTemplateConfig {
  templateName: string;
  pharmacyEnabled: boolean;
  logo: FieldConfig & { file?: File };
  address: FieldConfig;
  fssai: FieldConfig;
  gstin: FieldConfig;
  drugLicenseEnabled: boolean;
  dlNumber1: FieldConfig;
  dlNumber2: FieldConfig;
  patientEnabled: boolean;
  patientName: FieldConfig;
  phoneNumber: FieldConfig;
  age: FieldConfig;
  gender: FieldConfig;
  patientAddress: FieldConfig;
  doctorName: FieldConfig;
  itemEnabled: boolean;
  itemName: FieldConfig;
  quantity: FieldConfig;
  hsn: FieldConfig;
  batch: FieldConfig;
  expiry: FieldConfig;
  mrp: FieldConfig;
  gstPercent: FieldConfig;
  discount: FieldConfig;
  total: FieldConfig;
  gstEnabled: boolean;
  gstPercentInfo: FieldConfig;
  taxAmount: FieldConfig;
  cgst: FieldConfig;
  sgst: FieldConfig;
  totalGst: FieldConfig;
  paymentEnabled: boolean;
  amountPaid: FieldConfig;
  paymentMethod: FieldConfig;
  paymentStatus: FieldConfig;
  totalDiscount: FieldConfig;
  totalBill: FieldConfig;
  outstandingAmount: FieldConfig;
  declarationEnabled: boolean;
  signature: FieldConfig & { file?: File };
  termsAndConditions: FieldConfig;
  remark: FieldConfig;
}

const CreateBillTemplate = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const [config, setConfig] = useState<BillTemplateConfig>({
    templateName: "",
    pharmacyEnabled: true,
    logo: { enabled: true },
    address: { enabled: true, value: "" },
    fssai: { enabled: true },
    gstin: { enabled: true },
    drugLicenseEnabled: true,
    dlNumber1: { enabled: true, value: "" },
    dlNumber2: { enabled: true, value: "" },
    patientEnabled: true,
    patientName: { enabled: true },
    phoneNumber: { enabled: true },
    age: { enabled: true },
    gender: { enabled: true },
    patientAddress: { enabled: true },
    doctorName: { enabled: false },
    itemEnabled: true,
    itemName: { enabled: true },
    quantity: { enabled: true },
    hsn: { enabled: true },
    batch: { enabled: false },
    expiry: { enabled: true },
    mrp: { enabled: true },
    gstPercent: { enabled: true },
    discount: { enabled: true },
    total: { enabled: true },
    gstEnabled: false,
    gstPercentInfo: { enabled: false },
    taxAmount: { enabled: false },
    cgst: { enabled: false },
    sgst: { enabled: false },
    totalGst: { enabled: false },
    paymentEnabled: true,
    amountPaid: { enabled: true },
    paymentMethod: { enabled: false },
    paymentStatus: { enabled: false },
    totalDiscount: { enabled: true },
    totalBill: { enabled: true },
    outstandingAmount: { enabled: true },
    declarationEnabled: true,
    signature: { enabled: true },
    termsAndConditions: { enabled: true, value: "" },
    remark: { enabled: true, value: "" },
  });

  const updateField = (fieldPath: string, value: boolean | string | File) => {
    setConfig((prev) => {
      const keys = fieldPath.split(".");
      const newConfig = { ...prev };
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      const lastKey = keys[keys.length - 1];
      if (typeof value === "boolean" && lastKey === "enabled") {
        current.enabled = value;
      } else if (lastKey === "value") {
        current.value = value as string;
      } else if (lastKey === "file") {
        current.file = value as File;
      } else {
        current[lastKey] = value;
      }
      
      return newConfig;
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a template",
        variant: "destructive",
      });
      return;
    }

    if (!config.templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("bill_templates").insert({
        user_id: user.id,
        template_name: config.templateName,
        pharmacy_enabled: config.pharmacyEnabled,
        drug_license_enabled: config.drugLicenseEnabled,
        patient_enabled: config.patientEnabled,
        item_enabled: config.itemEnabled,
        gst_enabled: config.gstEnabled,
        payment_enabled: config.paymentEnabled,
        declaration_enabled: config.declarationEnabled,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bill template saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const ToggleField = ({ 
    label, 
    enabled, 
    onToggle,
    showInput = false,
    inputValue = "",
    onInputChange,
    showUpload = false,
    fileName = "",
    onUpload,
  }: {
    label: string;
    enabled: boolean;
    onToggle: (val: boolean) => void;
    showInput?: boolean;
    inputValue?: string;
    onInputChange?: (val: string) => void;
    showUpload?: boolean;
    fileName?: string;
    onUpload?: (file: File) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium min-w-[120px]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${!enabled ? "text-foreground" : "text-muted-foreground"}`}>Disable</span>
          <Switch checked={enabled} onCheckedChange={onToggle} />
          <span className={`text-xs ${enabled ? "text-foreground" : "text-muted-foreground"}`}>Enable</span>
        </div>
      </div>
      {showInput && enabled && (
        <Input
          value={inputValue}
          onChange={(e) => onInputChange?.(e.target.value)}
          placeholder="Lorem Ipsum is simply dummy text"
          className="max-w-xs"
        />
      )}
      {showUpload && enabled && (
        <div className="flex items-center gap-2">
          <Label htmlFor={`upload-${label}`} className="cursor-pointer">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary rounded-md text-sm hover:bg-primary/5">
              <Upload className="w-4 h-4" />
              Upload
            </div>
          </Label>
          <input
            id={`upload-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUpload?.(e.target.files[0]);
              }
            }}
          />
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm">
              <FileText className="w-4 h-4" />
              <span>{fileName}</span>
              <span className="text-xs text-muted-foreground">200 KB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const SectionHeader = ({ 
    title, 
    enabled, 
    onToggle 
  }: { 
    title: string; 
    enabled: boolean; 
    onToggle: (val: boolean) => void;
  }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-t-lg border-b border-border">
      <span className="font-semibold">{title}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${!enabled ? "text-foreground" : "text-muted-foreground"}`}>Disable</span>
        <Switch checked={enabled} onCheckedChange={onToggle} />
        <span className={`text-xs ${enabled ? "text-foreground" : "text-muted-foreground"}`}>Enable</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout breadcrumbs={["Bill Template", "Create"]}>
      <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
        <span>Bill Template</span>
        <span>›</span>
        <span className="text-foreground font-medium">Create</span>
      </div>

      {/* Template Name Input */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
        <div className="p-6">
          <Label htmlFor="templateName" className="font-semibold">Template Name</Label>
          <Input
            id="templateName"
            value={config.templateName}
            onChange={(e) => setConfig((prev) => ({ ...prev, templateName: e.target.value }))}
            placeholder="Enter template name"
            className="mt-2 max-w-md"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Pharmacy Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="Pharmacy Information"
            enabled={config.pharmacyEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, pharmacyEnabled: val }))}
          />
          {config.pharmacyEnabled && (
            <div className="p-6 grid grid-cols-3 gap-6">
              <ToggleField
                label="Logo"
                enabled={config.logo.enabled}
                onToggle={(val) => updateField("logo.enabled", val)}
                showUpload
                fileName={config.logo.file?.name}
                onUpload={(file) => updateField("logo.file", file)}
              />
              <ToggleField
                label="Address"
                enabled={config.address.enabled}
                onToggle={(val) => updateField("address.enabled", val)}
                showInput
                inputValue={config.address.value}
                onInputChange={(val) => updateField("address.value", val)}
              />
              <ToggleField
                label="FSSAI"
                enabled={config.fssai.enabled}
                onToggle={(val) => updateField("fssai.enabled", val)}
              />
              <ToggleField
                label="GSTIN"
                enabled={config.gstin.enabled}
                onToggle={(val) => updateField("gstin.enabled", val)}
              />
            </div>
          )}
        </div>

        {/* Drug License Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="Drug License Information"
            enabled={config.drugLicenseEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, drugLicenseEnabled: val }))}
          />
          {config.drugLicenseEnabled && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-medium">DL Number</span>
                <button className="text-primary text-sm">Add</button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <ToggleField
                  label="DL Number 1"
                  enabled={config.dlNumber1.enabled}
                  onToggle={(val) => updateField("dlNumber1.enabled", val)}
                  showInput
                  inputValue={config.dlNumber1.value}
                  onInputChange={(val) => updateField("dlNumber1.value", val)}
                />
                <ToggleField
                  label="DL Number 2"
                  enabled={config.dlNumber2.enabled}
                  onToggle={(val) => updateField("dlNumber2.enabled", val)}
                  showInput
                  inputValue={config.dlNumber2.value}
                  onInputChange={(val) => updateField("dlNumber2.value", val)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Patient Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="Patient Information"
            enabled={config.patientEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, patientEnabled: val }))}
          />
          {config.patientEnabled && (
            <div className="p-6 grid grid-cols-3 gap-6">
              <ToggleField label="Patient Name" enabled={config.patientName.enabled} onToggle={(val) => updateField("patientName.enabled", val)} />
              <ToggleField label="Phone Number" enabled={config.phoneNumber.enabled} onToggle={(val) => updateField("phoneNumber.enabled", val)} />
              <ToggleField label="Age" enabled={config.age.enabled} onToggle={(val) => updateField("age.enabled", val)} />
              <ToggleField label="Gender" enabled={config.gender.enabled} onToggle={(val) => updateField("gender.enabled", val)} />
              <ToggleField label="Address" enabled={config.patientAddress.enabled} onToggle={(val) => updateField("patientAddress.enabled", val)} />
              <ToggleField label="Doctor Name" enabled={config.doctorName.enabled} onToggle={(val) => updateField("doctorName.enabled", val)} />
            </div>
          )}
        </div>

        {/* Item Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="Item Information"
            enabled={config.itemEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, itemEnabled: val }))}
          />
          {config.itemEnabled && (
            <div className="p-6 grid grid-cols-3 gap-6">
              <ToggleField label="Item Name" enabled={config.itemName.enabled} onToggle={(val) => updateField("itemName.enabled", val)} />
              <ToggleField label="Quantity" enabled={config.quantity.enabled} onToggle={(val) => updateField("quantity.enabled", val)} />
              <ToggleField label="HSN" enabled={config.hsn.enabled} onToggle={(val) => updateField("hsn.enabled", val)} />
              <ToggleField label="Batch" enabled={config.batch.enabled} onToggle={(val) => updateField("batch.enabled", val)} />
              <ToggleField label="Expiry" enabled={config.expiry.enabled} onToggle={(val) => updateField("expiry.enabled", val)} />
              <ToggleField label="MRP" enabled={config.mrp.enabled} onToggle={(val) => updateField("mrp.enabled", val)} />
              <ToggleField label="GST %" enabled={config.gstPercent.enabled} onToggle={(val) => updateField("gstPercent.enabled", val)} />
              <ToggleField label="Discount" enabled={config.discount.enabled} onToggle={(val) => updateField("discount.enabled", val)} />
              <ToggleField label="Total" enabled={config.total.enabled} onToggle={(val) => updateField("total.enabled", val)} />
            </div>
          )}
        </div>

        {/* GST Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="GST Information"
            enabled={config.gstEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, gstEnabled: val }))}
          />
          {config.gstEnabled && (
            <div className="p-6 grid grid-cols-3 gap-6">
              <ToggleField label="GST%" enabled={config.gstPercentInfo.enabled} onToggle={(val) => updateField("gstPercentInfo.enabled", val)} />
              <ToggleField label="Tax Amount" enabled={config.taxAmount.enabled} onToggle={(val) => updateField("taxAmount.enabled", val)} />
              <ToggleField label="CGST" enabled={config.cgst.enabled} onToggle={(val) => updateField("cgst.enabled", val)} />
              <ToggleField label="SGST" enabled={config.sgst.enabled} onToggle={(val) => updateField("sgst.enabled", val)} />
              <ToggleField label="Total GST" enabled={config.totalGst.enabled} onToggle={(val) => updateField("totalGst.enabled", val)} />
            </div>
          )}
        </div>

        {/* Payment Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="Payment Information"
            enabled={config.paymentEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, paymentEnabled: val }))}
          />
          {config.paymentEnabled && (
            <div className="p-6 grid grid-cols-3 gap-6">
              <ToggleField label="Amount Paid" enabled={config.amountPaid.enabled} onToggle={(val) => updateField("amountPaid.enabled", val)} />
              <ToggleField label="Payment Method" enabled={config.paymentMethod.enabled} onToggle={(val) => updateField("paymentMethod.enabled", val)} />
              <ToggleField label="Payment Status" enabled={config.paymentStatus.enabled} onToggle={(val) => updateField("paymentStatus.enabled", val)} />
              <ToggleField label="Total Discount" enabled={config.totalDiscount.enabled} onToggle={(val) => updateField("totalDiscount.enabled", val)} />
              <ToggleField label="Total Bill" enabled={config.totalBill.enabled} onToggle={(val) => updateField("totalBill.enabled", val)} />
              <ToggleField label="Outstanding Amount" enabled={config.outstandingAmount.enabled} onToggle={(val) => updateField("outstandingAmount.enabled", val)} />
            </div>
          )}
        </div>

        {/* Declaration Information */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <SectionHeader
            title="Declaration Information"
            enabled={config.declarationEnabled}
            onToggle={(val) => setConfig((prev) => ({ ...prev, declarationEnabled: val }))}
          />
          {config.declarationEnabled && (
            <div className="p-6 grid grid-cols-3 gap-6">
              <ToggleField
                label="Signature"
                enabled={config.signature.enabled}
                onToggle={(val) => updateField("signature.enabled", val)}
                showUpload
                fileName={config.signature.file?.name}
                onUpload={(file) => updateField("signature.file", file)}
              />
              <ToggleField
                label="Terms and Conditions"
                enabled={config.termsAndConditions.enabled}
                onToggle={(val) => updateField("termsAndConditions.enabled", val)}
                showInput
                inputValue={config.termsAndConditions.value}
                onInputChange={(val) => updateField("termsAndConditions.value", val)}
              />
              <ToggleField
                label="Remark"
                enabled={config.remark.enabled}
                onToggle={(val) => updateField("remark.enabled", val)}
                showInput
                inputValue={config.remark.value}
                onInputChange={(val) => updateField("remark.value", val)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div ref={printRef} className="p-8 bg-white text-black">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-4">
                {config.pharmacyEnabled && config.logo.enabled && (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Logo />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold">{profile?.pharmacy_name || "Pharmacy Name"}</h1>
                  {config.pharmacyEnabled && config.address.enabled && (
                    <p className="text-sm text-gray-600">{profile?.pharmacy_address || "Address"}</p>
                  )}
                  {config.pharmacyEnabled && config.gstin.enabled && (
                    <p className="text-sm">GSTIN: {profile?.pharmacy_gst_number || "XXXXXXXX"}</p>
                  )}
                  {config.pharmacyEnabled && config.fssai.enabled && (
                    <p className="text-sm">FSSAI: {profile?.fssai_id || "XXXXXXXX"}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">INVOICE</p>
                <p className="text-sm">Bill No: XXXX</p>
                <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Drug License */}
            {config.drugLicenseEnabled && (
              <div className="mb-4 text-sm">
                <p>DL No: {config.dlNumber1.value || profile?.dl_no || "XXXXXXXX"}</p>
              </div>
            )}

            {/* Patient Information */}
            {config.patientEnabled && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Patient Details</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {config.patientName.enabled && <p>Name: LOREM IPSUM</p>}
                  {config.phoneNumber.enabled && <p>Phone: +91XXXXXXXXXX</p>}
                  {config.age.enabled && <p>Age: XX</p>}
                  {config.gender.enabled && <p>Gender: Male</p>}
                  {config.patientAddress.enabled && <p>Address: Lorem Ipsum</p>}
                  {config.doctorName.enabled && <p>Doctor: Dr. Lorem</p>}
                </div>
              </div>
            )}

            {/* Items Table */}
            {config.itemEnabled && (
              <table className="w-full mb-4 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">S.No</th>
                    {config.itemName.enabled && <th className="p-2 text-left">Item Name</th>}
                    {config.batch.enabled && <th className="p-2 text-left">Batch</th>}
                    {config.expiry.enabled && <th className="p-2 text-left">Expiry</th>}
                    {config.quantity.enabled && <th className="p-2 text-left">Qty</th>}
                    {config.mrp.enabled && <th className="p-2 text-left">MRP</th>}
                    {config.gstPercent.enabled && <th className="p-2 text-left">GST%</th>}
                    {config.discount.enabled && <th className="p-2 text-left">Disc</th>}
                    {config.total.enabled && <th className="p-2 text-left">Total</th>}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{i}</td>
                      {config.itemName.enabled && <td className="p-2">Item {i}</td>}
                      {config.batch.enabled && <td className="p-2">B00{i}</td>}
                      {config.expiry.enabled && <td className="p-2">12/2025</td>}
                      {config.quantity.enabled && <td className="p-2">10</td>}
                      {config.mrp.enabled && <td className="p-2">₹100</td>}
                      {config.gstPercent.enabled && <td className="p-2">18%</td>}
                      {config.discount.enabled && <td className="p-2">5%</td>}
                      {config.total.enabled && <td className="p-2">₹1000</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* GST Information */}
            {config.gstEnabled && (
              <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                <h3 className="font-semibold mb-2">GST Details</h3>
                <div className="grid grid-cols-3 gap-2">
                  {config.cgst.enabled && <p>CGST: ₹XXX</p>}
                  {config.sgst.enabled && <p>SGST: ₹XXX</p>}
                  {config.totalGst.enabled && <p>Total GST: ₹XXX</p>}
                </div>
              </div>
            )}

            {/* Payment Information */}
            {config.paymentEnabled && (
              <div className="flex justify-end mb-4">
                <div className="w-64 text-sm">
                  {config.totalDiscount.enabled && (
                    <div className="flex justify-between py-1">
                      <span>Total Discount:</span>
                      <span>₹XXX</span>
                    </div>
                  )}
                  {config.totalBill.enabled && (
                    <div className="flex justify-between py-1 font-bold border-t">
                      <span>Total:</span>
                      <span>₹XXXX</span>
                    </div>
                  )}
                  {config.amountPaid.enabled && (
                    <div className="flex justify-between py-1">
                      <span>Amount Paid:</span>
                      <span>₹XXXX</span>
                    </div>
                  )}
                  {config.outstandingAmount.enabled && (
                    <div className="flex justify-between py-1">
                      <span>Outstanding:</span>
                      <span>₹0</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Declaration */}
            {config.declarationEnabled && (
              <div className="mt-8 pt-4 border-t text-sm">
                {config.termsAndConditions.enabled && config.termsAndConditions.value && (
                  <p className="text-xs text-gray-600 mb-4">{config.termsAndConditions.value}</p>
                )}
                {config.remark.enabled && config.remark.value && (
                  <p className="text-xs text-gray-600 mb-4">Remark: {config.remark.value}</p>
                )}
                {config.signature.enabled && (
                  <div className="flex justify-end">
                    <div className="text-center">
                      <div className="w-32 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs">Authorized Signature</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handlePrint()}>Print</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreateBillTemplate;
