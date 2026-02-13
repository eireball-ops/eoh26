import { getDbOrThrow, isDatabaseConfigured } from "./db";
import { kv } from "@vercel/kv";
import {
  disciplines,
  contestants,
  results,
  coffees,
  type Discipline,
  type Contestant,
  type Result,
  type Coffee,
  type CreateResultRequest,
  type InsertResult,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth";
import type { User, UpsertUser } from "@shared/models/auth";

const isKvConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
);

export interface IStorage extends IAuthStorage {
    // Contestant-Disciplines (many-to-many)
    addDisciplineToContestant(contestantId: number, disciplineId: number): Promise<void>;
    getDisciplinesForContestant(contestantId: number): Promise<Discipline[]>;
  // Disciplines
  getDisciplines(): Promise<Discipline[]>;
  createDiscipline(name: string, icon: string): Promise<Discipline>;

  // Contestants
  getContestants(): Promise<Contestant[]>;
  createContestant(
    name: string,
    country: string,
    skillMultiplier: number,
    multiplierText: string,
  ): Promise<Contestant>;

  // Results
  getResults(disciplineId?: number): Promise<
    (Result & {
      contestantName: string;
      country: string;
      disciplineId: number;
      score: number;
    })[]
  >;
  createResult(result: InsertResult): Promise<Result>;
  getResultByContestantAndDiscipline(
    contestantId: number,
    disciplineId: number,
  ): Promise<Result | undefined>;

  // Coffees
  getCoffeeCount(): Promise<Coffee>;
  incrementCoffeeCount(): Promise<Coffee>;
}

export class DatabaseStorage implements IStorage {
    // Contestant-Disciplines (many-to-many)
    async addDisciplineToContestant(contestantId: number, disciplineId: number): Promise<void> {
      await db.insert(contestantDisciplines).values({ contestantId, disciplineId });
    }

    async getDisciplinesForContestant(contestantId: number): Promise<Discipline[]> {
      const rows = await db
        .select({
          id: disciplines.id,
          name: disciplines.name,
          icon: disciplines.icon,
        })
        .from(contestantDisciplines)
        .innerJoin(disciplines, eq(contestantDisciplines.disciplineId, disciplines.id))
        .where(eq(contestantDisciplines.contestantId, contestantId));
      return rows;
    }
  // Auth methods delegated to authStorage
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  private get db() {
    return getDbOrThrow();
  }

  // Disciplines
  async getDisciplines(): Promise<Discipline[]> {
    return await this.db.select().from(disciplines);
  }

  async createDiscipline(name: string, icon: string): Promise<Discipline> {
    const [discipline] = await this.db
      .insert(disciplines)
      .values({ name, icon })
      .returning();
    return discipline;
  }

  // Contestants
  async getContestants(): Promise<Contestant[]> {
    return await this.db.select().from(contestants);
  }

  async createContestant(
    name: string,
    country: string,
    skillMultiplier: number,
    multiplierText: string,
  ): Promise<Contestant> {
    const [contestant] = await this.db
      .insert(contestants)
      .values({ name, country, skillMultiplier, multiplierText })
      .returning();
    return contestant;
  }

  // Results
  async getResults(disciplineId?: number): Promise<
    (Result & {
      contestantName: string;
      country: string;
      disciplineId: number;
      score: number;
    })[]
  > {
    const query = this.db
      .select({
        id: results.id,
        score: results.score,
        contestantName: contestants.name,
        country: contestants.country,
        disciplineId: results.disciplineId,
        contestantId: results.contestantId,
        rolledAt: results.rolledAt,
      })
      .from(results)
      .innerJoin(contestants, eq(results.contestantId, contestants.id))
      .orderBy(desc(results.score));

    if (disciplineId) {
      query.where(eq(results.disciplineId, disciplineId));
    }

    // @ts-ignore - complex join return type inference
    return await query;
  }

  async getResultByContestantAndDiscipline(
    contestantId: number,
    disciplineId: number,
  ): Promise<Result | undefined> {
    const [result] = await this.db
      .select()
      .from(results)
      .where(
        and(
          eq(results.contestantId, contestantId),
          eq(results.disciplineId, disciplineId),
        ),
      );
    return result;
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await this.db
      .insert(results)
      .values(insertResult)
      .returning();
    return result;
  }

  // Coffees
  async getCoffeeCount(): Promise<Coffee> {
    const [coffee] = await this.db.select().from(coffees);
    if (!coffee) {
      // Initialize if not exists
      const [newCoffee] = await this.db
        .insert(coffees)
        .values({ count: 0 })
        .returning();
      return newCoffee;
    }
    return coffee;
  }

  async incrementCoffeeCount(): Promise<Coffee> {
    const current = await this.getCoffeeCount();
    const [updated] = await this.db
      .update(coffees)
      .set({ count: current.count + 1 })
      .where(eq(coffees.id, current.id))
      .returning();
    return updated;
  }
}

class MemoryStorage implements IStorage {
  private disciplinesData: Discipline[] = [];
  private contestantsData: Contestant[] = [];
  private resultsData: Result[] = [];
  private coffeeData: Coffee = { id: 1, count: 0 };
  private users = new Map<string, User>();
  private nextDisciplineId = 1;
  private nextContestantId = 1;
  private nextResultId = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    const user: User = {
      ...existing,
      ...userData,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    } as User;
    this.users.set(userData.id, user);
    return user;
  }

  async getDisciplines(): Promise<Discipline[]> {
    return [...this.disciplinesData];
  }

  async createDiscipline(name: string, icon: string): Promise<Discipline> {
    const discipline: Discipline = {
      id: this.nextDisciplineId++,
      name,
      icon,
    };
    this.disciplinesData.push(discipline);
    return discipline;
  }

  async getContestants(): Promise<Contestant[]> {
    return [...this.contestantsData];
  }

  async createContestant(
    name: string,
    country: string,
    skillMultiplier: number,
    multiplierText: string,
  ): Promise<Contestant> {
    const contestant: Contestant = {
      id: this.nextContestantId++,
      name,
      country,
      skillMultiplier,
      multiplierText,
    };
    this.contestantsData.push(contestant);
    return contestant;
  }

  async getResults(disciplineId?: number): Promise<
    (Result & {
      contestantName: string;
      country: string;
      disciplineId: number;
      score: number;
    })[]
  > {
    const results = disciplineId
      ? this.resultsData.filter(
          (result) => result.disciplineId === disciplineId,
        )
      : [...this.resultsData];

    const byContestantId = new Map(
      this.contestantsData.map((contestant) => [contestant.id, contestant]),
    );

    return results
      .map((result) => {
        const contestant = byContestantId.get(result.contestantId);
        return {
          ...result,
          contestantName: contestant?.name ?? "Unknown",
          country: contestant?.country ?? "Unknown",
          disciplineId: result.disciplineId,
          score: result.score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  async getResultByContestantAndDiscipline(
    contestantId: number,
    disciplineId: number,
  ): Promise<Result | undefined> {
    return this.resultsData.find(
      (result) =>
        result.contestantId === contestantId &&
        result.disciplineId === disciplineId,
    );
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const result: Result = {
      id: this.nextResultId++,
      ...insertResult,
      rolledAt: new Date(),
    };
    this.resultsData.push(result);
    return result;
  }

  async getCoffeeCount(): Promise<Coffee> {
    return this.coffeeData;
  }

  async incrementCoffeeCount(): Promise<Coffee> {
    this.coffeeData = { ...this.coffeeData, count: this.coffeeData.count + 1 };
    return this.coffeeData;
  }
}

class KvStorage implements IStorage {
  private async getArray<T>(key: string): Promise<T[]> {
    const value = await kv.get<T[]>(key);
    return Array.isArray(value) ? value : [];
  }

  private async setArray<T>(key: string, value: T[]): Promise<void> {
    await kv.set(key, value);
  }

  private async getNextId(counterKey: string): Promise<number> {
    const next = await kv.incr(counterKey);
    return typeof next === "number" ? next : Number(next);
  }

  async getUser(id: string): Promise<User | undefined> {
    const users = (await kv.get<Record<string, User>>("users")) ?? {};
    return users[id];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const users = (await kv.get<Record<string, User>>("users")) ?? {};
    const existing = users[userData.id];
    const user: User = {
      ...existing,
      ...userData,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    } as User;
    users[userData.id] = user;
    await kv.set("users", users);
    return user;
  }

  async getDisciplines(): Promise<Discipline[]> {
    return await this.getArray<Discipline>("disciplines");
  }

  async createDiscipline(name: string, icon: string): Promise<Discipline> {
    const disciplines = await this.getArray<Discipline>("disciplines");
    const discipline: Discipline = {
      id: await this.getNextId("discipline:id"),
      name,
      icon,
    };
    disciplines.push(discipline);
    await this.setArray("disciplines", disciplines);
    return discipline;
  }

  async getContestants(): Promise<Contestant[]> {
    return await this.getArray<Contestant>("contestants");
  }

  async createContestant(
    name: string,
    country: string,
    skillMultiplier: number,
    multiplierText: string,
  ): Promise<Contestant> {
    const contestants = await this.getArray<Contestant>("contestants");
    const contestant: Contestant = {
      id: await this.getNextId("contestant:id"),
      name,
      country,
      skillMultiplier,
      multiplierText,
    };
    contestants.push(contestant);
    await this.setArray("contestants", contestants);
    return contestant;
  }

  async getResults(disciplineId?: number): Promise<
    (Result & {
      contestantName: string;
      country: string;
      disciplineId: number;
      score: number;
    })[]
  > {
    const results = await this.getArray<Result>("results");
    const contestants = await this.getArray<Contestant>("contestants");
    const byContestantId = new Map(
      contestants.map((contestant) => [contestant.id, contestant]),
    );

    return results
      .filter((result) =>
        disciplineId ? result.disciplineId === disciplineId : true,
      )
      .map((result) => {
        const contestant = byContestantId.get(result.contestantId);
        return {
          ...result,
          contestantName: contestant?.name ?? "Unknown",
          country: contestant?.country ?? "Unknown",
          disciplineId: result.disciplineId,
          score: result.score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  async getResultByContestantAndDiscipline(
    contestantId: number,
    disciplineId: number,
  ): Promise<Result | undefined> {
    const results = await this.getArray<Result>("results");
    return results.find(
      (result) =>
        result.contestantId === contestantId &&
        result.disciplineId === disciplineId,
    );
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const results = await this.getArray<Result>("results");
    const result: Result = {
      id: await this.getNextId("result:id"),
      ...insertResult,
      rolledAt: new Date(),
    };
    results.push(result);
    await this.setArray("results", results);
    return result;
  }

  async getCoffeeCount(): Promise<Coffee> {
    const coffee = await kv.get<Coffee>("coffee");
    if (coffee) {
      return coffee;
    }
    const initial: Coffee = { id: 1, count: 0 };
    await kv.set("coffee", initial);
    return initial;
  }

  async incrementCoffeeCount(): Promise<Coffee> {
    const current = await this.getCoffeeCount();
    const updated = { ...current, count: current.count + 1 };
    await kv.set("coffee", updated);
    return updated;
  }
}

export const storage = isDatabaseConfigured
  ? new DatabaseStorage()
  : isKvConfigured
    ? new KvStorage()
    : new MemoryStorage();
