import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { EmailButton } from "../components/EmailButton";

interface CourseCompletionEmailProps {
  name?: string;
  courseTitle: string;
  loginUrl: string;
}

export const CourseCompletionEmail = ({
  name = "Student",
  courseTitle,
  loginUrl,
}: CourseCompletionEmailProps) => {
  return (
    <EmailLayout previewText="Course Completed! 🏆">
      <Text style={heading}>Congratulations, {name}! 🏆</Text>
      <Text style={paragraph}>
        You have successfully completed the entire course: <strong>{courseTitle}</strong>.
      </Text>
      <Text style={paragraph}>
        Don't forget to join the exclusive group to connect with other students and share your progress!
      </Text>
      
      <EmailButton href={loginUrl}>
        Go to Dashboard
      </EmailButton>
    </EmailLayout>
  );
};

export default CourseCompletionEmail;

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
