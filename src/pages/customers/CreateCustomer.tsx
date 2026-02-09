import { useState } from "react";
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
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface PatientDetail {
  id: string;
  name: string;
  gender: string;
  age: string;
  contactNumber: string;
  address: string;
}

const CreateCustomer = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<PatientDetail[]>([
    { id: crypto.randomUUID(), name: "", gender: "", age: "", contactNumber: "", address: "" },
  ]);

  const addPatient = () => {
    setPatients([
      ...patients,
      { id: crypto.randomUUID(), name: "", gender: "", age: "", contactNumber: "", address: "" },
    ]);
  };

  const removePatient = (id: string) => {
    if (patients.length > 1) {
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  const updatePatient = (id: string, field: keyof PatientDetail, value: string) => {
    setPatients(
      patients.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

const handleSubmit = async () => {
  const isValid = patients.every(
    (p) => p.name.trim() && p.gender && p.contactNumber.trim()
  );

  if (!isValid) {
    toast({
      title: "Validation Error",
      description: "Please fill required fields",
      variant: "destructive",
    });
    return;
  }

  try {
    const payload = patients.map((p) => ({
      name: p.name,
      gender: p.gender,
      age: p.age,
      contactNumber: p.contactNumber,
      address: p.address,
    }));

    await window.context.createCustomers(payload);

    toast({
      title: "Success",
      description: `${patients.length} patient(s) saved`,
    });

    setPatients([
      { id: crypto.randomUUID(), name: "", gender: "", age: "", contactNumber: "", address: "" },
    ]);
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to save patients",
      variant: "destructive",
    });
  }
};


  return (
    <DashboardLayout breadcrumbs={["Customers", "Create"]}>
      <div className="max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Patient Details</h2>
            <button
              onClick={addPatient}
              className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {patients.map((patient, index) => (
            <div key={patient.id} className="relative">
              {patients.length > 1 && (
                <button
                  onClick={() => removePatient(patient.id)}
                  className="absolute -right-2 -top-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`name-${patient.id}`}>
                    Name<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`name-${patient.id}`}
                    placeholder="Patient Name"
                    value={patient.name}
                    onChange={(e) => updatePatient(patient.id, "name", e.target.value)}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`gender-${patient.id}`}>
                    Gender<span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={patient.gender}
                    onValueChange={(value) => updatePatient(patient.id, "gender", value)}
                  >
                    <SelectTrigger id={`gender-${patient.id}`} className="bg-card">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`age-${patient.id}`}>Age</Label>
                  <Input
                    id={`age-${patient.id}`}
                    type="number"
                    placeholder="25"
                    value={patient.age}
                    onChange={(e) => updatePatient(patient.id, "age", e.target.value)}
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`contact-${patient.id}`}>
                    Contact Number<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`contact-${patient.id}`}
                    placeholder="+91 XXXXX XXXXX"
                    value={patient.contactNumber}
                    onChange={(e) => updatePatient(patient.id, "contactNumber", e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor={`address-${patient.id}`}>Address</Label>
                  <Input
                    id={`address-${patient.id}`}
                    placeholder="Enter address"
                    value={patient.address}
                    onChange={(e) => updatePatient(patient.id, "address", e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>

              {index < patients.length - 1 && (
                <div className="border-b border-border mt-6" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button onClick={handleSubmit} className="px-8">
            Save Patients
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPatients([
                { id: crypto.randomUUID(), name: "", gender: "", age: "", contactNumber: "", address: "" },
              ])
            }
          >
            Reset
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCustomer;
