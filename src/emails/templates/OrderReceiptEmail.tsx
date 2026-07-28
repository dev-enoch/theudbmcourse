import * as React from "react";
import { Text, Section, Button } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";

interface OrderReceiptEmailProps {
  name: string;
  orderId: string;
  loginUrl: string;
}

export const OrderReceiptEmail = ({
  name = "Student",
  orderId = "12345",
  loginUrl = "https://example.com/login",
}: OrderReceiptEmailProps) => {
  return (
    <EmailLayout previewText="Your Receipt for The UBDM Course">
      <Text style={greeting}>Hi {name},</Text>
      <Text style={text}>
        Thank you for purchasing <strong>The UBDM Course</strong>! Your payment was successful, and your account has been provisioned.
      </Text>
      
      <Section style={receiptBox}>
        <Text style={receiptText}><strong>Order ID:</strong> {orderId}</Text>
        <Text style={receiptText}><strong>Amount Paid:</strong> 15,000 NGN</Text>
        <Text style={receiptText}><strong>Date:</strong> {new Date().toLocaleDateString()}</Text>
      </Section>

      <Text style={text}>
        You can log in to your account and start learning right away:
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          Go to Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default OrderReceiptEmail;

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

const receiptBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "24px",
};

const receiptText = {
  margin: "4px 0",
  fontSize: "14px",
  color: "#111827",
};

const buttonContainer = {
  marginTop: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#20692b",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};
