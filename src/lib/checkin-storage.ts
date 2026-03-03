import { neon } from '@neondatabase/serverless';

export interface CheckInEntry {
  date: string; // YYYY-MM-DD
  smoked: boolean;
  count?: string;
  urgeTime?: string;
  feeling?: string;
  reflection?: string;
}

const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;
const sql = neon(DATABASE_URL);

function getUserId() {
  const userId = sessionStorage.getItem("user_id");
  if (!userId) throw new Error("User not authenticated");
  return userId;
}

export async function upsertUser(userId: string): Promise<void> {
  await sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`;
}

export async function getHistory(): Promise<CheckInEntry[]> {
  try {
    const userId = getUserId();
    const rows = await sql`
      SELECT date::text, smoked, count, urge_time as "urgeTime", feeling, reflection 
      FROM check_in_entries 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;
    return rows as unknown as CheckInEntry[];
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
}

export async function saveCheckIn(entry: CheckInEntry): Promise<void> {
  const userId = getUserId();
  await upsertUser(userId);

  await sql`
    INSERT INTO check_in_entries (user_id, date, smoked, count, urge_time, feeling, reflection)
    VALUES (${userId}, ${entry.date}, ${entry.smoked}, ${entry.count || null}, ${entry.urgeTime || null}, ${entry.feeling || null}, ${entry.reflection || null})
    ON CONFLICT (user_id, date) DO UPDATE SET
      smoked = EXCLUDED.smoked,
      count = EXCLUDED.count,
      urge_time = EXCLUDED.urge_time,
      feeling = EXCLUDED.feeling,
      reflection = EXCLUDED.reflection
  `;
}

export async function getWeekHistory(): Promise<(CheckInEntry | null)[]> {
  const userId = getUserId();
  const history = await getHistory();
  const result: (CheckInEntry | null)[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push(history.find((e) => e.date === key) ?? null);
  }

  return result;
}

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekDates(): { key: string; label: string; dayName: string }[] {
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      key: d.toISOString().split("T")[0],
      label: d.getDate().toString(),
      dayName: days[d.getDay()], // These match the keys in translation.json under history.days
    });
  }

  return result;
}
