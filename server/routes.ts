import type { Express } from "express";
import { type Server } from "http";
import { db } from "./db";
import { contestants, disciplines, results, coffees } from "@shared/schema";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

// Hardcoded user-country mapping and admin
const USER_COUNTRY_MAP: Record<string, string[]> = {
  "@iameire": [
    "holy medicine hat empire", "dishwasher washer high", "hatin federative monarchy", "syldavia", "norway-sweden", "sc'ish", "éire", "444", "goral republic", "gurmany", "federative republic of the french revolutionaries", "greater iberia", "potat", "orban", "cornhub", "baklan", "calabria", "qassay", "skaterzz gang", "sybau"
  ],
  "@arabemir": [
    "usachina", "oe", "carterr empire", "icelandian commonwealth", "b'ish", "coconut kingdom", "ofban", "upni", "Andorra", "kosovo", "turkce", "finland", "haliar", "bavaria", "bois", "karpentar", "Darwin"
  ],
  "@yassauron": [
    "slapell coan", "gvm drop", "smile kingdom", "qulaq"
  ],
  "@j": [], // Assign as needed
  "@admin": [] // Admin can do anything
};

const ALLOWED_USERS = ["@iameire", "@arabemir", "@yassauron", "@j", "@admin"];

export async function registerRoutes(
    // === ADMIN API ROUTES ===
    // Update result (admin only)
    app.put('/api/admin/results/:id', async (req, res) => {
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (username !== "@admin") return res.status(403).json({ message: "Not allowed" });
      const id = parseInt(req.params.id);
      const { score } = req.body;
      if (typeof score !== 'number') return res.status(400).json({ message: "Invalid score" });
      const [updated] = await db.update(results).set({ score }).where(db.sql`${results.id} = ${id}`).returning();
      if (!updated) return res.status(404).json({ message: "Result not found" });
      res.json(updated);
    });

    // Delete result (admin only)
    app.delete('/api/admin/results/:id', async (req, res) => {
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (username !== "@admin") return res.status(403).json({ message: "Not allowed" });
      const id = parseInt(req.params.id);
      const [deleted] = await db.delete(results).where(db.sql`${results.id} = ${id}`).returning();
      if (!deleted) return res.status(404).json({ message: "Result not found" });
      res.json({ success: true });
    });

    // Update contestant (admin only)
    app.put('/api/admin/contestants/:id', async (req, res) => {
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (username !== "@admin") return res.status(403).json({ message: "Not allowed" });
      const id = parseInt(req.params.id);
      const { name, country, skillMultiplier, multiplierText } = req.body;
      const [updated] = await db.update(contestants).set({ name, country, skillMultiplier, multiplierText }).where(db.sql`${contestants.id} = ${id}`).returning();
      if (!updated) return res.status(404).json({ message: "Contestant not found" });
      res.json(updated);
    });

    // Delete contestant (admin only)
    app.delete('/api/admin/contestants/:id', async (req, res) => {
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (username !== "@admin") return res.status(403).json({ message: "Not allowed" });
      const id = parseInt(req.params.id);
      const [deleted] = await db.delete(contestants).where(db.sql`${contestants.id} = ${id}`).returning();
      if (!deleted) return res.status(404).json({ message: "Contestant not found" });
      res.json({ success: true });
    });

    // Update discipline (admin only)
    app.put('/api/admin/disciplines/:id', async (req, res) => {
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (username !== "@admin") return res.status(403).json({ message: "Not allowed" });
      const id = parseInt(req.params.id);
      const { name, icon } = req.body;
      const [updated] = await db.update(disciplines).set({ name, icon }).where(db.sql`${disciplines.id} = ${id}`).returning();
      if (!updated) return res.status(404).json({ message: "Discipline not found" });
      res.json(updated);
    });

    // Delete discipline (admin only)
    app.delete('/api/admin/disciplines/:id', async (req, res) => {
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (username !== "@admin") return res.status(403).json({ message: "Not allowed" });
      const id = parseInt(req.params.id);
      const [deleted] = await db.delete(disciplines).where(db.sql`${disciplines.id} = ${id}`).returning();
      if (!deleted) return res.status(404).json({ message: "Discipline not found" });
      res.json({ success: true });
    });
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Setup Auth
  const authEnabled = await setupAuth(app);
  if (authEnabled) {
    registerAuthRoutes(app);
  }

  // === SEED DATA ===
  try {
    await seedDatabase();
  } catch (error) {
    console.warn("Seed skipped:", error);
  }

  // === API ROUTES ===

  // Disciplines
  app.get(api.disciplines.list.path, async (req, res) => {
    const disciplines = await storage.getDisciplines();
    res.json(disciplines);
  });

  // Contestants
  app.get(api.contestants.list.path, async (req, res) => {
    const contestants = await storage.getContestants();
    // For each contestant, fetch their disciplines
    const withDisciplines = await Promise.all(
      contestants.map(async (c) => {
        const disciplines = await storage.getDisciplinesForContestant(c.id);
        return { ...c, disciplines };
      })
    );
    res.json(withDisciplines);
  });

  // Results
  app.get(api.results.list.path, async (req, res) => {
    const disciplineId = req.query.disciplineId
      ? parseInt(req.query.disciplineId as string)
      : undefined;
    const results = await storage.getResults(disciplineId);
    res.json(results);
  });

  app.post(api.results.create.path, async (req, res) => {
    try {
      // Get user info from session (OIDC claims)
      const user = req.user?.claims;
      const username = user?.preferred_username || user?.email || user?.sub;
      if (!username || !ALLOWED_USERS.includes(username)) {
        return res.status(403).json({ message: "Not allowed" });
      }

      const input = api.results.create.input.parse(req.body);

      // Check for existing result
      const existing = await storage.getResultByContestantAndDiscipline(
        input.contestantId,
        input.disciplineId,
      );
      if (existing) {
        return res.status(409).json({ message: "nuh uh ya cant roll twice" });
      }

      // Calculate score logic: roll * skillMultiplier
      const contestants = await storage.getContestants();
      const contestant = contestants.find((c) => c.id === input.contestantId);
      if (!contestant) {
        return res.status(400).json({ message: "Contestant not found" });
      }

      // Restrict by country unless admin
      if (username !== "@admin") {
        const allowedCountries = USER_COUNTRY_MAP[username] || [];
        if (!allowedCountries.includes(contestant.country)) {
          return res.status(403).json({ message: "You cannot roll for this country." });
        }
      }

      const score = input.roll * contestant.skillMultiplier;

      const result = await storage.createResult({
        contestantId: input.contestantId,
        disciplineId: input.disciplineId,
        score: score,
      });

      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Coffees
  app.get(api.coffees.get.path, async (req, res) => {
    const coffee = await storage.getCoffeeCount();
    res.json(coffee);
  });

  app.post(api.coffees.increment.path, async (req, res) => {
    const coffee = await storage.incrementCoffeeCount();
    res.json(coffee);
  });

  return httpServer;
}

async function seedDatabase() {
  const existingDisciplines = await storage.getDisciplines();
  if (existingDisciplines.length === 0) {
    const sports = [
      { name: "panegg", icon: "Egg" },
      { name: "skiing", icon: "Snowflake" },
      { name: "hockey", icon: "Trophy" },
      { name: "curling", icon: "CircleDot" },
      { name: "lumberjacking", icon: "Axe" },
      { name: "snowboarding", icon: "Mountain" },
      { name: "skeleton", icon: "Skull" },
    ];
    for (const sport of sports) {
      await storage.createDiscipline(sport.name, sport.icon);
    }
  }

  const existingContestants = await storage.getContestants();
  if (existingContestants.length === 0) {
    // Using the new file provided in the latest message
    const seedFiles = [
      "attached_assets/Pasted--iameire-50-people-holy-medicine-hat-empire-wyatt-macle_1770920975692.txt",
      "attached_assets/Bez_názdvu_1770908384534.txt",
    ];

    let fileToUse = "";
    for (const f of seedFiles) {
      if (fs.existsSync(path.resolve(process.cwd(), f))) {
        fileToUse = f;
        break;
      }
    }

    if (fileToUse) {
      try {
        const content = fs.readFileSync(
          path.resolve(process.cwd(), fileToUse),
          "utf-8",
        );
        const lines = content
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        let currentCountry = "";
        const seenContestants = new Set();
        
        // Get all discipline IDs
        const allDisciplines = await storage.getDisciplines();
        const disciplineIds = allDisciplines.map(d => d.id);

        for (const line of lines) {
          // Skip header lines like "@iameire (50 people)"
          if (line.startsWith("@")) continue;

          const personMatch = line.match(/^(.+) — x([\d\.]+)$/);
          if (personMatch) {
            const name = personMatch[1];
            const multiplier = parseFloat(personMatch[2]);
            const multiplierText = `x${multiplier}`;

            if (currentCountry && !seenContestants.has(`${name}-${currentCountry}`)) {
              // Create contestant
              const contestant = await storage.createContestant(name, currentCountry, multiplier, multiplierText);
              seenContestants.add(`${name}-${currentCountry}`);

              // Assign 1-3 random disciplines (mostly 1)
              let numDisciplines = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 2 : 3);
              // Ensure we don't assign more disciplines than exist
              numDisciplines = Math.min(numDisciplines, disciplineIds.length);
              // Shuffle and pick
              const shuffled = [...disciplineIds].sort(() => Math.random() - 0.5);
              const assigned = shuffled.slice(0, numDisciplines);
              for (const disciplineId of assigned) {
                await storage.addDisciplineToContestant(contestant.id, disciplineId);
              }
            }
          } else {
            // Assume it's a country
            currentCountry = line;
          }
        }
      } catch (e) {
        console.error("Error seeding contestants:", e);
      }
    }
  }

  await storage.getCoffeeCount();
}
