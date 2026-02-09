import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const NetworkIndicator = () => {
  const { online, strength } = useNetworkStatus();

  if (!online) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
        <WifiOff className="w-4 h-4" />
        Offline
      </div>
    );
  }

  const color =
    strength === "good"
      ? "text-green-500"
      : strength === "average"
      ? "text-yellow-500"
      : "text-red-500";

  const label =
    strength === "good"
      ? "Strong Internet"
      : strength === "average"
      ? "Average Internet"
      : "Weak Internet";

  return (
    <div className={`flex items-center gap-2 ${color} text-xs font-medium`}>
      <Wifi className="w-4 h-4" />
      {label}
    </div>
  );
};

export default NetworkIndicator;
