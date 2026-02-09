import { useEffect, useState } from "react";

type NetworkStrength = "good" | "average" | "weak" | "offline";

type NetworkStatus = {
  online: boolean;
  strength: NetworkStrength;
};

export const useNetworkStatus = (): NetworkStatus => {
  const getConnection = (): NetworkStatus => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!navigator.onLine) {
      return { online: false, strength: "offline" };
    }

    if (!connection) {
      return { online: true, strength: "good" };
    }

    const { effectiveType, downlink } = connection;

    if (downlink >= 5 || effectiveType === "4g") {
      return { online: true, strength: "good" };
    }

    if (downlink >= 1.5 || effectiveType === "3g") {
      return { online: true, strength: "average" };
    }

    return { online: true, strength: "weak" };
  };

  const [status, setStatus] = useState<NetworkStatus>(() => getConnection());

  useEffect(() => {
    const update = () => setStatus(getConnection());

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    connection?.addEventListener("change", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  return status;
};
