import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { EmailButton } from "../components/EmailButton";

interface LessonCompletionEmailProps {
  name?: string;
  loginUrl: string;
}

export const LessonCompletionEmail = ({
  name = "Student",
  loginUrl,
}: LessonCompletionEmailProps) => {
  return (
    <EmailLayout previewText="Great job completing a lesson!">
      <Text style={heading}>Great job, {name}! 🎉</Text>
      <Text style={paragraph}>
        You have successfully completed a lesson.
      </Text>
      <Text style={paragraph}>
        Keep up the great work and continue your learning journey! Every step brings you closer to your goals.
      </Text>
      
      <EmailButton href={loginUrl}>
        Continue Course
      </EmailButton>
    </EmailLayout>
  );
};

export default LessonCompletionEmail;

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};
