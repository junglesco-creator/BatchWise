import { useLocation, useParams } from "wouter";
import { 
  useGetBlueprint, 
  useDeleteBlueprint, 
  useToggleBlueprintFavorite,
  useCreateBlueprintShare,
  useRevokeBlueprintShare,
  useRemixBlueprint,
  getGetBlueprintQueryKey,
  getListBlueprintsQueryKey,
  getGetBlueprintStatsQueryKey,
  getGetRecentBlueprintsQueryKey,
  getGetPopularTechQueryKey,
  getGetCategoryBreakdownQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, Trash2, Clock, Users, Zap, Layers, 
  Code2, Database, Layout, GitPullRequest, ArrowLeft,
  ChevronRight, Folder, FileCode, CheckCircle2, Download, Share2, Copy, Check, Shuffle, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BlueprintDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const blueprintId = parseInt(id || "0", 10);

  const { data: blueprint, isLoading } = useGetBlueprint(blueprintId, {
    query: { enabled: !!blueprintId, queryKey: getGetBlueprintQueryKey(blueprintId) }
  });

  const deleteMutation = useDeleteBlueprint({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBlueprintsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBlueprintStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentBlueprintsQueryKey() });
        toast({ title: "Blueprint deleted" });
        setLocation("/blueprints");
      }
    }
  });

  const favoriteMutation = useToggleBlueprintFavorite({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetBlueprintQueryKey(blueprintId), data);
        queryClient.invalidateQueries({ queryKey: getListBlueprintsQueryKey() });
      }
    }
  });

  const [shareOpen, setShareOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remixOpen, setRemixOpen] = useState(false);
  const [remixInstruction, setRemixInstruction] = useState("");

  const remixMutation = useRemixBlueprint({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListBlueprintsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBlueprintStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentBlueprintsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPopularTechQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCategoryBreakdownQueryKey() });
        setRemixOpen(false);
        setRemixInstruction("");
        toast({ title: "Remix ready", description: `Meet ${data.name}.` });
        setLocation(`/blueprints/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Remix failed",
          description: error.data?.error || error.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    }
  });

  const submitRemix = () => {
    remixMutation.mutate({
      id: blueprintId,
      data: { instruction: remixInstruction.trim() || undefined },
    });
  };

  const createShareMutation = useCreateBlueprintShare({
    mutation: {
      onSuccess: (data) => {
        setShareToken(data.shareToken);
      },
      onError: () => {
        toast({ title: "Failed to create share link", variant: "destructive" });
      }
    }
  });

  const revokeShareMutation = useRevokeBlueprintShare({
    mutation: {
      onSuccess: () => {
        setShareToken(null);
        setShareOpen(false);
        toast({ title: "Share link revoked" });
      }
    }
  });

  const openShareDialog = () => {
    setShareOpen(true);
    setCopied(false);
    if (!shareToken) {
      createShareMutation.mutate({ id: blueprintId });
    }
  };

  const shareUrl = shareToken
    ? `${window.location.origin}${import.meta.env.BASE_URL}share/${shareToken}`
    : "";

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", description: "Select the link and copy manually.", variant: "destructive" });
    }
  };

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

  if (!blueprint) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Blueprint not found</h2>
        <Button onClick={() => setLocation("/blueprints")} variant="outline">
          Back to Library
        </Button>
      </div>
    );
  }

  const customStyle = {
    '--bp-accent': blueprint.accentColor,
    '--bp-accent-light': `${blueprint.accentColor}33`, // roughly 20% opacity
  } as React.CSSProperties;

  return (
    <div className="min-h-screen pb-24" style={customStyle}>
      {/* Hero Header */}
      <div className="relative bg-card border-b border-border/50 pt-16 pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, var(--bp-accent), transparent 70%)`
          }}
        />
        
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/blueprints")}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Library
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-4">
                <span className="text-6xl drop-shadow-md">{blueprint.emoji}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{blueprint.name}</h1>
                  </div>
                  <p className="text-xl text-muted-foreground font-medium">{blueprint.tagline}</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-foreground/80 mt-4">{blueprint.description}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                onClick={() => setRemixOpen(true)}
                title="Remix this blueprint"
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                onClick={openShareDialog}
                title="Share publicly"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                onClick={() => {
                  const url = `${import.meta.env.BASE_URL}api/blueprints/${blueprint.id}/export.md`;
                  window.location.href = url;
                  toast({ title: "Exporting blueprint", description: "Your Markdown file is downloading." });
                }}
                title="Export as Markdown"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant={blueprint.favorite ? "default" : "outline"}
                size="icon"
                className={cn("h-12 w-12 rounded-xl transition-all", blueprint.favorite && "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50")}
                onClick={() => favoriteMutation.mutate({ id: blueprint.id })}
                disabled={favoriteMutation.isPending}
              >
                <Star className={cn("w-5 h-5", blueprint.favorite && "fill-yellow-500")} />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Blueprint?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the {blueprint.name} blueprint. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => deleteMutation.mutate({ id: blueprint.id })}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Dialog open={remixOpen} onOpenChange={(open) => { if (!remixMutation.isPending) setRemixOpen(open); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shuffle className="w-5 h-5" style={{ color: blueprint.accentColor }} />
                  Remix {blueprint.name}
                </DialogTitle>
                <DialogDescription>
                  Generate a new variation of this idea. Add an optional twist — different audience, tech stack, scope, vibe — or leave blank for a fresh take.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                <Textarea
                  value={remixInstruction}
                  onChange={(e) => setRemixInstruction(e.target.value)}
                  placeholder="e.g. Make it for kids ages 7-12 with gamification, or use Python instead of TypeScript, or strip it down to a single-page MVP..."
                  rows={4}
                  maxLength={500}
                  disabled={remixMutation.isPending}
                  className="resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  {["For kids", "Mobile-first", "Offline-only", "Solo founder MVP", "Use Python + Django"].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setRemixInstruction(suggestion)}
                      disabled={remixMutation.isPending}
                      className="text-xs font-mono px-3 py-1 rounded-full border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setRemixOpen(false)} disabled={remixMutation.isPending}>
                  Cancel
                </Button>
                <Button onClick={submitRemix} disabled={remixMutation.isPending} className="gap-2">
                  {remixMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Remixing…
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-4 h-4" />
                      Remix
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share this blueprint</DialogTitle>
                <DialogDescription>
                  Anyone with this link can view a read-only version of <span className="font-medium text-foreground">{blueprint.name}</span>. Revoke the link any time to stop access.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  readOnly
                  value={createShareMutation.isPending && !shareToken ? "Generating link…" : shareUrl}
                  className="font-mono text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyShareUrl}
                  disabled={!shareToken}
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <DialogFooter className="sm:justify-between gap-2">
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => revokeShareMutation.mutate({ id: blueprint.id })}
                  disabled={!shareToken || revokeShareMutation.isPending}
                >
                  Revoke link
                </Button>
                <Button onClick={() => setShareOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-border/50">
            <Badge icon={Clock} label="Estimated Time" value={`${blueprint.estimatedHours}h`} />
            <Badge icon={Zap} label="Difficulty" value={blueprint.difficulty} className="capitalize" />
            <Badge icon={Users} label="Audience" value={blueprint.targetAudience} />
            <Badge icon={Layers} label="Category" value={blueprint.category} />
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
        
        {/* Core Features & Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="Core Features" icon={Star}>
            <div className="space-y-4">
              {blueprint.features.map((feature, i) => (
                <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <h4 className="font-bold mb-1 text-[var(--bp-accent)]">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="App Structure" icon={Layout}>
            <div className="space-y-3">
              {blueprint.pages.map((page, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg border border-border/30 hover:bg-secondary/20 transition-colors">
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

        {/* Tech Stack */}
        <Section title="Technology Stack" icon={Code2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blueprint.techStack.map((tech, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-card hover:border-[var(--bp-accent)] transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{tech.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">
                    {tech.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{tech.reason}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Data Models */}
        <Section title="Data Schema" icon={Database}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {blueprint.dataModels.map((model, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="bg-secondary/50 p-4 border-b border-border/50">
                  <h4 className="font-bold font-mono text-lg flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--bp-accent)]" />
                    {model.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border/30">
                      {model.fields.map((field, j) => (
                        <tr key={j} className="hover:bg-secondary/10">
                          <td className="px-4 py-3 font-mono font-medium text-[var(--bp-accent)] w-1/3">{field.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground w-1/4">{field.type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Development Roadmap */}
        <Section title="Development Roadmap" icon={GitPullRequest}>
          <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-border">
            {blueprint.milestones.map((milestone, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-10 mt-1.5 w-5 h-5 rounded-full bg-background border-2 border-[var(--bp-accent)] flex items-center justify-center shadow-[0_0_10px_var(--bp-accent-light)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--bp-accent)]" />
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-5 hover:border-[var(--bp-accent)] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-[var(--bp-accent)] uppercase tracking-wider">Phase {milestone.order}</span>
                    <h4 className="font-bold text-lg">{milestone.title}</h4>
                  </div>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 border-b border-border/50 pb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Badge({ icon: Icon, label, value, className }: { icon: any, label: string, value: React.ReactNode, className?: string }) {
  return (
    <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-lg border border-border/50">
      <div className="p-1.5 bg-background rounded-md">
        <Icon className="w-4 h-4 text-[var(--bp-accent)]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
        <span className={cn("font-medium text-sm", className)}>{value}</span>
      </div>
    </div>
  );
}
