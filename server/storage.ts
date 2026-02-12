import { db } from "./db";
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

export interface IStorage extends IAuthStorage {
  // Disciplines
  getDisciplines(): Promise<Discipline[]>;
  createDiscipline(name: string, icon: string): Promise<Discipline>;

  // Contestants
  getContestants(): Promise<Contestant[]>;
  createContestant(name: string, country: string, skillMultiplier: number, multiplierText: string): Promise<Contestant>;

  // Results
  getResults(disciplineId?: number): Promise<(Result & { contestantName: string; country: string; disciplineId: number; score: number })[]>;
  createResult(result: InsertResult): Promise<Result>;
  getResultByContestantAndDiscipline(contestantId: number, disciplineId: number): Promise<Result | undefined>;

  // Coffees
  getCoffeeCount(): Promise<Coffee>;
  incrementCoffeeCount(): Promise<Coffee>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  // Disciplines
  async getDisciplines(): Promise<Discipline[]> {
    return await db.select().from(disciplines);
  }

  async createDiscipline(name: string, icon: string): Promise<Discipline> {
    const [discipline] = await db.insert(disciplines).values({ name, icon }).returning();
    return discipline;
  }

  // Contestants
  async getContestants(): Promise<Contestant[]> {
    return await db.select().from(contestants);
  }

  async createContestant(name: string, country: string, skillMultiplier: number, multiplierText: string): Promise<Contestant> {
    const [contestant] = await db.insert(contestants).values({ name, country, skillMultiplier, multiplierText }).returning();
    return contestant;
  }

  // Results
  async getResults(disciplineId?: number): Promise<(Result & { contestantName: string; country: string; disciplineId: number; score: number })[]> {
    const query = db.select({
      id: results.id,
      score: results.score,
      contestantName: contestants.name,
      country: contestants.country,
      disciplineId: results.disciplineId,
      contestantId: results.contestantId,
      rolledAt: results.rolledAt
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

  async getResultByContestantAndDiscipline(contestantId: number, disciplineId: number): Promise<Result | undefined> {
    const [result] = await db.select().from(results).where(
      and(
        eq(results.contestantId, contestantId),
        eq(results.disciplineId, disciplineId)
      )
    );
    return result;
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await db.insert(results).values(insertResult).returning();
    return result;
  }

  // Coffees
  async getCoffeeCount(): Promise<Coffee> {
    const [coffee] = await db.select().from(coffees);
    if (!coffee) {
      // Initialize if not exists
      const [newCoffee] = await db.insert(coffees).values({ count: 0 }).returning();
      return newCoffee;
    }
    return coffee;
  }

  async incrementCoffeeCount(): Promise<Coffee> {
    const current = await this.getCoffeeCount();
    const [updated] = await db.update(coffees)
      .set({ count: current.count + 1 })
      .where(eq(coffees.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
