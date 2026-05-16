import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle } from "lucide-react";
import { useGetPrediction, useListPredictions, useListMissions } from "@workspace/api-client-react";
import { getListPredictionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RISK_COLOR: Record<string, string> = {
  low: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  medium: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  high: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  critical: "text-destructive border-destructive/50 bg-destructive/10",
};

const DESTINATIONS = ["Moon", "Mars", "Venus", "Jupiter", "Saturn", "Deep Space", "ISS (Low Earth Orbit)"];

export default function AIPredictions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: predictions, isLoading } = useListPredictions({ query: { queryKey: getListPredictionsQueryKey() } });
  const { data: missions } = useListMissions();
  const getPrediction = useGetPrediction();

  const { handleSubmit, setValue, watch } = useForm({ defaultValues: { missionId: "", destination: "" } });
  const missionId = watch("missionId");
  const destination = watch("destination");

  const onSubmit = async () => {
    if (!missionId && !destination) {
      toast({ variant: "destructive", title: "Select a mission or destination" });
      return;
    }
    try {
      await getPrediction.mutateAsync({ data: { missionId: missionId || undefined, destination: destination || undefined } });
      queryClient.invalidateQueries({ queryKey: getListPredictionsQueryKey() });
      toast({ title: "Analysis Complete", description: "AI prediction generated successfully." });
    } catch {
      toast({ variant: "destructive", title: "Prediction failed" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">AI PREDICTIONS</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">MISSION OUTCOME ANALYSIS ENGINE</p>
      </div>

      <Card className="glass-panel border-primary/20 neon-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-primary" />
            Run Prediction Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Link to Mission (Optional)</Label>
                <Select onValueChange={(v) => setValue("missionId", v)}>
                  <SelectTrigger className="bg-black/40 border-white/10 font-mono">
                    <SelectValue placeholder="Select mission..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 border-white/10">
                    {(missions ?? []).map((m: any) => (
                      <SelectItem key={m.id} value={String(m.id)} className="font-mono">{m.name} ({m.destination})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Or Select Destination</Label>
                <Select onValueChange={(v) => setValue("destination", v)}>
                  <SelectTrigger className="bg-black/40 border-white/10 font-mono">
                    <SelectValue placeholder="Choose target..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 border-white/10">
                    {DESTINATIONS.map((d) => (
                      <SelectItem key={d} value={d} className="font-mono">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="bg-primary neon-border font-mono uppercase tracking-wider" disabled={getPrediction.isPending || (!missionId && !destination)}>
              {getPrediction.isPending ? (
                <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 animate-pulse" /> COMPUTING...</span>
              ) : (
                <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> RUN ANALYSIS</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">PREDICTION LOG</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-lg glass-panel animate-pulse" />)}</div>
        ) : (predictions ?? []).length === 0 ? (
          <div className="text-center py-16">
            <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-mono text-muted-foreground">NO PREDICTIONS YET — RUN YOUR FIRST ANALYSIS</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(predictions ?? []).map((p: any, i: number) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="glass-panel border-white/5 hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-mono font-bold text-sm">{p.missionName ?? "STANDALONE ANALYSIS"}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{new Date(p.createdAt).toLocaleString()} — ID: {String(p.id).padStart(4, "0")}</p>
                      </div>
                      <Badge className={cn("text-xs font-mono uppercase border flex-shrink-0", RISK_COLOR[p.riskLevel] ?? "")}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {p.riskLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">SUCCESS PROBABILITY</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/5 rounded-full h-2">
                            <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${parseFloat(p.successProbability)}%` }} />
                          </div>
                          <span className="text-sm font-mono text-emerald-400 w-12 text-right">{parseFloat(p.successProbability).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">CONFIDENCE</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/5 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${parseFloat(p.confidence)}%` }} />
                          </div>
                          <span className="text-sm font-mono text-primary w-12 text-right">{parseFloat(p.confidence).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground p-3 rounded bg-white/5 border border-white/5">{p.recommendation}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.riskFactors?.map((rf: string, j: number) => (
                        <Badge key={j} className="text-xs font-mono border border-white/10 bg-white/5 text-muted-foreground">
                          {rf}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
