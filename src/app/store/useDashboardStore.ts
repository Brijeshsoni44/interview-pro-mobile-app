import { create } from 'zustand';
import {
  Roadmap, RoadmapStep, RoadmapRepository,
  CodingQuestion, PracticeRepository,
  StudyPlan, PlannerRepository,
  MockInterview, BehavioralAnswer, InterviewRepository,
  JobApplication, ApplicationRepository,
  ProgressLog, AnalyticsRepository
} from '../../repositories';

interface DashboardState {
  roadmaps: Roadmap[];
  roadmapSteps: Record<number, RoadmapStep[]>;
  questions: CodingQuestion[];
  studyPlans: StudyPlan[];
  mockInterviews: MockInterview[];
  behavioralAnswers: BehavioralAnswer[];
  applications: JobApplication[];
  progressLogs: ProgressLog[];
  isLoading: boolean;

  // Sync operations
  refreshAllData: () => Promise<void>;
  
  // Roadmap operations
  toggleRoadmapStep: (stepId: number, roadmapId: number, isCompleted: boolean) => Promise<void>;
  
  // Question operations
  refreshQuestions: (topic?: string, difficulty?: string, query?: string) => Promise<void>;
  toggleQuestionBookmark: (questionId: number, isBookmarked: boolean) => Promise<void>;
  toggleQuestionComplete: (questionId: number, isCompleted: boolean) => Promise<void>;
  updateQuestionNotes: (questionId: number, notes: string) => Promise<void>;
  
  // Study Planner operations
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'is_completed'>) => Promise<void>;
  togglePlanComplete: (planId: number, isCompleted: boolean) => Promise<void>;
  deleteStudyPlan: (planId: number) => Promise<void>;

  // Interview operations
  addMockInterview: (interview: Omit<MockInterview, 'id'>) => Promise<void>;
  saveBehavioralAnswer: (category: string, question: string, answer: string) => Promise<void>;
  refreshBehavioralAnswers: (category?: string) => Promise<void>;

  // Applications operations
  addApplication: (app: Omit<JobApplication, 'id'>) => Promise<void>;
  updateApplicationStatus: (appId: number, status: JobApplication['status']) => Promise<void>;
  deleteApplication: (appId: number) => Promise<void>;

  // Analytics operations
  trackStudyTime: (minutes: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  roadmaps: [],
  roadmapSteps: {},
  questions: [],
  studyPlans: [],
  mockInterviews: [],
  behavioralAnswers: [],
  applications: [],
  progressLogs: [],
  isLoading: false,

  refreshAllData: async () => {
    set({ isLoading: true });
    try {
      const roadmaps = await RoadmapRepository.getRoadmaps();
      const stepsMap: Record<number, RoadmapStep[]> = {};
      
      for (const roadmap of roadmaps) {
        stepsMap[roadmap.id] = await RoadmapRepository.getRoadmapSteps(roadmap.id);
      }

      const questions = await PracticeRepository.getQuestions('All', 'All');
      const studyPlans = await PlannerRepository.getStudyPlans();
      const mockInterviews = await InterviewRepository.getMockInterviews();
      const behavioralAnswers = await InterviewRepository.getBehavioralAnswers();
      const applications = await ApplicationRepository.getApplications();
      const progressLogs = await AnalyticsRepository.getProgressTracking();

      set({
        roadmaps,
        roadmapSteps: stepsMap,
        questions,
        studyPlans,
        mockInterviews,
        behavioralAnswers,
        applications,
        progressLogs,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to sync database data with store:', error);
      set({ isLoading: false });
    }
  },

  toggleRoadmapStep: async (stepId, roadmapId, isCompleted) => {
    try {
      await RoadmapRepository.toggleStepComplete(stepId, isCompleted);
      
      // Update local state
      const steps = get().roadmapSteps[roadmapId] || [];
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, is_completed: isCompleted } : step
      );

      // Increment progress tracker if completed
      if (isCompleted) {
        await AnalyticsRepository.incrementTopicScore();
        await AnalyticsRepository.trackStudyTime(15); // Auto-award 15 mins for completing a step
      }

      const updatedProgressLogs = await AnalyticsRepository.getProgressTracking();

      set({
        roadmapSteps: {
          ...get().roadmapSteps,
          [roadmapId]: updatedSteps
        },
        progressLogs: updatedProgressLogs
      });
    } catch (error) {
      console.error('Failed to toggle roadmap step:', error);
    }
  },

  refreshQuestions: async (topic, difficulty, query) => {
    try {
      const questions = await PracticeRepository.getQuestions(topic, difficulty, query);
      set({ questions });
    } catch (error) {
      console.error('Failed to filter questions:', error);
    }
  },

  toggleQuestionBookmark: async (questionId, isBookmarked) => {
    try {
      await PracticeRepository.toggleBookmark(questionId, isBookmarked);
      set({
        questions: get().questions.map(q => 
          q.id === questionId ? { ...q, is_bookmarked: isBookmarked } : q
        )
      });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  },

  toggleQuestionComplete: async (questionId, isCompleted) => {
    try {
      await PracticeRepository.toggleQuestionComplete(questionId, isCompleted);
      
      if (isCompleted) {
        await AnalyticsRepository.incrementTopicScore();
        await AnalyticsRepository.trackStudyTime(10); // Auto-award 10 mins for completing a question
      }
      
      const updatedProgressLogs = await AnalyticsRepository.getProgressTracking();

      set({
        questions: get().questions.map(q => 
          q.id === questionId ? { ...q, is_completed: isCompleted } : q
        ),
        progressLogs: updatedProgressLogs
      });
    } catch (error) {
      console.error('Failed to toggle question completion:', error);
    }
  },

  updateQuestionNotes: async (questionId, notes) => {
    try {
      await PracticeRepository.updateQuestionNotes(questionId, notes);
      set({
        questions: get().questions.map(q => 
          q.id === questionId ? { ...q, notes } : q
        )
      });
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  },

  addStudyPlan: async (plan) => {
    try {
      await PlannerRepository.addStudyPlan(plan);
      const studyPlans = await PlannerRepository.getStudyPlans();
      set({ studyPlans });
    } catch (error) {
      console.error('Failed to add study plan:', error);
    }
  },

  togglePlanComplete: async (planId, isCompleted) => {
    try {
      await PlannerRepository.togglePlanComplete(planId, isCompleted);
      const studyPlans = get().studyPlans.map(p => 
        p.id === planId ? { ...p, is_completed: isCompleted } : p
      );
      set({ studyPlans });
    } catch (error) {
      console.error('Failed to toggle study plan:', error);
    }
  },

  deleteStudyPlan: async (planId) => {
    try {
      await PlannerRepository.deleteStudyPlan(planId);
      set({ studyPlans: get().studyPlans.filter(p => p.id !== planId) });
    } catch (error) {
      console.error('Failed to delete study plan:', error);
    }
  },

  addMockInterview: async (interview) => {
    try {
      await InterviewRepository.addMockInterview(interview);
      const mockInterviews = await InterviewRepository.getMockInterviews();
      
      // Auto-log progress
      await AnalyticsRepository.incrementTopicScore();
      await AnalyticsRepository.trackStudyTime(interview.duration);
      const progressLogs = await AnalyticsRepository.getProgressTracking();

      set({ mockInterviews, progressLogs });
    } catch (error) {
      console.error('Failed to add mock interview:', error);
    }
  },

  saveBehavioralAnswer: async (category, question, answer) => {
    try {
      await InterviewRepository.saveBehavioralAnswer(category, question, answer);
      const behavioralAnswers = await InterviewRepository.getBehavioralAnswers();
      
      // Auto-log progress
      await AnalyticsRepository.trackStudyTime(10);
      const progressLogs = await AnalyticsRepository.getProgressTracking();

      set({ behavioralAnswers, progressLogs });
    } catch (error) {
      console.error('Failed to save behavioral answer:', error);
    }
  },

  refreshBehavioralAnswers: async (category) => {
    try {
      const behavioralAnswers = await InterviewRepository.getBehavioralAnswers(category);
      set({ behavioralAnswers });
    } catch (error) {
      console.error('Failed to load behavioral answers:', error);
    }
  },

  addApplication: async (app) => {
    try {
      await ApplicationRepository.addApplication(app);
      const applications = await ApplicationRepository.getApplications();
      set({ applications });
    } catch (error) {
      console.error('Failed to add application:', error);
    }
  },

  updateApplicationStatus: async (appId, status) => {
    try {
      await ApplicationRepository.updateApplicationStatus(appId, status);
      const applications = get().applications.map(app => 
        app.id === appId ? { ...app, status } : app
      );
      set({ applications });
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  },

  deleteApplication: async (appId) => {
    try {
      await ApplicationRepository.deleteApplication(appId);
      set({ applications: get().applications.filter(app => app.id !== appId) });
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  },

  trackStudyTime: async (minutes) => {
    try {
      await AnalyticsRepository.trackStudyTime(minutes);
      const progressLogs = await AnalyticsRepository.getProgressTracking();
      set({ progressLogs });
    } catch (error) {
      console.error('Failed to track study time:', error);
    }
  }
}));
