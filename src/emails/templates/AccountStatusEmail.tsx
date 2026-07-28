import * as React from "react";
import { Text, Section, Button } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";

interface AccountStatusEmailProps {
  name: string;
  status: "suspended" | "reactivated";
  reason?: string;
  loginUrl: string;
}

export const AccountStatusEmail = ({
  name = "Student",
  status = "suspended",
  reason = "",
  loginUrl = "https://example.com/login",
}: AccountStatusEmailProps) => {
  const isSuspended = status === "suspended";

  return (
    <EmailLayout previewText={`Your account has been ${status}`}>
      <Text style={greeting}>Hi {name},</Text>
      
      {isSuspended ? (
        <>
          <Text style={text}>
            We are writing to inform you that your account on <strong>The UBDM Course</strong> has been temporarily suspended.
          </Text>
          {reason && (
            <Section style={reasonBox}>
              <Text style={reasonText}><strong>Reason:</strong> {reason}</Text>
            </Section>
          )}
          <Text style={text}>
            If you believe this is a mistake, please reply to this email to contact our support team.
          </Text>
        </>
      ) : (
        <>
          <Text style={text}>
            Good news! Your account on <strong>The UBDM Course</strong> has been reactivated. You can now log in and continue your learning.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Log In Now
            </Button>
          </Section>
        </>
      )}
    </EmailLayout>
  );
};

export default AccountStatusEmail;

const greeting = {
  fontSize: "18px",
  lineHeight: "1.4",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  marginBottom: "16px",
};

const reasonBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "24px",
};

const reasonText = {
  margin: "0",
  fontSize: "14px",
  color: "#991b1b",
};

const buttonContainer = {
  marginTop: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};
