import { getAuthSession } from "@/lib/auth/getAuthSession";
import { getCourseById, getUserProgress } from "@/lib/data";
import { getGroupLinkByCourseId } from "@/lib/settings";
import { redirect, notFound } from "next/navigation";
import { CourseClientPage } from "./_components/CourseClientPage";
import AppLayout from "@/components/common/AppLayout";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { dictionaries } from "@/lib/i18n/dictionaries";

type CoursePlayerPageProps = {
  params: {
    courseId: string;
    topicId: string;
  };
};

export default async function CoursePlayerPage({
  params,
}: CoursePlayerPageProps) {
  const { courseId, topicId } = await params;

  const session = await getAuthSession();
  if (!session) redirect("/unauthorized");
  const userId = session.userId;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const progress = await getUserProgress(userId);

  await connectDB();
  const user = await User.findById(userId).lean();
  const languagePreference = user?.languagePreference as "ha" | "en" | undefined;
  const dict = dictionaries[languagePreference || "en"];

  // Get the group link for this course from database
  const groupLink = await getGroupLinkByCourseId(courseId);

  const allTopicIds = course.modules.flatMap((m) => m.topics.map((t) => t.id));
  if (!allTopicIds.includes(topicId)) notFound();

  return (
    <AppLayout dict={dict} currentLanguage={languagePreference || "en"}>
      <CourseClientPage
        course={course}
        initialProgress={progress}
        userId={userId}
        allTopicIds={allTopicIds}
        currentTopicId={topicId}
        groupLink={groupLink}
        dict={dict}
      />
    </AppLayout>
  );
}
