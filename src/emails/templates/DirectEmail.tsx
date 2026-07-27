import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";

interface DirectEmailProps {
  htmlContent: string;
}

export const DirectEmail = ({
  htmlContent,
}: DirectEmailProps) => {
  return (
    <EmailLayout previewText="Message from The UBDM Course Admin">
      {/* 
        We use dangerouslySetInnerHTML here because this is for direct admin messages
        where the admin types HTML into the textarea.
      */}
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
        style={contentStyle} 
      />
    </EmailLayout>
  );
};

export default DirectEmail;

const contentStyle = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};
