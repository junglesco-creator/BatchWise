import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Wand2, ArrowRight } from "lucide-react";
import { 
  useGenerateBlueprint, 
  useGetInspirationPrompts,
  getListBlueprintsQueryKey,
  getGetBlueprintStatsQueryKey,
  getGetRecentBlueprintsQueryKey,
  getGetPopularTechQueryKey,
  getGetCategoryBreakdownQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspirations, isLoading: isLoadingInspirations } = useGetInspirationPrompts();
  
  const generateMutation = useGenerateBlueprint({
    mutation: {
      onSuccess: (data) => {
        // Invalidate all the stats and lists
        queryClient.invalidateQueries({ queryKey: getListBlueprintsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBlueprintStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentBlueprintsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPopularTechQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCategoryBreakdownQueryKey() });
        
        toast({
          title: "Blueprint generated!",
          description: "Your idea has been successfully materialized.",
        });
        setLocation(`/blueprints/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Failed to generate blueprint",
          description: error.data?.error || error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.length < 3) return;
    
    generateMutation.mutate({ data: { prompt } });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 md:py-24 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-3xl mx-auto w-full">
        
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Architect Engine v1.0
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Turn your shower thought into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">master plan.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Describe your app idea in a sentence. We'll generate a complete blueprint: data models, user stories, tech stack, and a roadmap.
          </p>
        </div>

        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
          {generateMutation.isPending ? (
            <div className="w-full rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-8 shadow-[0_0_40px_-10px_rgba(0,240,255,0.2)]">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-semibold text-primary font-mono tracking-tight">Drafting Blueprint...</h3>
                  <p className="text-muted-foreground">Architecting data models, structuring pages, defining user stories.</p>
                </div>
                <div className="w-full max-w-md h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-shimmer w-full origin-left" />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-300">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A habit tracker for remote workers that uses gamification..."
                  className="min-h-[120px] text-lg resize-none border-0 focus-visible:ring-0 bg-transparent p-6 pb-20 font-sans"
                  disabled={generateMutation.isPending}
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card to-transparent flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">
                    {prompt.length > 0 ? `${prompt.length} chars` : "Press Enter ↵ to generate"}
                  </span>
                  
                  <Button 
                    type="submit" 
                    disabled={!prompt.trim() || prompt.length < 3 || generateMutation.isPending}
                    size="lg"
                    className="rounded-xl px-8 shadow-[0_0_20px_-5px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_-5px_rgba(0,240,255,0.6)] transition-all font-bold tracking-wide"
                  >
                    Generate <Wand2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </form>
          )}

          {!generateMutation.isPending && (
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider text-center">Or try an inspiration</p>
              <div className="flex flex-wrap justify-center gap-2">
                {isLoadingInspirations ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-10 w-32 bg-secondary rounded-full animate-pulse" />
                  ))
                ) : (
                  inspirations?.map((insp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(insp.prompt)}
                      className="inline-flex items-center px-4 py-2 rounded-full border border-border/50 bg-card/50 hover:bg-primary/10 hover:border-primary/30 transition-all text-sm group"
                    >
                      <span className="mr-2 text-base">{insp.emoji}</span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{insp.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
