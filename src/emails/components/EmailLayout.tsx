import * as React from "react";
import { Html, Head, Preview, Body, Container, Section, Img, Text } from "@react-email/components";

export interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  // Full-width promotional header
  const logoUrl = `${process.env.APP_URL}/Promotional_header_for_UBDM_Course_202607262117.jpeg`; 

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src={logoUrl} alt="The UBDM Course" style={logoImg} />
          </Section>
          
          <Section>
            {children}
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              <strong>The UBDM Course Team</strong>
            </Text>
            <Text style={footerText}>
              If you didn't expect this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  padding: "40px 20px",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  color: "#171717",
  lineHeight: "1.6",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "40px",
  width: "100%",
};

const logoImg = {
  width: "100%",
  maxWidth: "600px",
  height: "auto",
  display: "block",
  margin: "0 auto",
};

const footer = {
  marginTop: "48px",
  paddingTop: "24px",
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  margin: "6px 0",
  fontSize: "14px",
  color: "#737373",
};
