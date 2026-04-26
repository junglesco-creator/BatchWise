import { Router, type IRouter } from "express";
import { db, blueprintsTable, type Blueprint, type TechItem } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { generateBlueprintFromPrompt } from "../lib/blueprintGenerator";

const router: IRouter = Router();

const generateBodySchema = z.object({
  prompt: z.string().min(3).max(2000),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function serializeBlueprint(b: Blueprint) {
  return {
    ...b,
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/blueprints", async (_req, res) => {
  const rows = await db.select().from(blueprintsTable).orderBy(desc(blueprintsTable.createdAt));
  res.json(rows.map(serializeBlueprint));
});

router.post("/blueprints/generate", async (req, res) => {
  const parsed = generateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Prompt must be at least 3 characters" });
    return;
  }

  try {
    const data = await generateBlueprintFromPrompt(parsed.data.prompt);
    const [inserted] = await db.insert(blueprintsTable).values(data).returning();
    if (!inserted) {
      res.status(500).json({ error: "Failed to save blueprint" });
      return;
    }
    res.status(201).json(serializeBlueprint(inserted));
  } catch (err) {
    req.log.error({ err }, "Failed to generate blueprint");
    res.status(500).json({ error: err instanceof Error ? err.message : "Generation failed" });
  }
});

router.get("/blueprints/stats/overview", async (_req, res) => {
  const rows = await db.select().from(blueprintsTable);
  const totalBlueprints = rows.length;
  const totalFavorites = rows.filter((b) => b.favorite).length;
  const totalFeatures = rows.reduce((sum, b) => sum + b.features.length, 0);
  const totalPages = rows.reduce((sum, b) => sum + b.pages.length, 0);
  const totalEstimatedHours = rows.reduce((sum, b) => sum + b.estimatedHours, 0);
  const averageHoursPerBlueprint =
    totalBlueprints > 0 ? Math.round((totalEstimatedHours / totalBlueprints) * 10) / 10 : 0;

  const techNames = new Set<string>();
  rows.forEach((b) => b.techStack.forEach((t) => techNames.add(t.name)));
  const categories = new Set<string>(rows.map((b) => b.category));

  res.json({
    totalBlueprints,
    totalFavorites,
    totalFeatures,
    totalPages,
    totalEstimatedHours,
    averageHoursPerBlueprint,
    uniqueTechnologies: techNames.size,
    uniqueCategories: categories.size,
  });
});

router.get("/blueprints/stats/recent", async (_req, res) => {
  const rows = await db
    .select()
    .from(blueprintsTable)
    .orderBy(desc(blueprintsTable.createdAt))
    .limit(8);
  res.json(rows.map(serializeBlueprint));
});

router.get("/blueprints/stats/popular-tech", async (_req, res) => {
  const rows = await db.select().from(blueprintsTable);
  const counts = new Map<string, { name: string; category: string; count: number }>();
  rows.forEach((b) => {
    b.techStack.forEach((t: TechItem) => {
      const key = t.name.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { name: t.name, category: t.category, count: 1 });
      }
    });
  });
  const sorted = Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 12);
  res.json(sorted);
});

router.get("/blueprints/stats/categories", async (_req, res) => {
  const result = await db
    .select({
      category: blueprintsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(blueprintsTable)
    .groupBy(blueprintsTable.category)
    .orderBy(desc(sql`count(*)`));
  res.json(result);
});

router.get("/blueprints/inspiration/prompts", (_req, res) => {
  res.json(INSPIRATION_PROMPTS);
});

router.get("/blueprints/:id", async (req, res) => {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  const [row] = await db.select().from(blueprintsTable).where(eq(blueprintsTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  res.json(serializeBlueprint(row));
});

router.delete("/blueprints/:id", async (req, res) => {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  const deleted = await db
    .delete(blueprintsTable)
    .where(eq(blueprintsTable.id, parsed.data.id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  res.status(204).end();
});

router.patch("/blueprints/:id/favorite", async (req, res) => {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  const [current] = await db
    .select()
    .from(blueprintsTable)
    .where(eq(blueprintsTable.id, parsed.data.id));
  if (!current) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  const [updated] = await db
    .update(blueprintsTable)
    .set({ favorite: !current.favorite })
    .where(eq(blueprintsTable.id, parsed.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Blueprint not found" });
    return;
  }
  res.json(serializeBlueprint(updated));
});

const INSPIRATION_PROMPTS = [
  {
    title: "Quiet journal",
    prompt: "A minimalist daily journaling app that gently nudges me to reflect with one beautiful question each morning.",
    emoji: "🌿",
  },
  {
    title: "Recipe remix",
    prompt: "An app that takes whatever ingredients I have in the fridge and suggests three creative dinners I can cook tonight.",
    emoji: "🍳",
  },
  {
    title: "Side project tracker",
    prompt: "A tool for indie hackers to track all their side projects, momentum, and shipping streaks in one calm dashboard.",
    emoji: "🚀",
  },
  {
    title: "Coffee bean log",
    prompt: "A tasting notebook for home baristas to log every coffee they brew, dial in recipes, and track their favorite roasters.",
    emoji: "☕",
  },
  {
    title: "Reading marathon",
    prompt: "A reading tracker that turns finishing books into a long-term game with seasons, streaks, and a personal library.",
    emoji: "📚",
  },
  {
    title: "Language exchange",
    prompt: "A pen-pal app that pairs language learners across the world for slow, written conversations on shared interests.",
    emoji: "✉️",
  },
  {
    title: "Indoor garden",
    prompt: "A houseplant care app that builds a personalized care schedule for each of my plants and warns me before they suffer.",
    emoji: "🪴",
  },
  {
    title: "Local concerts",
    prompt: "An app that quietly watches my music library and tells me when any of my favorite artists announce a show near me.",
    emoji: "🎶",
  },
];

export default router;
