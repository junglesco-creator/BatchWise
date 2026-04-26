import { 
  useGetBlueprintStats, 
  useGetRecentBlueprints,
  useGetPopularTech,
  useGetCategoryBreakdown
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  BarChart, Activity, Clock, Layers, Star, Hexagon, Code2, FolderTree
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetBlueprintStats();
  const { data: recent, isLoading: recentLoading } = useGetRecentBlueprints();
  const { data: tech, isLoading: techLoading } = useGetPopularTech();
  const { data: categories, isLoading: catLoading } = useGetCategoryBreakdown();

  const isLoading = statsLoading || recentLoading || techLoading || catLoading;

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-card rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-xl border border-border/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-card rounded-xl border border-border/50" />
          <div className="h-96 bg-card rounded-xl border border-border/50" />
        </div>
      </div>
    );
  }

  if (!stats || stats.totalBlueprints === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-secondary/50 p-6 rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Activity className="w-12 h-12 text-primary relative z-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Data Yet</h2>
          <p className="text-muted-foreground max-w-md mb-8 text-lg">
            Generate your first blueprint to start seeing analytics, popular technologies, and your personal app building roadmap.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_-5px_rgba(0,240,255,0.5)]"
          >
            Start Generating
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <BarChart className="text-primary w-8 h-8" />
          Command Center
        </h1>
        <p className="text-muted-foreground text-lg">Overview of your generated app blueprints.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Blueprints" value={stats.totalBlueprints} icon={Layers} />
        <StatCard title="Est. Build Time" value={`${stats.totalEstimatedHours}h`} icon={Clock} />
        <StatCard title="Unique Tech" value={stats.uniqueTechnologies} icon={Code2} />
        <StatCard title="Favorites" value={stats.totalFavorites} icon={Star} valueClassName="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight border-b border-border/50 pb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recent?.map((bp) => (
              <Link 
                key={bp.id} 
                href={`/blueprints/${bp.id}`}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:bg-secondary/20"
              >
                <div className="text-4xl bg-secondary/50 p-3 rounded-lg w-16 h-16 flex items-center justify-center shrink-0">
                  {bp.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{bp.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{bp.tagline}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3 text-xs font-mono text-muted-foreground sm:border-l sm:border-border/50 sm:pl-4">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    {bp.estimatedHours}h
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-primary" />
              Top Categories
            </h3>
            <div className="space-y-4">
              {categories?.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-muted-foreground font-mono">{cat.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(cat.count / stats.totalBlueprints) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              Popular Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {tech?.slice(0, 10).map((t, i) => (
                <div 
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-xs font-mono border border-border/50"
                >
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="text-primary">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, valueClassName }: { title: string, value: string | number, icon: any, valueClassName?: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
        <Icon className="w-32 h-32" />
      </div>
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="font-medium text-sm uppercase tracking-wider">{title}</span>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn("text-4xl font-bold font-mono tracking-tight", valueClassName)}>
          {value}
        </div>
      </div>
    </div>
  );
}
