import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";

interface AccountDeletionEmailProps {
  name: string;
}

export const AccountDeletionEmail = ({
  name = "Student",
}: AccountDeletionEmailProps) => {
  return (
    <EmailLayout previewText="Your account has been deleted">
      <Text style={greeting}>Hi {name},</Text>
      
      <Text style={text}>
        We are writing to confirm that your account at <strong>The UBDM Course</strong> has been successfully deleted.
      </Text>

      <Text style={text}>
        All of your personal data and course progress have been removed from our systems. 
      </Text>

      <Text style={text}>
        If you ever wish to join us again in the future, you are always welcome to sign up for a new account.
      </Text>

      <Text style={text}>
        Thank you for having been a part of The UBDM Course!
      </Text>
    </EmailLayout>
  );
};

export default AccountDeletionEmail;

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
