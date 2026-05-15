import { Dexie, type EntityTable } from 'dexie'
import type { Topic } from '../curriculum/types'

// --- Branded date type ---

/** ISO 8601 date-only string: YYYY-MM-DD */
export type ISODateString = string & { readonly _brand: 'ISODateString' }

/** Converts a Date to an ISODateString (YYYY-MM-DD). Use this whenever writing date fields. */
export function toISODateString(d: Date): ISODateString {
  // Use local calendar date, not UTC date — avoids wrong-day attribution for
  // users in timezones far from UTC (e.g. UTC-5 late night, UTC+10 just past midnight).
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day   = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}` as ISODateString
}

// --- TypeScript interfaces ---

export interface Session {
  id?: number           // auto-incremented primary key
  lessonId: string      // foreign key -> Lesson.id
  topic: Topic          // canonical Topic union from src/curriculum/types
  grade: 1 | 2 | 3     // denormalized for easy filtering
  date: ISODateString
  correctCount: number
  totalCount: number
}

export interface TopicProgress {
  topic: Topic          // primary key — Topic union from src/curriculum/types
  accuracy: number      // 0–1 float
  attemptCount: number
  lastPracticed: ISODateString
}

export interface AppConfig {
  key: 'pinHash' | 'lastLessonId' | 'onboardingComplete'
  value: string
}

// --- Database definition ---

const db = new Dexie('MathTutorDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  topicProgress: EntityTable<TopicProgress, 'topic'>
  appConfig: EntityTable<AppConfig, 'key'>
}

db.version(1).stores({
  sessions:      '++id, lessonId, topic, grade, date',
  topicProgress: 'topic',
  appConfig:     'key',
})

export { db }

// --- PIN helpers (CR-01: enforce hashing at the storage boundary) ---

/**
 * Hashes a raw PIN string using SHA-256 via the Web Crypto API.
 * Always call this before storePinHash — never pass raw digits to the DB.
 */
export async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Stores a PIN hash in the database.
 * Throws if the argument is not a valid SHA-256 hex digest (64 hex chars).
 * Call hashPin(rawPin) first — never pass the raw PIN here.
 */
export async function storePinHash(hexDigest: string): Promise<void> {
  if (!/^[0-9a-f]{64}$/.test(hexDigest)) {
    throw new Error('storePinHash: argument must be a SHA-256 hex digest (64 hex chars)')
  }
  await db.appConfig.put({ key: 'pinHash', value: hexDigest })
}
