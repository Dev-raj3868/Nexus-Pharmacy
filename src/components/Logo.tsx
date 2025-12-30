import nexusLogo from "@/assets/nexus-logo.jpg";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={nexusLogo} 
        alt="NEXUS Logo" 
        className="w-12 h-12 rounded-full object-cover"
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        NEXUS <span className="text-xs font-normal bg-muted px-1.5 py-0.5 rounded ml-1">Beta</span>
      </span>
    </div>
  );
};

export default Logo;
