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
      subtitle: "Kwasoshi masu saukin ganewa.",
      ourCourses: "Kwasoshin Mu",
      noCourses: "Babu Kwas Yanzu",
      noCoursesDesc: "Babu kwas a yanzu. Don Allah duba anjima.",
      progress: "Ci Gaba",
      reviewCourse: "Koma Kan Kwas",
      continueCourse: "Ci Gaba",
      completed: "An Gama"
    },
    nav: {
      dashboard: "Dashboard",
      logout: "Log out",
      adminDashboard: "Admin Dashboard",
      courses: "Kwasoshi",
      profile: "Profile"
    },
    courseOverview: {
      courseNotFound: "Babu Wannan Kwas",
      courseNotFoundDesc: "Babu kwas din da kake nema.",
      backToHome: "Koma Home",
      startCourse: "Fara Kwas",
      reviewCourse: "Koma Kan Kwas",
      courseContent: "Darussan Cikin Kwas",
    },
    topic: {
      topicNotFound: "Babu Wannan Darasi",
      topicNotFoundDesc: "Babu darasin da kake nema.",
      backToCourse: "Koma Kwas",
      upNext: "Na Gaba",
      previous: "Na Baya",
      next: "Na Gaba",
      markAsCompleted: "Nuna An Gama",
      markAsIncomplete: "Nuna Ba a Gama Ba"
    }
  }
};

export type Dictionary = typeof dictionaries.en;
