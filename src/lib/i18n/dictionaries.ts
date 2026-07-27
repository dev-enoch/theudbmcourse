export type Language = "en" | "ha";

export const dictionaries = {
  en: {
    dashboard: {
      title: "Start Your Journey",
      subtitle: "Practical, action-oriented courses with real results.",
      ourCourses: "Our Courses",
      noCourses: "No Courses Available",
      noCoursesDesc: "There are currently no courses available on the platform. Please check back later!",
      progress: "Progress",
      reviewCourse: "Review Course",
      continueCourse: "Continue Course",
      startCourse: "Start Course",
      completed: "Completed"
    },
    nav: {
      dashboard: "Dashboard",
      logout: "Log out",
      adminDashboard: "Admin Dashboard",
      courses: "Courses",
      profile: "Profile"
    },
    courseOverview: {
      courseNotFound: "Course Not Found",
      courseNotFoundDesc: "The course you are looking for does not exist or has been removed.",
      backToHome: "Back to Home",
      startCourse: "Start Course",
      reviewCourse: "Review Course",
      courseContent: "Course Content",
      supportGroup: "Need Help?",
      supportGroupDesc: "Join the exclusive WhatsApp support group for students to ask questions and connect.",
      joinSupportGroup: "Join Support Group",
    },
    topic: {
      topicNotFound: "Topic Not Found",
      topicNotFoundDesc: "The topic you are looking for does not exist or has been removed.",
      backToCourse: "Back to Course",
      upNext: "Up Next",
      previous: "Previous",
      next: "Next",
      markAsCompleted: "Mark as Completed",
      markAsIncomplete: "Mark as Incomplete"
    }
  },
  ha: {
    dashboard: {
      title: "Fara Karatu",
      subtitle: "Courses masu saukin ganewa.",
      ourCourses: "Courses Din Mu",
      noCourses: "Babu Course Yanzu",
      noCoursesDesc: "Babu course a yanzu. Don Allah duba anjima.",
      progress: "Ci Gaba",
      reviewCourse: "Koma Kan Course",
      continueCourse: "Ci Gaba",
      startCourse: "Fara Course",
      completed: "An Gama"
    },
    nav: {
      dashboard: "Dashboard",
      logout: "Log out",
      adminDashboard: "Admin Dashboard",
      courses: "Courses",
      profile: "Profile"
    },
    courseOverview: {
      courseNotFound: "Babu Wannan Course",
      courseNotFoundDesc: "Babu course din da kake nema.",
      backToHome: "Koma Home",
      startCourse: "Fara Course",
      reviewCourse: "Koma Kan Course",
      courseContent: "Lessons Din Cikin Course",
      supportGroup: "Kuna Neman Taimako?",
      supportGroupDesc: "Shiga group din WhatsApp na musamman don dalibai don yin tambayoyi da haduwa da mutane.",
      joinSupportGroup: "Shiga Group Din Support",
    },
    topic: {
      topicNotFound: "Babu Wannan Lesson",
      topicNotFoundDesc: "Babu lesson din da kake nema.",
      backToCourse: "Koma Course",
      upNext: "Na Gaba",
      previous: "Na Baya",
      next: "Na Gaba",
      markAsCompleted: "Nuna An Gama",
      markAsIncomplete: "Nuna Ba a Gama Ba"
    }
  }
};

export type Dictionary = typeof dictionaries.en;
