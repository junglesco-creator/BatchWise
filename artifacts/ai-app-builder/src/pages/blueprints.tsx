import { useListBlueprints } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { LayoutDashboard, Clock, Layers, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Blueprints() {
  const { data: blueprints, isLoading } = useListBlueprints();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Blueprint Library</h1>
          <p className="text-muted-foreground text-lg">Your generated application specifications.</p>
        </div>
        
        {blueprints && blueprints.length > 0 && (
          <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>{blueprints.length} total</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{blueprints.filter(b => b.favorite).length} favorites</span>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-xl border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : !blueprints || blueprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card/30">
          <div className="bg-secondary/50 p-4 rounded-full mb-4">
            <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No blueprints yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">You haven't generated any app blueprints yet. Head over to the generator to get started.</p>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Generate Blueprint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint, index) => (
            <Link 
              key={blueprint.id} 
              href={`/blueprints/${blueprint.id}`}
              className={cn(
                "group relative flex flex-col h-full bg-card rounded-xl border border-border/50 hover:border-primary/50 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(var(--primary-rgb),0.2)] animate-in fade-in slide-in-from-bottom-4",
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-1 opacity-80 group-hover:opacity-100 transition-opacity" 
                style={{ backgroundColor: blueprint.accentColor }} 
              />
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl bg-secondary/30 p-2 rounded-lg">{blueprint.emoji}</div>
                  {blueprint.favorite && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{blueprint.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">{blueprint.tagline}</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-muted-foreground mt-auto pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{blueprint.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="truncate">{blueprint.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
