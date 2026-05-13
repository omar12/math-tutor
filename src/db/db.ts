import { Dexie, type EntityTable } from 'dexie'

// --- TypeScript interfaces ---

export interface Session {
  id?: number           // auto-incremented primary key
  topic: string         // 'addition' | 'subtraction' | 'word-problems'
  date: string          // ISO date string
  correctCount: number
  totalCount: number
}

export interface TopicProgress {
  topic: string         // primary key — one record per topic
  accuracy: number      // 0–1 float
  attemptCount: number
  lastPracticed: string // ISO date string
}

export interface AppConfig {
  key: string           // primary key: 'pinHash' | 'lastLessonId' | 'onboardingComplete'
  value: string
}

// --- Database definition ---

const db = new Dexie('MathTutorDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  topicProgress: EntityTable<TopicProgress, 'topic'>
  appConfig: EntityTable<AppConfig, 'key'>
}

db.version(1).stores({
  sessions:      '++id, topic, date',
  topicProgress: 'topic',
  appConfig:     'key',
})

export { db }
