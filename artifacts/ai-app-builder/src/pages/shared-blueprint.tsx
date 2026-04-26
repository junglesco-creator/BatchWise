import { Link, useParams } from "wouter";
import { useGetSharedBlueprint, getGetSharedBlueprintQueryKey } from "@workspace/api-client-react";
import {
  Star, Clock, Users, Zap, Layers,
  Code2, Database, Layout, GitPullRequest, Sparkles, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SharedBlueprint() {
  const { token } = useParams<{ token: string }>();
  const { data: blueprint, isLoading, error } = useGetSharedBlueprint(token || "", {
    query: { enabled: !!token, queryKey: getGetSharedBlueprintQueryKey(token || "") }
  });

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-8">
        <div className="h-48 bg-card rounded-2xl" />
        <div className="h-12 w-48 bg-card rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-card rounded-xl" />
          <div className="h-64 bg-card rounded-xl" />
        </div>
      </div>
    );
  }

  if (!blueprint || error) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-mono uppercase tracking-wider mb-6">
          <Sparkles className="w-3 h-3" />
          Architect.AI
        </div>
        <h1 className="text-3xl font-bold mb-4">This share link is no longer active.</h1>
        <p className="text-muted-foreground mb-8">
          The blueprint owner may have revoked the link, or it may have never existed.
        </p>
        <Link href="/">
          <Button size="lg">Generate your own blueprint</Button>
        </Link>
      </div>
    );
  }

  const accent = blueprint.accentColor;
  const style = {
    "--bp-accent": accent,
    "--bp-accent-light": accent.replace("hsl(", "hsla(").replace(")", " / 0.2)"),
  } as React.CSSProperties;

  return (
    <div className="min-h-screen" style={style}>
      <div
        className="border-b border-border/50"
        style={{
          background: `radial-gradient(circle at 30% 0%, var(--bp-accent-light), transparent 60%)`,
        }}
      >
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              Architect.AI
            </Link>
            <span className="text-xs font-mono uppercase tracking-wider px-2 py-1 rounded bg-secondary text-muted-foreground">
              Shared blueprint · read only
            </span>
          </div>

          <div className="flex items-start gap-6">
            <div className="text-7xl leading-none shrink-0 select-none">{blueprint.emoji}</div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight" style={{ color: accent }}>
                {blueprint.name}
              </h1>
              <p className="text-xl text-muted-foreground mt-3">{blueprint.tagline}</p>
              <p className="text-base leading-relaxed text-foreground/80 mt-5 max-w-3xl">
                {blueprint.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t border-border/50">
            <Badge icon={Clock} label="Estimated Time" value={`${blueprint.estimatedHours}h`} />
            <Badge icon={Zap} label="Difficulty" value={blueprint.difficulty} className="capitalize" />
            <Badge icon={Users} label="Audience" value={blueprint.targetAudience} />
            <Badge icon={Layers} label="Category" value={blueprint.category} />
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="Core Features" icon={Star}>
            <div className="space-y-4">
              {blueprint.features.map((feature, i) => (
                <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <h4 className="font-bold mb-1" style={{ color: accent }}>{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="App Structure" icon={Layout}>
            <div className="space-y-3">
              {blueprint.pages.map((page, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg border border-border/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {page.route}
                    </span>
                    <span className="font-semibold text-sm">{page.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">{page.purpose}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Technology Stack" icon={Code2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blueprint.techStack.map((tech, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{tech.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">
                    {tech.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tech.reason}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Data Schema" icon={Database}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {blueprint.dataModels.map((model, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="bg-secondary/50 p-4 border-b border-border/50">
                  <h4 className="font-bold font-mono text-lg flex items-center gap-2">
                    <Database className="w-4 h-4" style={{ color: accent }} />
                    {model.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border/30">
                    {model.fields.map((field, j) => (
                      <tr key={j}>
                        <td className="px-4 py-3 font-mono font-medium w-1/3" style={{ color: accent }}>{field.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground w-1/4">{field.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Development Roadmap" icon={GitPullRequest}>
          <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-border">
            {[...blueprint.milestones].sort((a, b) => a.order - b.order).map((milestone, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute -left-10 mt-1.5 w-5 h-5 rounded-full bg-background border-2 flex items-center justify-center"
                  style={{ borderColor: accent, boxShadow: `0 0 10px var(--bp-accent-light)` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                      Phase {milestone.order}
                    </span>
                    <h4 className="font-bold text-lg">{milestone.title}</h4>
                  </div>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-secondary/40 to-transparent p-10 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">Got an app idea of your own?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Architect.AI turns a single sentence into a full project blueprint in seconds.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              Try Architect.AI
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 border-b border-border/50 pb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Badge({ icon: Icon, label, value, className = "" }: { icon: any; label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30 min-w-[200px]">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">{label}</div>
        <div className={`text-sm font-semibold ${className}`}>{value}</div>
      </div>
    </div>
  );
}
