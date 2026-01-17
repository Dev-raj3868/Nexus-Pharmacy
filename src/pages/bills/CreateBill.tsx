import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PatientInfo {
  name: string;
  gender: string;
  phone: string;
  age: string;
  address: string;
}

interface ItemInfo {
  id: string;
  itemName: string;
  category: string;
  doctor: string;
  billDate: string;
  billTime: string;
  discountPercent: string;
  discountAmount: string;
  recommendedBy: string;
  price: string;
  quantity: string;
  unit: string;
  batchNo: string;
  gst: string;
}

interface PaymentInfo {
  amountPaid: string;
  paymentMethod: string;
  totalDiscount: string;
  totalBill: string;
  outstandingAmount: string;
}

const CreateBill = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipId, setMembershipId] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdBillNumber, setCreatedBillNumber] = useState("");

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Patient Information
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "",
    gender: "",
    phone: "",
    age: "",
    address: "",
  });
  const [patientList, setPatientList] = useState<PatientInfo[]>([]);

  // Item Information
  const [itemInfo, setItemInfo] = useState<ItemInfo>({
    id: "",
    itemName: "",
    category: "",
    doctor: "",
    billDate: "",
    billTime: "",
    discountPercent: "",
    discountAmount: "",
    recommendedBy: "",
    price: "",
    quantity: "1",
    unit: "",
    batchNo: "",
    gst: "",
  });
  const [itemList, setItemList] = useState<ItemInfo[]>([]);

  // Payment Information
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    amountPaid: "",
    paymentMethod: "",
    totalDiscount: "",
    totalBill: "",
    outstandingAmount: "",
  });
  const [paymentList, setPaymentList] = useState<PaymentInfo[]>([]);

  const handlePatientChange = (field: keyof PatientInfo, value: string) => {
    setPatientInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: keyof ItemInfo, value: string) => {
    setItemInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addPatient = () => {
    if (!patientInfo.name || !patientInfo.phone) {
      toast.error("Please fill in required patient fields");
      return;
    }
    setPatientList([...patientList, { ...patientInfo }]);
    setPatientInfo({ name: "", gender: "", phone: "", age: "", address: "" });
    // Move to next step
    if (currentStep === 1) setCurrentStep(2);
  };

  const addItem = () => {
    if (!itemInfo.itemName) {
      toast.error("Please fill in item name");
      return;
    }
    const newItem = {
      ...itemInfo,
      id: Date.now().toString(),
    };
    setItemList([...itemList, newItem]);
    setItemInfo({
      id: "",
      itemName: "",
      category: "",
      doctor: "",
      billDate: "",
      billTime: "",
      discountPercent: "",
      discountAmount: "",
      recommendedBy: "",
      price: "",
      quantity: "1",
      unit: "",
      batchNo: "",
      gst: "",
    });
    // Move to next step
    if (currentStep === 2) setCurrentStep(3);
  };

  const addPayment = () => {
    if (!paymentInfo.amountPaid || !paymentInfo.paymentMethod) {
      toast.error("Please fill in payment details");
      return;
    }
    setPaymentList([...paymentList, { ...paymentInfo }]);
    setPaymentInfo({
      amountPaid: "",
      paymentMethod: "",
      totalDiscount: "",
      totalBill: "",
      outstandingAmount: "",
    });
  };

  const removePatient = (index: number) => {
    setPatientList(patientList.filter((_, i) => i !== index));
  };

  const removeItem = (index: number) => {
    setItemList(itemList.filter((_, i) => i !== index));
  };

  const removePayment = (index: number) => {
    setPaymentList(paymentList.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = itemList.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      0
    );
    const totalDiscount = itemList.reduce(
      (sum, item) => sum + (parseFloat(item.discountAmount) || 0),
      0
    );
    const gstAmount = itemList.reduce((sum, item) => {
      const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
      return sum + (itemTotal * (parseFloat(item.gst) || 0)) / 100;
    }, 0);
    const totalBill = subtotal - totalDiscount + gstAmount;
    const amountPaid = paymentList.reduce(
      (sum, payment) => sum + (parseFloat(payment.amountPaid) || 0),
      0
    );
    return {
      subtotal,
      totalDiscount,
      gstAmount,
      totalBill,
      amountPaid,
      outstanding: totalBill - amountPaid,
    };
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to create a bill");
      return;
    }

    if (patientList.length === 0) {
      toast.error("Please add at least one patient");
      return;
    }

    if (itemList.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setIsSubmitting(true);

    try {
      const totals = calculateTotals();
      const billNumber = `BILL-${Date.now()}`;

      // Create bill
      const { data: billData, error: billError } = await supabase
        .from("bills")
        .insert({
          user_id: user.id,
          bill_number: billNumber,
          patient_name: patientList[0].name,
          patient_phone: patientList[0].phone,
          patient_address: patientList[0].address,
          doctor_name: itemList[0]?.doctor || null,
          subtotal: totals.subtotal,
          discount: totals.totalDiscount,
          gst_amount: totals.gstAmount,
          total_amount: totals.totalBill,
          payment_status: totals.outstanding <= 0 ? "paid" : "pending",
          payment_method: paymentList[0]?.paymentMethod || null,
        })
        .select()
        .single();

      if (billError) throw billError;

      // Create bill items
      const billItems = itemList.map((item) => ({
        user_id: user.id,
        bill_id: billData.id,
        item_name: item.itemName,
        quantity: parseInt(item.quantity) || 1,
        unit: item.unit || "pcs",
        unit_price: parseFloat(item.price) || 0,
        total_price: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        batch_no: item.batchNo || null,
        gst_percent: parseFloat(item.gst) || null,
      }));

      const { error: itemsError } = await supabase.from("bill_items").insert(billItems);

      if (itemsError) throw itemsError;

      setCreatedBillNumber(billNumber);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Error creating bill:", error);
      toast.error(error.message || "Failed to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  const totals = calculateTotals();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Billing</span>
          <span>{">"}</span>
          <span className="text-foreground font-medium">Create Bill</span>
        </div>

        {/* Main Form Card */}
        <div className="bg-card rounded-xl shadow-card p-6">
          {/* Patient Type Toggle & Membership */}
          <div className="flex items-center justify-between mb-6">
            {isMember && membershipId && (
              <span className="text-sm text-muted-foreground">
                Membership ID: {membershipId}
              </span>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <span className={!isExistingPatient ? "text-foreground font-medium" : "text-muted-foreground"}>
                New Patient
              </span>
              <Switch
                checked={isExistingPatient}
                onCheckedChange={setIsExistingPatient}
              />
              <span className={isExistingPatient ? "text-foreground font-medium" : "text-muted-foreground"}>
                Existing Patient
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  getStepStatus(1) === "completed"
                    ? "bg-primary"
                    : getStepStatus(1) === "active"
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
              <span className="text-sm mt-2">Patient Information</span>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${
                currentStep > 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  getStepStatus(2) === "completed"
                    ? "bg-primary"
                    : getStepStatus(2) === "active"
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
              <span className="text-sm mt-2">Item Information</span>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${
                currentStep > 2 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  getStepStatus(3) === "completed"
                    ? "bg-primary"
                    : getStepStatus(3) === "active"
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
              <span className="text-sm mt-2">Payment Information</span>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-foreground">Patient Information</h3>
              <button
                onClick={addPatient}
                className="text-primary text-sm font-medium hover:underline"
              >
                Add
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <Label className="text-sm">
                  Patient Name<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Lorem Ipsum"
                  value={patientInfo.name}
                  onChange={(e) => handlePatientChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">
                  Gender<span className="text-destructive">*</span>
                </Label>
                <Select
                  value={patientInfo.gender}
                  onValueChange={(value) => handlePatientChange("gender", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">
                  Phone Number<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={patientInfo.phone}
                  onChange={(e) => handlePatientChange("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">
                  Age<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="25"
                  value={patientInfo.age}
                  onChange={(e) => handlePatientChange("age", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">
                  Address<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="lorem Ipsum"
                  value={patientInfo.address}
                  onChange={(e) => handlePatientChange("address", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Patient List Table */}
            {patientList.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">Patient Information</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="text-primary">PATIENT NAME</TableHead>
                      <TableHead className="text-primary">GENDER</TableHead>
                      <TableHead className="text-primary">PHONE NUMBER</TableHead>
                      <TableHead className="text-primary">AGE</TableHead>
                      <TableHead className="text-primary">ADDRESS</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientList.map((patient, index) => (
                      <TableRow key={index}>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell className="capitalize">{patient.gender}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.address}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => removePatient(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Item Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-foreground">Item Information</h3>
              <button
                onClick={addItem}
                className="text-primary text-sm font-medium hover:underline"
              >
                Add
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className={!isMember ? "text-foreground" : "text-muted-foreground"}>
                  Non-Member
                </span>
                <Switch checked={isMember} onCheckedChange={setIsMember} />
                <span className={isMember ? "text-foreground" : "text-muted-foreground"}>
                  Member
                </span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <Label className="text-sm">
                  Category<span className="text-destructive">*</span>
                </Label>
                <Select
                  value={itemInfo.category}
                  onValueChange={(value) => handleItemChange("category", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="surgical">Surgical</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Item Name</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for Lorem Ipsum"
                    value={itemInfo.itemName}
                    onChange={(e) => handleItemChange("itemName", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Select Doctor</Label>
                <Select
                  value={itemInfo.doctor}
                  onValueChange={(value) => handleItemChange("doctor", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Lorem Ipsum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor1">Dr. Smith</SelectItem>
                    <SelectItem value="doctor2">Dr. Johnson</SelectItem>
                    <SelectItem value="doctor3">Dr. Williams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">
                  Bill Date<span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={itemInfo.billDate}
                  onChange={(e) => handleItemChange("billDate", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Bill Time</Label>
                <Input
                  type="time"
                  placeholder="XX:XX"
                  value={itemInfo.billTime}
                  onChange={(e) => handleItemChange("billTime", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <Label className="text-sm">Discount(%)</Label>
                <Input
                  placeholder="XX%"
                  value={itemInfo.discountPercent}
                  onChange={(e) => handleItemChange("discountPercent", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Discount Amount</Label>
                <Input
                  placeholder="₹XXX"
                  value={itemInfo.discountAmount}
                  onChange={(e) => handleItemChange("discountAmount", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Recommended By</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for Lorem Ipsum"
                    value={itemInfo.recommendedBy}
                    onChange={(e) => handleItemChange("recommendedBy", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Price</Label>
                <Input
                  placeholder="₹XXX"
                  value={itemInfo.price}
                  onChange={(e) => handleItemChange("price", e.target.value)}
                  className="mt-1 bg-muted/50"
                />
              </div>
              <div>
                <Label className="text-sm">Quantity</Label>
                <Input
                  placeholder="1"
                  value={itemInfo.quantity}
                  onChange={(e) => handleItemChange("quantity", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Item List Table */}
            {itemList.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">Item Information</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="text-primary">CATEGORY</TableHead>
                      <TableHead className="text-primary">ITEM NAME</TableHead>
                      <TableHead className="text-primary">SELECT DOCTOR</TableHead>
                      <TableHead className="text-primary">BILL DATE</TableHead>
                      <TableHead className="text-primary">BILL TIME</TableHead>
                      <TableHead className="text-primary">DISCOUNT(%)</TableHead>
                      <TableHead className="text-primary">DISCOUNT AMOUNT</TableHead>
                      <TableHead className="text-primary">RECOMMENDED BY</TableHead>
                      <TableHead className="text-primary">PRICE</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemList.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.doctor}</TableCell>
                        <TableCell>{item.billDate}</TableCell>
                        <TableCell>{item.billTime}</TableCell>
                        <TableCell>{item.discountPercent}%</TableCell>
                        <TableCell>₹{item.discountAmount}</TableCell>
                        <TableCell>{item.recommendedBy}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Payment Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-foreground">Payment Information</h3>
              <button
                onClick={addPayment}
                className="text-primary text-sm font-medium hover:underline"
              >
                Add
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <Label className="text-sm">Amount Paid</Label>
                <Input
                  placeholder="₹XXX"
                  value={paymentInfo.amountPaid}
                  onChange={(e) => handlePaymentChange("amountPaid", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Payment Method</Label>
                <Select
                  value={paymentInfo.paymentMethod}
                  onValueChange={(value) => handlePaymentChange("paymentMethod", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Total Discount</Label>
                <Input
                  placeholder="₹XXX"
                  value={totals.totalDiscount.toFixed(2)}
                  readOnly
                  className="mt-1 bg-muted/50"
                />
              </div>
              <div>
                <Label className="text-sm">
                  Total Bill<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="₹XXX"
                  value={totals.totalBill.toFixed(2)}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Outstanding Amount</Label>
                <Input
                  placeholder="₹XXX"
                  value={totals.outstanding.toFixed(2)}
                  readOnly
                  className="mt-1 bg-muted/50"
                />
              </div>
            </div>

            {/* Payment List Table */}
            {paymentList.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">Payment Information</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="text-primary">AMOUNT PAID</TableHead>
                      <TableHead className="text-primary">PAYMENT METHOD</TableHead>
                      <TableHead className="text-primary">TOTAL DISCOUNT</TableHead>
                      <TableHead className="text-primary">TOTAL BILL</TableHead>
                      <TableHead className="text-primary">OUTSTANDING AMOUNT</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentList.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>₹{payment.amountPaid}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                        <TableCell>₹{totals.totalDiscount.toFixed(2)}</TableCell>
                        <TableCell>₹{totals.totalBill.toFixed(2)}</TableCell>
                        <TableCell>₹{totals.outstanding.toFixed(2)}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => removePayment(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isSubmitting ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Your bill{" "}
                <span className="text-primary">#{createdBillNumber}</span> has been
                created successfully
                <span className="text-primary">✓</span>
              </DialogTitle>
              <DialogDescription>
                What would you like to do next?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessDialog(false);
                  // Reset form
                  setPatientList([]);
                  setItemList([]);
                  setPaymentList([]);
                  setCurrentStep(1);
                }}
              >
                Continue
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Home
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CreateBill;