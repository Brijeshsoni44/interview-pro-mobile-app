import { db } from '../database/db';

// Interfaces for Domain Entities
export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
  experience_level: string;
  current_role: string;
  target_role: string;
  is_premium: boolean;
  streak: number;
  last_active_date: string;
}

export interface Roadmap {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
}

export interface RoadmapStep {
  id: number;
  roadmap_id: number;
  title: string;
  description: string;
  order_num: number;
  is_completed: boolean;
  estimated_time: string;
}

export interface StudyPlan {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  is_completed: boolean;
}

export interface CodingQuestion {
  id: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  company_tags: string;
  solution: string;
  notes: string;
  is_completed: boolean;
  is_bookmarked: boolean;
  code_snippet?: string;
}

export interface MockInterview {
  id: number;
  title: string;
  date: string;
  duration: number; // in minutes
  score: number; // rating 1-100
  feedback: string;
  status: string;
}

export interface BehavioralAnswer {
  id: number;
  category: string;
  question: string;
  answer: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: 'Applied' | 'Interview Scheduled' | 'Rejected' | 'Offer Received';
  applied_date: string;
  notes: string;
}

export interface ProgressLog {
  id: number;
  date: string;
  daily_learning_time: number; // minutes
  score: number;
}

// 1. User Repository
export const UserRepository = {
  async getUser(): Promise<User | null> {
    const res = await db.executeSql('SELECT * FROM users LIMIT 1');
    if (res.rows.length === 0) return null;
    const item = res.rows.raw()[0];
    return {
      ...item,
      is_premium: item.is_premium === 1,
    };
  },

  async updateUser(user: Partial<User>): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];
    
    Object.keys(user).forEach((key) => {
      if (key === 'id') return;
      fields.push(`${key} = ?`);
      let val = (user as any)[key];
      if (key === 'is_premium') val = val ? 1 : 0;
      params.push(val);
    });

    if (fields.length === 0) return;
    
    // Assume there is only one user profile stored locally
    await db.executeSql(`UPDATE users SET ${fields.join(', ')}`, params);
  },

  async updateStreak(streak: number, activeDate: string): Promise<void> {
    await db.executeSql('UPDATE users SET streak = ?, last_active_date = ?', [streak, activeDate]);
  }
};

// 2. Roadmap Repository
export const RoadmapRepository = {
  async getRoadmaps(): Promise<Roadmap[]> {
    const res = await db.executeSql('SELECT * FROM roadmaps');
    return res.rows.raw();
  },

  async getRoadmapSteps(roadmapId: number): Promise<RoadmapStep[]> {
    const res = await db.executeSql('SELECT * FROM roadmap_steps WHERE roadmap_id = ? ORDER BY order_num ASC', [roadmapId]);
    return res.rows.raw().map(step => ({
      ...step,
      is_completed: step.is_completed === 1
    }));
  },

  async toggleStepComplete(stepId: number, isCompleted: boolean): Promise<void> {
    await db.executeSql('UPDATE roadmap_steps SET is_completed = ? WHERE id = ?', [isCompleted ? 1 : 0, stepId]);
  }
};

// 3. Coding Question / Practice Repository
export const PracticeRepository = {
  async getQuestions(topic?: string, difficulty?: string, query?: string): Promise<CodingQuestion[]> {
    let sql = 'SELECT * FROM coding_questions WHERE 1=1';
    const params: any[] = [];

    if (topic && topic !== 'All') {
      sql += ' AND topic = ?';
      params.push(topic);
    }
    if (difficulty && difficulty !== 'All') {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }
    if (query) {
      sql += ' AND (title LIKE ? OR solution LIKE ? OR company_tags LIKE ?)';
      const likeParam = `%${query}%`;
      params.push(likeParam, likeParam, likeParam);
    }

    const res = await db.executeSql(sql, params);
    return res.rows.raw().map(item => ({
      ...item,
      is_completed: item.is_completed === 1,
      is_bookmarked: item.is_bookmarked === 1
    }));
  },

  async getBookmarkedQuestions(): Promise<CodingQuestion[]> {
    const res = await db.executeSql('SELECT * FROM coding_questions WHERE is_bookmarked = 1');
    return res.rows.raw().map(item => ({
      ...item,
      is_completed: item.is_completed === 1,
      is_bookmarked: item.is_bookmarked === 1
    }));
  },

  async toggleBookmark(questionId: number, isBookmarked: boolean): Promise<void> {
    await db.executeSql('UPDATE coding_questions SET is_bookmarked = ? WHERE id = ?', [isBookmarked ? 1 : 0, questionId]);
  },

  async toggleQuestionComplete(questionId: number, isCompleted: boolean): Promise<void> {
    await db.executeSql('UPDATE coding_questions SET is_completed = ? WHERE id = ?', [isCompleted ? 1 : 0, questionId]);
  },

  async updateQuestionNotes(questionId: number, notes: string): Promise<void> {
    await db.executeSql('UPDATE coding_questions SET notes = ? WHERE id = ?', [notes, questionId]);
  }
};

// 4. Study Planner Repository
export const PlannerRepository = {
  async getStudyPlans(): Promise<StudyPlan[]> {
    const res = await db.executeSql('SELECT * FROM study_plans ORDER BY priority DESC, start_date ASC');
    return res.rows.raw().map(item => ({
      ...item,
      is_completed: item.is_completed === 1
    }));
  },

  async addStudyPlan(plan: Omit<StudyPlan, 'id' | 'is_completed'>): Promise<number> {
    const res = await db.executeSql(
      'INSERT INTO study_plans (title, start_date, end_date, priority, category, is_completed) VALUES (?, ?, ?, ?, ?, 0)',
      [plan.title, plan.start_date, plan.end_date, plan.priority, plan.category]
    );
    return res.insertId || Date.now();
  },

  async togglePlanComplete(planId: number, isCompleted: boolean): Promise<void> {
    await db.executeSql('UPDATE study_plans SET is_completed = ? WHERE id = ?', [isCompleted ? 1 : 0, planId]);
  },

  async deleteStudyPlan(planId: number): Promise<void> {
    await db.executeSql('DELETE FROM study_plans WHERE id = ?', [planId]);
  }
};

// 5. Mock Interview & Behavioral Repository
export const InterviewRepository = {
  async getMockInterviews(): Promise<MockInterview[]> {
    const res = await db.executeSql('SELECT * FROM mock_interviews ORDER BY date DESC');
    return res.rows.raw();
  },

  async addMockInterview(interview: Omit<MockInterview, 'id'>): Promise<number> {
    const res = await db.executeSql(
      'INSERT INTO mock_interviews (title, date, duration, score, feedback, status) VALUES (?, ?, ?, ?, ?, ?)',
      [interview.title, interview.date, interview.duration, interview.score, interview.feedback, interview.status]
    );
    return res.insertId || Date.now();
  },

  async getBehavioralAnswers(category?: string): Promise<BehavioralAnswer[]> {
    let sql = 'SELECT * FROM behavioral_answers';
    const params: any[] = [];
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    const res = await db.executeSql(sql, params);
    return res.rows.raw();
  },

  async saveBehavioralAnswer(category: string, question: string, answer: string): Promise<void> {
    // Check if question already has answer
    const check = await db.executeSql('SELECT id FROM behavioral_answers WHERE question = ? LIMIT 1', [question]);
    const todayStr = new Date().toISOString();

    if (check.rows.length > 0) {
      const id = check.rows.raw()[0].id;
      await db.executeSql(
        'UPDATE behavioral_answers SET answer = ?, updated_at = ? WHERE id = ?',
        [answer, todayStr, id]
      );
    } else {
      await db.executeSql(
        'INSERT INTO behavioral_answers (category, question, answer, updated_at) VALUES (?, ?, ?, ?)',
        [category, question, answer, todayStr]
      );
    }
  }
};

// 6. Job Applications Tracker Repository
export const ApplicationRepository = {
  async getApplications(): Promise<JobApplication[]> {
    const res = await db.executeSql('SELECT * FROM applications ORDER BY applied_date DESC');
    return res.rows.raw();
  },

  async addApplication(app: Omit<JobApplication, 'id'>): Promise<number> {
    const res = await db.executeSql(
      'INSERT INTO applications (company, role, status, applied_date, notes) VALUES (?, ?, ?, ?, ?)',
      [app.company, app.role, app.status, app.applied_date, app.notes]
    );
    return res.insertId || Date.now();
  },

  async updateApplicationStatus(appId: number, status: JobApplication['status']): Promise<void> {
    await db.executeSql('UPDATE applications SET status = ? WHERE id = ?', [status, appId]);
  },

  async deleteApplication(appId: number): Promise<void> {
    await db.executeSql('DELETE FROM applications WHERE id = ?', [appId]);
  }
};

// 7. Analytics Progress Tracker Repository
export const AnalyticsRepository = {
  async getProgressTracking(): Promise<ProgressLog[]> {
    const res = await db.executeSql('SELECT * FROM progress_tracking ORDER BY date ASC');
    return res.rows.raw();
  },

  async trackStudyTime(minutes: number): Promise<void> {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if today already has log
    const check = await db.executeSql('SELECT * FROM progress_tracking WHERE date = ? LIMIT 1', [todayStr]);
    if (check.rows.length > 0) {
      const current = check.rows.raw()[0];
      const newTime = current.daily_learning_time + minutes;
      await db.executeSql('UPDATE progress_tracking SET daily_learning_time = ? WHERE date = ?', [newTime, todayStr]);
    } else {
      await db.executeSql('INSERT INTO progress_tracking (date, daily_learning_time, score) VALUES (?, ?, 0)', [todayStr, minutes]);
    }
  },

  async incrementTopicScore(): Promise<void> {
    const todayStr = new Date().toISOString().split('T')[0];
    const check = await db.executeSql('SELECT * FROM progress_tracking WHERE date = ? LIMIT 1', [todayStr]);
    if (check.rows.length > 0) {
      const current = check.rows.raw()[0];
      await db.executeSql('UPDATE progress_tracking SET score = ? WHERE date = ?', [current.score + 1, todayStr]);
    } else {
      await db.executeSql('INSERT INTO progress_tracking (date, daily_learning_time, score) VALUES (?, 0, 1)', [todayStr]);
    }
  }
};
