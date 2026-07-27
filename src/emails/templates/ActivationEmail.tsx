import * as React from "react";
import { Text, Heading, Section } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { EmailButton } from "../components/EmailButton";

interface ActivationEmailProps {
  email: string;
  password?: string;
  loginUrl: string;
}

export const ActivationEmail = ({
  email,
  password,
  loginUrl,
}: ActivationEmailProps) => {
  return (
    <EmailLayout previewText="Your login details have been generated. Sign in to continue.">
      <Heading style={h1}>Your Login Details</Heading>
      
      <Text style={paragraph}>Hi {email},</Text>
      
      <Text style={paragraph}>
        Your account has been successfully activated. You can use the details below to sign in to your account.
      </Text>
      
      {password && (
        <Section style={credentials}>
          <div style={{ ...row, borderBottom: "1px solid #e5e7eb" }}>
            <div style={label}>Email</div>
            <div style={value}>{email}</div>
          </div>
          <div style={row}>
            <div style={label}>Password</div>
            <div style={value}>{password}</div>
          </div>
        </Section>
      )}

      <EmailButton href={loginUrl}>
        Log in to your account
      </EmailButton>

      <Text style={notice}>
        If you didn't expect this email or didn't register for an account,
        please contact support immediately.
      </Text>
    </EmailLayout>
  );
};

export default ActivationEmail;

const h1 = {
  margin: "0 0 24px",
  fontSize: "30px",
  fontWeight: "700",
  lineHeight: "1.2",
  letterSpacing: "-0.03em",
  color: "#111827",
};

const paragraph = {
  margin: "0 0 18px",
  fontSize: "16px",
  color: "#525252",
};

const credentials = {
  margin: "32px 0",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden",
  width: "100%",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  width: "100%",
  boxSizing: "border-box" as const,
};

const label = {
  color: "#737373",
  fontSize: "14px",
};

const value = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  wordBreak: "break-word" as const,
};

const notice = {
  fontSize: "14px",
  color: "#737373",
};
