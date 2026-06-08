import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainDrawer: undefined;
  Quiz: undefined;
  Result: undefined;
  RoadmapDetail: { roadmapId: number; title: string };
  QuestionDetail: { questionId: number };
  MockInterviewRunner: { interviewId?: number };
  AddStudyPlan: undefined;
  AddApplication: undefined;
};

export type DrawerParamList = {
  Home: NavigatorScreenParams<MainTabParamList>;
  Roadmap: undefined;
  StudyPlan: undefined;
  Progress: undefined;
  Bookmarks: undefined;
  History: undefined;
  CodingPractice: undefined;
  MockInterviews: undefined;
  Quizzes: undefined;
  TopInterviewQuestions: undefined;
  Notes: undefined;
  VideoTutorials: undefined;
  Courses: undefined;
  UsefulLinks: undefined;
  Settings: undefined;
  HelpSupport: undefined;
};
