import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Logo from "@/components/Logo";
import { Phone, Loader2 } from "lucide-react";
import healthcareHero from "@/assets/healthcare-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to sign in");
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 gradient-background relative">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>

        <div className="max-w-md w-full mx-auto mt-16 lg:mt-0 animate-fade-in">
          <div className="bg-card p-8 rounded-2xl shadow-elevated border border-border/50">
            <h1 className="text-2xl font-bold text-foreground mb-2">Log in to your account</h1>
            <p className="text-muted-foreground mb-8">Welcome back! Please enter your details.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <Link to="#" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Log in
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 lg:left-auto lg:right-8 flex items-center gap-2 text-primary">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Contact Us</span>
        </div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={healthcareHero}
          alt="Healthcare professionals providing patient care"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-primary-foreground animate-slide-in-right">
          <h2 className="text-3xl font-bold mb-4">Your Trusted Pharmacy Partner</h2>
          <p className="text-primary-foreground/90 leading-relaxed max-w-lg">
            Streamline your pharmacy operations with our comprehensive management system. 
            Track inventory, manage prescriptions, and deliver exceptional patient care.
          </p>
          <div className="flex gap-3 mt-6">
            <button className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
              ←
            </button>
            <button className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
