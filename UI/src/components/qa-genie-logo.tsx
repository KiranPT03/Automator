
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface RapidQALogoProps extends HTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number;
}

export function QaGenieLogo({ className, size = 32, ...props }: RapidQALogoProps) {
  return (
    <img
      src="/lovable-uploads/9879c811-d95a-4303-8939-431338d7dc64.png"
      alt="RapidQA Logo"
      width={size}
      height={size}
      className={cn("object-contain flex-shrink-0", className)}
      style={{ 
        display: "inline-block", 
        verticalAlign: "middle" 
      }}
      {...props}
    />
  );
}
