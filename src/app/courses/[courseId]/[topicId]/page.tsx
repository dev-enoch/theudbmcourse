import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { getCourseById, getUserProgress } from "@/lib/data";
import { getGroupLinkByCourseId } from "@/lib/settings";
import { redirect, notFound } from "next/navigation";
import { CourseClientPage } from "./_components/CourseClientPage";
import AppLayout from "@/components/common/AppLayout";

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

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const progress = await getUserProgress(userId);

  // Get the group link for this course from database
  const groupLink = await getGroupLinkByCourseId(courseId);

  const allTopicIds = course.modules.flatMap((m) => m.topics.map((t) => t.id));
  if (!allTopicIds.includes(topicId)) notFound();

  return (
    <AppLayout>
      <CourseClientPage
        course={course}
        initialProgress={progress}
        userId={userId}
        allTopicIds={allTopicIds}
        currentTopicId={topicId}
        groupLink={groupLink}
      />
    </AppLayout>
  );
}
