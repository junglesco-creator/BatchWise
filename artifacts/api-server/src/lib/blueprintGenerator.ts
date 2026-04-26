import { openai } from "@workspace/integrations-openai-ai-server";
import type { InsertBlueprint } from "@workspace/db";

const SYSTEM_PROMPT = `You are a senior product strategist and software architect. The user gives you a short app idea. You return a complete, polished product blueprint as JSON.

Your blueprint MUST be specific to the user's idea — never generic. Pick concrete feature names, real file paths, real route paths, real data field names. The blueprint will be displayed as a beautifully rendered spec document, so quality matters.

Return ONLY a single JSON object matching this exact shape:

{
  "name": string,                  // catchy product name (1-3 words), creative, memorable
  "tagline": string,               // one short marketing line (max ~80 chars)
  "description": string,           // 2-3 sentence pitch, vivid and specific
  "category": string,              // one of: "Productivity", "Social", "Lifestyle", "Developer Tools", "Creative", "Education", "Finance", "Health & Fitness", "Entertainment", "E-commerce", "AI & ML", "Communication"
  "targetAudience": string,        // one specific sentence about who this is for
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedHours": number,        // realistic build estimate in hours, integer between 8 and 240
  "accentColor": string,           // a CSS HSL color string for the blueprint's theme accent, e.g. "hsl(280 90% 60%)". Choose a color that matches the product's mood.
  "emoji": string,                 // a single emoji character that represents the product
  "features": [                    // 5-8 core features
    { "title": string, "description": string }
  ],
  "pages": [                       // 4-7 user-facing pages/routes
    { "route": string, "name": string, "purpose": string }
  ],
  "dataModels": [                  // 3-6 data models
    {
      "name": string,
      "description": string,
      "fields": [
        { "name": string, "type": string, "description": string }
      ]
    }
  ],
  "userStories": [                 // 4-7 user stories
    { "role": string, "action": string, "benefit": string }
  ],
  "techStack": [                   // 6-10 technologies. Include category like "Frontend", "Backend", "Database", "Auth", "AI", "Hosting", "Payments", "Storage"
    { "name": string, "category": string, "reason": string }
  ],
  "fileStructure": [               // 12-20 nodes representing the project layout. Use full paths starting with "/". Mark folders with kind="folder", files with kind="file". Sort so parent folders come before children.
    { "path": string, "kind": "file" | "folder", "purpose": string }
  ],
  "milestones": [                  // 4-6 build milestones in execution order
    { "title": string, "description": string, "order": number }
  ]
}

Rules:
- Output ONLY the JSON object. No markdown fences, no commentary.
- Every field is required. Do not omit anything.
- Be specific to the user's idea. Avoid words like "manage", "handle", "system", "platform" without concrete context.
- difficulty must be exactly one of "beginner", "intermediate", "advanced".
- estimatedHours must be an integer.
- file kind must be exactly "file" or "folder".
- order in milestones must start at 1 and increment.
- accentColor must be a valid CSS color string (HSL, hex, or rgb).`;

type GeneratedBlueprint = Omit<InsertBlueprint, "prompt" | "favorite">;

export async function generateBlueprintFromPrompt(
  prompt: string,
  userMessage?: string,
): Promise<InsertBlueprint> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage ?? `App idea: ${prompt}` },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned an empty response");
  }

  let parsed: GeneratedBlueprint;
  try {
    parsed = JSON.parse(content) as GeneratedBlueprint;
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return {
    prompt,
    favorite: false,
    name: String(parsed.name ?? "Untitled App"),
    tagline: String(parsed.tagline ?? ""),
    description: String(parsed.description ?? ""),
    category: String(parsed.category ?? "Productivity"),
    targetAudience: String(parsed.targetAudience ?? ""),
    difficulty: normalizeDifficulty(parsed.difficulty),
    estimatedHours: Math.max(1, Math.round(Number(parsed.estimatedHours) || 40)),
    accentColor: String(parsed.accentColor ?? "hsl(220 80% 60%)"),
    emoji: String(parsed.emoji ?? "✨"),
    features: Array.isArray(parsed.features) ? parsed.features : [],
    pages: Array.isArray(parsed.pages) ? parsed.pages : [],
    dataModels: Array.isArray(parsed.dataModels) ? parsed.dataModels : [],
    userStories: Array.isArray(parsed.userStories) ? parsed.userStories : [],
    techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
    fileStructure: Array.isArray(parsed.fileStructure)
      ? parsed.fileStructure.map((n) => ({
          path: String(n.path ?? "/"),
          kind: n.kind === "folder" ? "folder" : "file",
          purpose: String(n.purpose ?? ""),
        }))
      : [],
    milestones: Array.isArray(parsed.milestones)
      ? parsed.milestones.map((m, i) => ({
          title: String(m.title ?? ""),
          description: String(m.description ?? ""),
          order: Number(m.order ?? i + 1),
        }))
      : [],
  };
}

function normalizeDifficulty(value: unknown): "beginner" | "intermediate" | "advanced" {
  if (value === "beginner" || value === "intermediate" || value === "advanced") {
    return value;
  }
  return "intermediate";
}
