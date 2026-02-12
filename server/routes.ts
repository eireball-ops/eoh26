import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === SEED DATA ===
  await seedDatabase();

  // === API ROUTES ===

  // Disciplines
  app.get(api.disciplines.list.path, async (req, res) => {
    const disciplines = await storage.getDisciplines();
    res.json(disciplines);
  });

  // Contestants
  app.get(api.contestants.list.path, async (req, res) => {
    const contestants = await storage.getContestants();
    res.json(contestants);
  });

  // Results
  app.get(api.results.list.path, async (req, res) => {
    const disciplineId = req.query.disciplineId ? parseInt(req.query.disciplineId as string) : undefined;
    const results = await storage.getResults(disciplineId);
    res.json(results);
  });

  app.post(api.results.create.path, async (req, res) => {
    try {
      const input = api.results.create.input.parse(req.body);

      // Check for existing result
      const existing = await storage.getResultByContestantAndDiscipline(input.contestantId, input.disciplineId);
      if (existing) {
        return res.status(409).json({ message: "nuh uh ya cant roll twice" });
      }

      // Calculate score logic: roll * skillMultiplier
      // Wait, we need the contestant's multiplier first
      const contestants = await storage.getContestants();
      const contestant = contestants.find(c => c.id === input.contestantId);
      if (!contestant) {
        return res.status(400).json({ message: "Contestant not found" });
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
          field: err.errors[0].path.join('.'),
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
      { name: "hockey", icon: "Trophy" }, // Lucide doesn't have Hockey, using generic
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
    // Parse the file
    try {
      const filePath = path.resolve(process.cwd(), "attached_assets/Bez_názdvu_1770908384534.txt");
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Simple heuristic: If a line has "x[Number]", it's a person. If not, and it's not a person, it might be a country.
        // Actually the file format seems to be: Country, Person, Person.
        // But the spacing is weird.
        // Let's use the regex for " — x" to identify people.
        
        let currentCountry = "";
        
        for (const line of lines) {
          const personMatch = line.match(/^(.+) — x([\d\.]+)$/);
          if (personMatch) {
            const name = personMatch[1];
            const multiplier = parseFloat(personMatch[2]);
            const multiplierText = `x${multiplier}`;
            
            if (currentCountry) {
               await storage.createContestant(name, currentCountry, multiplier, multiplierText);
            }
          } else {
            // Assume it's a country
            currentCountry = line;
          }
        }
      } else {
        console.warn("Seed file not found:", filePath);
        // Fallback seed if file missing
        await storage.createContestant("Test Athlete", "Testland", 1.5, "x1.5");
      }
    } catch (e) {
      console.error("Error seeding contestants:", e);
    }
  }
  
  // Ensure coffee counter exists
  await storage.getCoffeeCount();
}
