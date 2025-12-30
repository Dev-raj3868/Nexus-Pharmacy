import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from "@/components/Logo";
import { Phone, Upload, Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

interface ShiftInfo {
  workingDay: string;
  startTime: string;
  endTime: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Step 1 - Personal Info
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 - Clinic Info
  const [clinicName, setClinicName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [landline, setLandline] = useState("");
  const [location, setLocation] = useState("");

  // Step 3 - Pharmacy Info
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyGst, setPharmacyGst] = useState("");
  const [fssiId, setFssiId] = useState("");
  const [dlNo, setDlNo] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [pharmacyLandline, setPharmacyLandline] = useState("");

  // Shift Information
  const [shifts, setShifts] = useState<ShiftInfo[]>([]);
  const [newShift, setNewShift] = useState<ShiftInfo>({ workingDay: "", startTime: "", endTime: "" });

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

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

  const validateStep1 = () => {
    if (!email || !firstName || !lastName || !age || !gender || !dob || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!avatarFile) {
      toast.error("Please upload a profile photo");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!clinicName || !gstNumber || !clinicPhone || !landline || !location) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!pharmacyName || !pharmacyGst || !fssiId || !dlNo || !address || !pincode || !pharmacyPhone || !pharmacyLandline) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    } else {
      if (!validateStep3()) return;
      await handleSignup();
    }
  };

  const handleSignup = async () => {
    setLoading(true);

    try {
      // Sign up user
      const { error: signUpError, data } = await signUp(email, password);
      
      if (signUpError) {
        toast.error(signUpError.message || "Failed to create account");
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        toast.error("Failed to get user ID");
        setLoading(false);
        return;
      }

      // Upload avatar
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        
        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age),
          gender,
          date_of_birth: dob,
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
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error("Account created but profile setup failed. Please update your profile later.");
      } else {
        toast.success("Account created successfully!");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <span className="text-2xl font-light tracking-wider">
              <span className="text-primary font-semibold">PHAR</span>
              <span className="text-muted-foreground">MACY</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Products</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Resources</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-secondary/30 py-6">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-foreground">Create Admin profile</span>
            <span className="text-sm font-medium text-foreground">Create Pharmacy Profile</span>
          </div>
          <div className="relative">
            <div className="h-1 bg-border rounded-full">
              <div 
                className="h-full gradient-secondary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full gradient-secondary border-2 border-card" />
            <div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                step === 3 ? "gradient-secondary border-card" : "bg-card border-secondary"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-card rounded-2xl shadow-elevated p-8 animate-fade-in">
          <div className="flex gap-12">
            {/* Avatar Upload */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-full border-4 border-primary/20 bg-muted flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted-foreground text-center p-4">
                    <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
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
                variant="outlinePrimary" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                UPLOAD<span className="text-destructive ml-1">*</span>
              </Button>
            </div>

            {/* Form Fields */}
            <div className="flex-1">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email<span className="text-destructive">*</span>
                      </label>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last name<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Age<span className="text-destructive">*</span>
                      </label>
                      <Input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Gender<span className="text-destructive">*</span>
                      </label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date of Birth<span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-foreground pt-4">Create Password</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Password<span className="text-destructive">*</span>
                      </label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm Password<span className="text-destructive">*</span>
                      </label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={confirmPassword && password !== confirmPassword ? "border-destructive" : ""}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground">Clinic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Clinic Name<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="ABC Clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        GST Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="22AAAAA0000A1Z5" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Clinic's Phone Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="+91 XXXXX XXXXX" value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Landline Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="0XX-XXXXXXX" value={landline} onChange={(e) => setLandline(e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location<span className="text-destructive">*</span>
                    </label>
                    <Input placeholder="123 Medical Street, City, State" value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold text-foreground">Shift Information</h2>
                      <button onClick={addShift} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Working Day
                        </label>
                        <Select value={newShift.workingDay} onValueChange={(v) => setNewShift({...newShift, workingDay: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Start Time
                        </label>
                        <Input type="time" value={newShift.startTime} onChange={(e) => setNewShift({...newShift, startTime: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          End Time
                        </label>
                        <Input type="time" value={newShift.endTime} onChange={(e) => setNewShift({...newShift, endTime: e.target.value})} />
                      </div>
                    </div>

                    {shifts.length > 0 && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border">
                        <div className="bg-secondary/30 px-4 py-2 text-sm font-semibold text-foreground">
                          SHIFT INFORMATION
                        </div>
                        <table className="w-full">
                          <thead className="bg-secondary/20">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">WORKING DAY</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">START TIME</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">END TIME</th>
                              <th className="w-12"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {shifts.map((shift, index) => (
                              <tr key={index} className="border-t border-border">
                                <td className="px-4 py-3 text-sm text-foreground">{shift.workingDay}</td>
                                <td className="px-4 py-3 text-sm text-foreground">{shift.startTime}</td>
                                <td className="px-4 py-3 text-sm text-foreground">{shift.endTime}</td>
                                <td className="px-4 py-3">
                                  <button onClick={() => removeShift(index)} className="text-destructive hover:text-destructive/80">
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
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground">Pharmacy Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pharmacy Name<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="MedCare Pharmacy" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        GST Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="22AAAAA0000A1Z5" value={pharmacyGst} onChange={(e) => setPharmacyGst(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        FSSAI ID<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="10020011000123" value={fssiId} onChange={(e) => setFssiId(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        DL No<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="MH-MUM-123456" value={dlNo} onChange={(e) => setDlNo(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="123 Pharmacy Lane" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pin code<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="400001" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pharmacy's Phone Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="+91 XXXXX XXXXX" value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Landline Number<span className="text-destructive">*</span>
                      </label>
                      <Input placeholder="0XX-XXXXXXX" value={pharmacyLandline} onChange={(e) => setPharmacyLandline(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold text-foreground">Shift Information</h2>
                      <button onClick={addShift} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Working Day
                        </label>
                        <Select value={newShift.workingDay} onValueChange={(v) => setNewShift({...newShift, workingDay: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Start Time
                        </label>
                        <Input type="time" value={newShift.startTime} onChange={(e) => setNewShift({...newShift, startTime: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          End Time
                        </label>
                        <Input type="time" value={newShift.endTime} onChange={(e) => setNewShift({...newShift, endTime: e.target.value})} />
                      </div>
                    </div>

                    {shifts.length > 0 && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border">
                        <div className="bg-secondary/30 px-4 py-2 text-sm font-semibold text-foreground">
                          SHIFT INFORMATION
                        </div>
                        <table className="w-full">
                          <thead className="bg-secondary/20">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">WORKING DAY</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">START TIME</th>
                              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">END TIME</th>
                              <th className="w-12"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {shifts.map((shift, index) => (
                              <tr key={index} className="border-t border-border">
                                <td className="px-4 py-3 text-sm text-foreground">{shift.workingDay}</td>
                                <td className="px-4 py-3 text-sm text-foreground">{shift.startTime}</td>
                                <td className="px-4 py-3 text-sm text-foreground">{shift.endTime}</td>
                                <td className="px-4 py-3">
                                  <button onClick={() => removeShift(index)} className="text-destructive hover:text-destructive/80">
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
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={() => setStep((step - 1) as Step)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="success" size="lg" onClick={handleNext} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {step === 3 ? "Get started" : "Proceed to Next Step"}
            </Button>
          </div>
        </div>
      </main>

      {/* Contact Footer */}
      <div className="fixed bottom-8 right-8 flex items-center gap-2 text-primary">
        <Phone className="w-4 h-4" />
        <span className="text-sm font-medium">Contact Us</span>
      </div>
    </div>
  );
};

export default Signup;
