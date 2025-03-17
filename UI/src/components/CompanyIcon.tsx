
import React from "react";
import { Network } from "lucide-react";

interface CompanyIconProps {
  className?: string;
  size?: number;
}

const CompanyIcon: React.FC<CompanyIconProps> = ({ className, size = 24 }) => {
  return (
    <Network className={className} size={size} />
  );
};

export default CompanyIcon;
