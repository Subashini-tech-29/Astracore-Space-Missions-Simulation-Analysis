import React, { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Plus, Search, Filter } from "lucide-react";
import { useListMissions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  planning: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  active: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  completed: "text-purple-400 border-purple-400/50 bg-purple-400/10",
  failed: "text-destructive border-destructive/50 bg-destructive/10",
  aborted: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
};

export default function Missions() {
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const params: Record<string, string> = {};
  if (status && status !== "all") params.status = status;
  if (search) params.search = search;

  const { data: missions, isLoading } = useListMissions(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">MISSIONS</h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">{missions?.length ?? 0} MISSIONS IN DATABASE</p>
        </div>
        <Link href="/missions/new">
          <Button className="bg-primary text-primary-foreground neon-border font-mono uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-2" />
            New Mission
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search missions..."
            className="pl-9 bg-black/40 border-white/10 font-mono"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48 bg-black/40 border-white/10 font-mono">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 border-white/10">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="aborted">Aborted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg glass-panel animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(missions ?? []).map((m: any, i: number) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/missions/${m.id}`}>
                <Card className="glass-panel border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Rocket className="w-4 h-4 text-primary flex-shrink-0 group-hover:animate-spin" style={{ animationDuration: "2s" }} />
                        <h3 className="font-mono font-bold text-sm truncate group-hover:text-primary transition-colors">{m.name}</h3>
                      </div>
                      <Badge className={cn("text-xs font-mono uppercase border flex-shrink-0", STATUS_COLOR[m.status] ?? "")}>
                        {m.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">DESTINATION</span>
                        <span className="text-foreground">{m.destination}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">PAYLOAD</span>
                        <span className="text-foreground truncate max-w-[120px]">{m.payload}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">LAUNCH DATE</span>
                        <span className="text-foreground">{new Date(m.launchDate).toLocaleDateString()}</span>
                      </div>
                      {m.successProbability && (
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">SUCCESS PROB.</span>
                          <span className="text-emerald-400">{parseFloat(m.successProbability).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {missions?.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground font-mono">
              <Rocket className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>NO MISSIONS FOUND</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
