import { Platform } from 'react-native';

// Interfaces for Database Rows
export interface Database {
  executeSql: (query: string, params?: any[]) => Promise<any>;
}

let sqliteModule: any = null;
try {
  sqliteModule = require('react-native-sqlite-storage');
  // Enable promise support
  if (sqliteModule && sqliteModule.enablePromise) {
    sqliteModule.enablePromise(true);
  }
} catch (e) {
  console.warn('react-native-sqlite-storage not found, falling back to JS database engine', e);
}

// Custom JS Fallback Database Engine (Mock SQL Parser & Store)
class MockSqliteDatabase implements Database {
  private store: Record<string, any[]> = {
    users: [],
    roadmaps: [],
    roadmap_steps: [],
    study_plans: [],
    coding_questions: [],
    bookmarks: [],
    notes: [],
    mock_interviews: [],
    behavioral_answers: [],
    applications: [],
    progress_tracking: [],
  };

  constructor() {
    console.log('[MockDB] Mock SQLite engine initialized.');
  }

  async executeSql(query: string, params: any[] = []): Promise<{ rows: { raw: () => any[]; length: number }; insertId?: number }> {
    const cleanQuery = query.trim().replace(/\s+/g, ' ');
    const upperQuery = cleanQuery.toUpperCase();

    if (upperQuery.startsWith('CREATE TABLE') || upperQuery.startsWith('PRAGMA')) {
      return { rows: { raw: () => [], length: 0 } };
    }

    if (upperQuery.startsWith('INSERT INTO')) {
      const tableMatch = cleanQuery.match(/INSERT\s+INTO\s+(\w+)/i);
      if (!tableMatch) throw new Error('Could not parse table name from INSERT');
      const tableName = tableMatch[1].toLowerCase();
      
      const colsMatch = cleanQuery.match(/\(([^)]+)\)/);
      if (!colsMatch) throw new Error('Could not parse columns from INSERT');
      const columns = colsMatch[1].split(',').map(c => c.trim().replace(/['"`]/g, ''));

      const row: Record<string, any> = { id: Date.now() + Math.floor(Math.random() * 1000) };
      columns.forEach((col, index) => {
        row[col] = params[index];
      });

      if (!this.store[tableName]) {
        this.store[tableName] = [];
      }
      
      if (tableName === 'users' && this.store.users.length > 0) {
        this.store.users[0] = { ...this.store.users[0], ...row };
        return { rows: { raw: () => [this.store.users[0]], length: 1 }, insertId: this.store.users[0].id };
      }

      this.store[tableName].push(row);
      return { rows: { raw: () => [row], length: 1 }, insertId: row.id };
    }

    if (upperQuery.startsWith('SELECT')) {
      const tableMatch = cleanQuery.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Could not parse table name from SELECT');
      const tableName = tableMatch[1].toLowerCase();

      let results = [...(this.store[tableName] || [])];

      if (upperQuery.includes('WHERE')) {
        const whereClause = cleanQuery.split(/where/i)[1].split(/order\s+by|limit/i)[0].trim();
        const conditions = whereClause.split(/\s+AND\s+/i);
        
        let paramIndex = 0;
        conditions.forEach(condition => {
          const parts = condition.split('=');
          if (parts.length === 2) {
            const col = parts[0].trim().toLowerCase();
            const val = parts[1].trim();
            let checkVal: any;
            if (val === '?') {
              checkVal = params[paramIndex++];
            } else {
              checkVal = val.replace(/['"]/g, '').trim();
            }

            results = results.filter(row => {
              if (row[col] === undefined) return true;
              return String(row[col]).toLowerCase() === String(checkVal).toLowerCase();
            });
          }
        });
      }

      if (upperQuery.includes('LIMIT')) {
        const limitMatch = cleanQuery.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1], 10);
          results = results.slice(0, limit);
        }
      }

      return {
        rows: {
          raw: () => results,
          length: results.length
        }
      };
    }

    if (upperQuery.startsWith('UPDATE')) {
      const tableMatch = cleanQuery.match(/UPDATE\s+(\w+)/i);
      if (!tableMatch) throw new Error('Could not parse table name from UPDATE');
      const tableName = tableMatch[1].toLowerCase();

      const setPart = cleanQuery.split(/set/i)[1].split(/where/i)[0].trim();
      const assignments = setPart.split(',').map(a => a.trim());

      let whereId: any = null;
      if (upperQuery.includes('WHERE')) {
        const whereClause = cleanQuery.split(/where/i)[1].trim();
        const idMatch = whereClause.match(/id\s*=\s*\??/i);
        if (idMatch) {
          const parts = whereClause.split('=');
          if (parts[1].trim() === '?') {
            whereId = params[params.length - 1];
          } else {
            whereId = parseInt(parts[1].trim(), 10);
          }
        }
      }

      let updatedCount = 0;
      this.store[tableName] = (this.store[tableName] || []).map(row => {
        if (whereId === null || row.id === whereId || (tableName === 'users' && this.store.users.length === 1)) {
          const updatedRow = { ...row };
          assignments.forEach((assignment, idx) => {
            const col = assignment.split('=')[0].trim().toLowerCase();
            updatedRow[col] = params[idx];
          });
          updatedCount++;
          return updatedRow;
        }
        return row;
      });

      return { rows: { raw: () => [], length: updatedCount } };
    }

    if (upperQuery.startsWith('DELETE')) {
      const tableMatch = cleanQuery.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Could not parse table name from DELETE');
      const tableName = tableMatch[1].toLowerCase();

      let whereId: any = null;
      if (upperQuery.includes('WHERE')) {
        const whereClause = cleanQuery.split(/where/i)[1].trim();
        const parts = whereClause.split('=');
        if (parts[1].trim() === '?') {
          whereId = params[0];
        } else {
          whereId = parseInt(parts[1].trim(), 10);
        }
      }

      const initialLength = this.store[tableName]?.length || 0;
      if (whereId !== null) {
        this.store[tableName] = (this.store[tableName] || []).filter(row => row.id !== whereId);
      } else {
        this.store[tableName] = [];
      }
      const deletedCount = initialLength - (this.store[tableName]?.length || 0);

      return { rows: { raw: () => [], length: deletedCount } };
    }

    return { rows: { raw: () => [], length: 0 } };
  }
}

class DatabaseService {
  private db: Database | null = null;
  private isFallback: boolean = false;

  async init(): Promise<Database> {
    if (this.db) return this.db;

    if (sqliteModule && Platform.OS !== 'web') {
      try {
        const nativeDb = await sqliteModule.openDatabase({
          name: 'interview_prep.db',
          location: 'default',
        });
        console.log('[SQLite] Native database opened successfully.');
        this.db = nativeDb;
        this.isFallback = false;
      } catch (error) {
        console.warn('[SQLite] Open native database failed, using JS fallback:', error);
        this.db = new MockSqliteDatabase();
        this.isFallback = true;
      }
    } else {
      this.db = new MockSqliteDatabase();
      this.isFallback = true;
    }

    // Run migrations and schema creation
    await this.runMigrations();
    return this.db as Database;
  }

  // Helper method that formats SQL output uniformly for native react-native-sqlite-storage and mock-JS database
  private async executeSqlOnDb(database: Database, query: string, params: any[] = []): Promise<{ rows: { raw: () => any[]; length: number }; insertId?: number }> {
    if (this.isFallback) {
      return database.executeSql(query, params);
    } else {
      // Native react-native-sqlite-storage resolves executeSql promises to [ResultSet]
      const res = await database.executeSql(query, params);
      const results = Array.isArray(res) ? res[0] : res;
      
      // Polyfill raw() if it doesn't exist natively
      if (results && results.rows && typeof results.rows.raw !== 'function') {
        const rowsList: any[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          rowsList.push(results.rows.item(i));
        }
        results.rows.raw = () => rowsList;
      }
      
      return results;
    }
  }

  async executeSql(query: string, params: any[] = []): Promise<{ rows: { raw: () => any[]; length: number }; insertId?: number }> {
    const database = await this.init();
    return this.executeSqlOnDb(database, query, params);
  }

  private async runMigrations() {
    console.log('[SQLite] Running migrations...');

    // Create tables
    const schemas = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        profile_picture TEXT,
        experience_level TEXT,
        current_role TEXT,
        target_role TEXT,
        is_premium INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_active_date TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS roadmaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        category TEXT,
        difficulty TEXT,
        estimated_time TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS roadmap_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roadmap_id INTEGER,
        title TEXT,
        description TEXT,
        order_num INTEGER,
        is_completed INTEGER DEFAULT 0,
        estimated_time TEXT,
        FOREIGN KEY(roadmap_id) REFERENCES roadmaps(id)
      )`,
      `CREATE TABLE IF NOT EXISTS study_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        start_date TEXT,
        end_date TEXT,
        priority TEXT,
        category TEXT,
        is_completed INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS coding_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        difficulty TEXT,
        topic TEXT,
        company_tags TEXT,
        solution TEXT,
        notes TEXT,
        is_completed INTEGER DEFAULT 0,
        is_bookmarked INTEGER DEFAULT 0,
        code_snippet TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS mock_interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        duration INTEGER,
        score INTEGER,
        feedback TEXT,
        status TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS behavioral_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        question TEXT,
        answer TEXT,
        updated_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT,
        role TEXT,
        status TEXT,
        applied_date TEXT,
        notes TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS progress_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE,
        daily_learning_time INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0
      )`
    ];

    for (const schema of schemas) {
      await this.executeSqlOnDb(this.db!, schema);
    }

    console.log('[SQLite] Tables created successfully.');
    await this.seedDataIfEmpty();
  }

  private async seedDataIfEmpty() {
    // Check if user exists
    const usersResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM users LIMIT 1');
    if (usersResult.rows.length === 0) {
      console.log('[SQLite] Seeding initial profile...');
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO users (name, email, profile_picture, experience_level, current_role, target_role, is_premium, streak, last_active_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Rahul Sharma',
          'rahul.sharma@email.com',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
          'Intermediate',
          'React Native Developer',
          'Lead Mobile Architect',
          1, // Premium Member
          5, // Streak
          new Date().toISOString().split('T')[0]
        ]
      );
    }

    // Check if roadmaps exist
    const roadmapsResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM roadmaps LIMIT 1');
    if (roadmapsResult.rows.length === 0) {
      console.log('[SQLite] Seeding roadmaps...');
      const roadmapSeeds = [
        { id: 1, title: 'React Native Roadmap', description: 'Master cross-platform mobile development with React Native, Reanimated, and native modules.', category: 'React Native', difficulty: 'Advanced', time: '12 weeks' },
        { id: 2, title: 'iOS Roadmap', description: 'Become an expert iOS developer mastering Swift, SwiftUI, UIKit, and iOS architectures.', category: 'iOS', difficulty: 'Intermediate', time: '8 weeks' },
        { id: 3, title: 'Android Roadmap', description: 'Learn Android app development, Kotlin, Jetpack Compose, and architectural components.', category: 'Android', difficulty: 'Intermediate', time: '8 weeks' },
        { id: 4, title: 'Frontend Roadmap', description: 'Acquire deep frontend expertise in HTML/CSS, Core JS, TS, React, and performance tools.', category: 'Frontend', difficulty: 'Beginner', time: '10 weeks' }
      ];

      for (const roadmap of roadmapSeeds) {
        await this.executeSqlOnDb(
          this.db!,
          'INSERT INTO roadmaps (id, title, description, category, difficulty, estimated_time) VALUES (?, ?, ?, ?, ?, ?)',
          [roadmap.id, roadmap.title, roadmap.description, roadmap.category, roadmap.difficulty, roadmap.time]
        );
      }

      // Seed Roadmap Steps
      console.log('[SQLite] Seeding roadmap steps...');
      const stepSeeds = [
        // RN Roadmap steps
        { roadmap_id: 1, title: 'JavaScript Core & ES6+', description: 'Understand prototype inheritance, closures, event loop, and promises.', order_num: 1, time: '1 week' },
        { roadmap_id: 1, title: 'React Basics & Hooks', description: 'Master state management, component lifecycle, ref, memoization, and custom hooks.', order_num: 2, time: '2 weeks' },
        { roadmap_id: 1, title: 'React Native Layout & Styling', description: 'Familiarize with Flexbox, styled-components, and responsive designs.', order_num: 3, time: '1 week' },
        { roadmap_id: 1, title: 'React Navigation v7', description: 'Implement stack, tab, and drawer navigations with nested routing.', order_num: 4, time: '2 weeks' },
        { roadmap_id: 1, title: 'Zustand & Redux Toolkit', description: 'Select and implement optimized state managers for lightweight/heavy data.', order_num: 5, time: '1 week' },
        { roadmap_id: 1, title: 'Native Bridges & Reanimated', description: 'Write native modules in Swift/Kotlin and perform 60 FPS animations.', order_num: 6, time: '3 weeks' },
        { roadmap_id: 1, title: 'App Store & Play Store Publishing', description: 'Configure signing, build scripts, fastlane pipelines, and OTA updates.', order_num: 7, time: '2 weeks' },

        // Frontend Roadmap steps
        { roadmap_id: 4, title: 'HTML5 Semantic Structure', description: 'SEO optimization, headers, sections, articles, and semantic layout tags.', order_num: 1, time: '3 days' },
        { roadmap_id: 4, title: 'CSS Grid & Flexbox Layouts', description: 'Build responsive grids, dynamic landing pages, and handle css variables.', order_num: 2, time: '4 days' },
        { roadmap_id: 4, title: 'TypeScript Core Types & Interfaces', description: 'Generics, union types, strict checks, and tsconfig settings.', order_num: 3, time: '1 week' },
      ];

      for (const step of stepSeeds) {
        await this.executeSqlOnDb(
          this.db!,
          'INSERT INTO roadmap_steps (roadmap_id, title, description, order_num, is_completed, estimated_time) VALUES (?, ?, ?, ?, ?, ?)',
          [step.roadmap_id, step.title, step.description, step.order_num, 0, step.time]
        );
      }
    }

    // Check if coding questions exist
    const questionsResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM coding_questions LIMIT 1');
    if (questionsResult.rows.length === 0) {
      console.log('[SQLite] Seeding coding questions from JSON...');
      const rawQuestions = require('../data/questions.json');
      for (const q of rawQuestions) {
        const companyTags = q.company || 'FAANG, Stripe, Uber';
        await this.executeSqlOnDb(
          this.db!,
          `INSERT INTO coding_questions (title, difficulty, topic, company_tags, solution, notes, is_completed, is_bookmarked, code_snippet)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            q.question.slice(0, 80) + '...',
            q.difficulty,
            q.topic,
            companyTags,
            q.detailed_answer,
            '', // notes
            0,  // is_completed
            0,  // is_bookmarked
            q.code_snippet || ''
          ]
        );
      }
    }

    // Seed default Study Plans if empty
    const plannerResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM study_plans LIMIT 1');
    if (plannerResult.rows.length === 0) {
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO study_plans (title, start_date, end_date, priority, category, is_completed)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Master Advanced Closures & Async/Await',
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          'High',
          'Javascript',
          0
        ]
      );
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO study_plans (title, start_date, end_date, priority, category, is_completed)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Practice System Design - Rate Limiting',
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          'Medium',
          'System Design',
          0
        ]
      );
    }

    // Seed default Mock Interviews if empty
    const mockResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM mock_interviews LIMIT 1');
    if (mockResult.rows.length === 0) {
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO mock_interviews (title, date, duration, score, feedback, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Senior React Native Mock Interview',
          new Date(Date.now() - 86400000 * 2).toISOString(),
          45, // mins
          80, // score percentage
          'Excellent understanding of Reanimated and Callbacks. Work on Native Bridge details.',
          'Completed'
        ]
      );
    }

    // Seed default Behavioral Answers if empty
    const behavioralResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM behavioral_answers LIMIT 1');
    if (behavioralResult.rows.length === 0) {
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO behavioral_answers (category, question, answer, updated_at)
         VALUES (?, ?, ?, ?)`,
        [
          'Conflict Resolution',
          'Describe a time when you had a major technical disagreement with another engineer and how you resolved it.',
          'Situation: Disagreed on using Redux vs Zustand for screen-state.\nTask: Find a path forward without stalling the milestone.\nAction: Ran benchmark tests, created a working demo for both systems showing speed and bundle differences.\nResult: Convinced teammate to use Zustand for modularity, and we finished the sprint 2 days early.',
          new Date().toISOString()
        ]
      );
    }

    // Seed default applications if empty
    const appResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM applications LIMIT 1');
    if (appResult.rows.length === 0) {
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO applications (company, role, status, applied_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'Stripe',
          'Senior React Native Engineer',
          'Interview Scheduled',
          new Date().toISOString().split('T')[0],
          'Prepare system design (API Gateway, Rate Limiting, Client Offline Sync).'
        ]
      );
      await this.executeSqlOnDb(
        this.db!,
        `INSERT INTO applications (company, role, status, applied_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'Linear',
          'Mobile Product Engineer',
          'Applied',
          new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
          'Offline-first app specialization is a huge plus here.'
        ]
      );
    }

    // Seed progress logs for streak and data graphing
    const analyticsResult = await this.executeSqlOnDb(this.db!, 'SELECT * FROM progress_tracking LIMIT 1');
    if (analyticsResult.rows.length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        const learningTime = 20 + Math.floor(Math.random() * 60);
        const score = 1 + Math.floor(Math.random() * 3);
        await this.executeSqlOnDb(
          this.db!,
          'INSERT OR IGNORE INTO progress_tracking (date, daily_learning_time, score) VALUES (?, ?, ?)',
          [dateString, learningTime, score]
        );
      }
    }
  }
}

export const db = new DatabaseService();
export default db;
