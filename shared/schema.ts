import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export auth models
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const disciplines = pgTable("disciplines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(), // Lucide icon name or similar
});

export const contestants = pgTable("contestants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  skillMultiplier: real("skill_multiplier").notNull(),
  multiplierText: text("multiplier_text").notNull(), // e.g. "x2.4"
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  contestantId: integer("contestant_id").notNull(),
  disciplineId: integer("discipline_id").notNull(),
  score: real("score").notNull(),
  rolledAt: timestamp("rolled_at").defaultNow(),
});

export const coffees = pgTable("coffees", {
  id: serial("id").primaryKey(),
  count: integer("count").notNull().default(0),
});

// === RELATIONS ===
export const resultsRelations = relations(results, ({ one }) => ({
  contestant: one(contestants, {
    fields: [results.contestantId],
    references: [contestants.id],
  }),
  discipline: one(disciplines, {
    fields: [results.disciplineId],
    references: [disciplines.id],
  }),
}));

// === SCHEMAS ===
export const insertDisciplineSchema = createInsertSchema(disciplines).omit({ id: true });
export const insertContestantSchema = createInsertSchema(contestants).omit({ id: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true, rolledAt: true });
export const insertCoffeeSchema = createInsertSchema(coffees).omit({ id: true });

// === TYPES ===
export type Discipline = typeof disciplines.$inferSelect;
export type Contestant = typeof contestants.$inferSelect;
export type Result = typeof results.$inferSelect;
export type Coffee = typeof coffees.$inferSelect;

export type InsertResult = z.infer<typeof insertResultSchema>;

// Request types
export type CreateResultRequest = {
  contestantId: number;
  disciplineId: number;
  roll: number; // The raw dice roll (1-20)
};

export type LeaderboardEntry = {
  id: number;
  contestantName: string;
  country: string;
  score: number;
  disciplineId: number;
};
