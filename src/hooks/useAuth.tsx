import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface User {
  admin_id: string;
}

interface Profile {
  admin_id: string;
  pharmacy: any;
  clinic: any;
}

interface SignupPayload {
  adminData: any;
  clinicData: any;
  pharmacyData: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;

  signUp: (
    payload: SignupPayload
  ) => Promise<{ error: Error | null; token?: string }>;

  signOut: () => void;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const API = "http://127.0.0.1:8000";

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- PROFILE FETCH ---------------- */

// const fetchProfile = async () => {
//   try {
//     const token = localStorage.getItem("token");

//     if (!token) return;

//     const res = await fetch(`${API}/profile`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!res.ok) {
//       console.error("Profile request failed:", res.status);
//       return;
//     }

//     const result = await res.json();

//     if (result.resSuccess === 1) {
//       setProfile(result.data);

//       setUser({
//         admin_id: result.data.admin_id,
//       });
//     }

//   } catch (err) {
//     console.error("Profile fetch error:", err);
//   }
// };

  /* ---------------- LOAD SESSION ---------------- */

  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   if (token) {
  //     fetchProfile();
  //   }

  //   setLoading(false);
  // }, []);
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    // decode token or just assume user exists
    setUser({ admin_id: "admin" });
  }

  setLoading(false);
}, []);
  /* ---------------- LOGIN ---------------- */

  const signIn = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API}/api/v1/pharmacy/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (!res.ok || result.resSuccess !== 1) {
      return { error: new Error(result.message || "Login failed") };
    }

    localStorage.setItem("token", result.token);

    // ✅ set user immediately
    setUser({
      admin_id: result.admin_id || "admin",
    });

    setLoading(false);

    return { error: null };
  } catch (err) {
    setLoading(false);
    return { error: err as Error };
  }
};

  /* ---------------- SIGNUP ---------------- */

  const signUp = async (payload: SignupPayload) => {
    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.resSuccess !== 1) {
        return { error: new Error(result.message || "Signup failed") };
      }

      // backend already returns token
      if (result.token) {
        localStorage.setItem("token", result.token);
      //  await fetchProfile();
      }

      return { error: null, token: result.token };
    } catch (err) {
      return { error: err as Error };
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setProfile(null);
  };

  /* ---------------- REFRESH PROFILE ---------------- */

  const refreshProfile = async () => {
  //  await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};