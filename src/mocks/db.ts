import initialMockData from "./mock-data.json";
import { generateSeedData } from "./seed-reset";

const STORAGE_KEY = "hotel_saas_mock_db_v1";

type MockDatabase = typeof initialMockData;

let memoryDb: MockDatabase | null = null;

export function getDb(): MockDatabase {
  if (typeof window === "undefined") {
    if (!memoryDb) {
      memoryDb = JSON.parse(JSON.stringify(initialMockData));
    }
    return memoryDb!;
  }

  if (!memoryDb) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryDb = JSON.parse(stored);
      } else {
        memoryDb = JSON.parse(JSON.stringify(initialMockData));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDb));
      }
    } catch {
      memoryDb = JSON.parse(JSON.stringify(initialMockData));
    }
  }

  return memoryDb!;
}

export function saveDb(newDb: MockDatabase): void {
  memoryDb = newDb;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    } catch (e) {
      console.warn("Failed to persist mock DB to localStorage", e);
    }
  }
}

export function resetDb(): void {
  const freshData = generateSeedData();
  memoryDb = freshData as any;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
    } catch (e) {
      console.warn("Failed to reset mock DB in localStorage", e);
    }
  }
}

export function nextId(tableOrPrefix: string): string {
  const rand = Math.random().toString(36).substring(2, 7);
  const time = Date.now().toString().slice(-4);
  return `${tableOrPrefix}_${rand}${time}`;
}
