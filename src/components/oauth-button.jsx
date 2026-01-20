"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OAuthButton({
  icon: Icon,
  label,
  onClick,
  className,
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 text-sm font-medium",
        className
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );
}
