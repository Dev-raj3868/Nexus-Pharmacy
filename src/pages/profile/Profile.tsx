import { useState, useEffect, useRef } from "react";
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
import { Upload, Plus, Trash2, Calendar, Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface ShiftInfo {
  workingDay: string;
  startTime: string;
  endTime: string;
}

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  // Clinic Info
  const [clinicName, setClinicName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [landline, setLandline] = useState("");
  const [location, setLocation] = useState("");

  // Pharmacy Info
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyGst, setPharmacyGst] = useState("");
  const [fssiId, setFssiId] = useState("");
  const [dlNo, setDlNo] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [pharmacyLandline, setPharmacyLandline] = useState("");

  // Shifts
  const [shifts, setShifts] = useState<ShiftInfo[]>([]);
  const [newShift, setNewShift] = useState<ShiftInfo>({
    workingDay: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setAge(profile.age?.toString() || "");
      setGender(profile.gender || "");
      setDob(profile.date_of_birth || "");
      setPhone(profile.phone || "");
      setAvatarPreview(profile.avatar_url || null);

      setClinicName(profile.clinic_name || "");
      setGstNumber(profile.clinic_gst_number || "");
      setClinicPhone(profile.clinic_phone || "");
      setLandline(profile.clinic_landline || "");
      setLocation(profile.clinic_location || "");

      setPharmacyName(profile.pharmacy_name || "");
      setPharmacyGst(profile.pharmacy_gst_number || "");
      setFssiId(profile.fssai_id || "");
      setDlNo(profile.dl_no || "");
      setAddress(profile.pharmacy_address || "");
      setPincode(profile.pharmacy_pincode || "");
      setPharmacyPhone(profile.pharmacy_phone || "");
      setPharmacyLandline(profile.pharmacy_landline || "");

      if (profile.shifts && Array.isArray(profile.shifts)) {
        setShifts(profile.shifts as ShiftInfo[]);
      }
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addShift = () => {
    if (newShift.workingDay && newShift.startTime && newShift.endTime) {
      setShifts([...shifts, newShift]);
      setNewShift({ workingDay: "", startTime: "", endTime: "" });
    }
  };

  const removeShift = (index: number) => {
    setShifts(shifts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;

      // Upload new avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age) || null,
          gender,
          date_of_birth: dob || null,
          phone,
          avatar_url: avatarUrl,
          clinic_name: clinicName,
          clinic_gst_number: gstNumber,
          clinic_phone: clinicPhone,
          clinic_landline: landline,
          clinic_location: location,
          pharmacy_name: pharmacyName,
          pharmacy_gst_number: pharmacyGst,
          fssai_id: fssiId,
          dl_no: dlNo,
          pharmacy_address: address,
          pharmacy_pincode: pincode,
          pharmacy_phone: pharmacyPhone,
          pharmacy_landline: pharmacyLandline,
          shifts: JSON.parse(JSON.stringify(shifts)),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-card rounded-xl shadow-card p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Edit Profile
        </h1>

        <div className="flex gap-12">
          {/* Avatar Upload */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 rounded-full border-4 border-primary/20 bg-muted flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm">First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label className="text-sm">Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <Label className="text-sm">Age</Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label className="text-sm">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm">Date of Birth</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Clinic Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Clinic Information
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm">Clinic Name</Label>
                  <Input
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="ABC Clinic"
                  />
                </div>
                <div>
                  <Label className="text-sm">GST Number</Label>
                  <Input
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Clinic Phone</Label>
                  <Input
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <Label className="text-sm">Landline</Label>
                  <Input
                    value={landline}
                    onChange={(e) => setLandline(e.target.value)}
                    placeholder="XXXX-XXXXXXX"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter clinic location"
                />
              </div>
            </div>

            {/* Pharmacy Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Pharmacy Information
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm">Pharmacy Name</Label>
                  <Input
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="XYZ Pharmacy"
                  />
                </div>
                <div>
                  <Label className="text-sm">GST Number</Label>
                  <Input
                    value={pharmacyGst}
                    onChange={(e) => setPharmacyGst(e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <Label className="text-sm">FSSAI ID</Label>
                  <Input
                    value={fssiId}
                    onChange={(e) => setFssiId(e.target.value)}
                    placeholder="XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label className="text-sm">DL No</Label>
                  <Input
                    value={dlNo}
                    onChange={(e) => setDlNo(e.target.value)}
                    placeholder="XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="col-span-2">
                  <Label className="text-sm">Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter pharmacy address"
                  />
                </div>
                <div>
                  <Label className="text-sm">Pincode</Label>
                  <Input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="XXXXXX"
                  />
                </div>
                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={pharmacyPhone}
                    onChange={(e) => setPharmacyPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm">Pharmacy Landline</Label>
                <Input
                  value={pharmacyLandline}
                  onChange={(e) => setPharmacyLandline(e.target.value)}
                  placeholder="XXXX-XXXXXXX"
                />
              </div>
            </div>

            {/* Shift Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Shift Information
              </h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Label className="text-sm">Working Day</Label>
                  <Select
                    value={newShift.workingDay}
                    onValueChange={(v) =>
                      setNewShift({ ...newShift, workingDay: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-sm">Start Time</Label>
                  <Input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) =>
                      setNewShift({ ...newShift, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-sm">End Time</Label>
                  <Input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) =>
                      setNewShift({ ...newShift, endTime: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addShift} size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {shifts.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Day
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Start Time
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          End Time
                        </th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((shift, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="px-4 py-2 text-sm">
                            {shift.workingDay}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {shift.startTime}
                          </td>
                          <td className="px-4 py-2 text-sm">{shift.endTime}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeShift(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading} className="min-w-32">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
