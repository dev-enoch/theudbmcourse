import * as React from "react";
import { Button } from "@react-email/components";

export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <div style={buttonWrapper}>
      <Button style={button} href={href}>
        {children}
      </Button>
    </div>
  );
}

const buttonWrapper = {
  margin: "40px 0",
};

const button = {
  display: "inline-block",
  padding: "12px 22px",
  backgroundColor: "#111827",
  color: "#ffffff",
  textDecoration: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  textAlign: "center" as const,
};
