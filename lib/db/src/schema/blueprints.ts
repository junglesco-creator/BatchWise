import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type Feature = { title: string; description: string };
export type Page = { route: string; name: string; purpose: string };
export type DataField = { name: string; type: string; description: string };
export type DataModel = { name: string; description: string; fields: DataField[] };
export type UserStory = { role: string; action: string; benefit: string };
export type TechItem = { name: string; category: string; reason: string };
export type FileNode = { path: string; kind: "file" | "folder"; purpose: string };
export type Milestone = { title: string; description: string; order: number };

export const blueprintsTable = pgTable("blueprints", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  targetAudience: text("target_audience").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  accentColor: text("accent_color").notNull(),
  emoji: text("emoji").notNull(),
  favorite: boolean("favorite").notNull().default(false),
  features: jsonb("features").$type<Feature[]>().notNull(),
  pages: jsonb("pages").$type<Page[]>().notNull(),
  dataModels: jsonb("data_models").$type<DataModel[]>().notNull(),
  userStories: jsonb("user_stories").$type<UserStory[]>().notNull(),
  techStack: jsonb("tech_stack").$type<TechItem[]>().notNull(),
  fileStructure: jsonb("file_structure").$type<FileNode[]>().notNull(),
  milestones: jsonb("milestones").$type<Milestone[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlueprintSchema = createInsertSchema(blueprintsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type Blueprint = typeof blueprintsTable.$inferSelect;
