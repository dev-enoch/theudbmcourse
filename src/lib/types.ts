export interface UserProgress {
  [topicId: string]: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  videoId: string;
}

export interface Module {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  image?: string;
  title: string;
  description?: string;
  language?: string;
  modules: Module[];
}

export type User = {
  id: string;
  name?: string;
  email: string;
  role: "user" | "admin";
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
