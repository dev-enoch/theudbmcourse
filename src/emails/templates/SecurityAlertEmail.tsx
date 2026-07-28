import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";

interface SecurityAlertEmailProps {
  name: string;
  changeType: string;
}

export const SecurityAlertEmail = ({
  name = "Student",
  changeType = "email address",
}: SecurityAlertEmailProps) => {
  return (
    <EmailLayout previewText="Security Alert: Your account details were updated">
      <Text style={greeting}>Hi {name},</Text>
      
      <Text style={text}>
        This is a security notification to let you know that your <strong>{changeType}</strong> was recently updated on your account at <strong>The UBDM Course</strong>.
      </Text>

      <Text style={text}>
        If you or an administrator made this change, no further action is required.
      </Text>

      <Text style={warningText}>
        If you did not authorize this change, please contact support immediately to secure your account.
      </Text>
    </EmailLayout>
  );
};

export default SecurityAlertEmail;

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

const warningText = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#991b1b",
  fontWeight: "500",
  marginBottom: "16px",
};
