import React from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { Rocket, ArrowLeft, Trash2, BrainCircuit, Calendar, Package, Target } from "lucide-react";
import { useGetMission, useDeleteMission, useGetPrediction, useListPredictions } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  planning: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  active: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  completed: "text-purple-400 border-purple-400/50 bg-purple-400/10",
  failed: "text-destructive border-destructive/50 bg-destructive/10",
  aborted: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
};

const RISK_COLOR: Record<string, string> = {
  low: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  medium: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  high: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  critical: "text-destructive border-destructive/50 bg-destructive/10",
};

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const missionId = parseInt(id ?? "0");

  const { data: mission, isLoading } = useGetMission(missionId, { query: { queryKey: ["mission", missionId], enabled: !!missionId } });
  const { data: predictions } = useListPredictions({ query: { queryKey: ["predictions"] } });
  const deleteMission = useDeleteMission();
  const getPrediction = useGetPrediction();

  const missionPredictions = predictions?.filter((p: any) => p.missionId === missionId) ?? [];

  const handleDelete = async () => {
    if (!confirm("Abort and delete this mission? This cannot be undone.")) return;
    await deleteMission.mutateAsync({ id: missionId });
    toast({ title: "Mission Deleted", description: "Mission data purged from database." });
    setLocation("/missions");
  };

  const handlePredict = async () => {
    try {
      await getPrediction.mutateAsync({ data: { missionId: String(missionId), destination: mission?.destination ?? "" } });
      toast({ title: "Prediction Complete", description: "AI analysis has been completed." });
    } catch {
      toast({ variant: "destructive", title: "Prediction Failed" });
    }
  };

  if (isLoading) return <div className="h-96 glass-panel rounded-lg animate-pulse" />;
  if (!mission) return <div className="text-center py-16 font-mono text-muted-foreground">MISSION NOT FOUND</div>;

  const latestPrediction = missionPredictions[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/missions")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold font-mono neon-text truncate">{mission.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">MISSION ID: {String(mission.id).padStart(6, "0")}</p>
        </div>
        <Badge className={cn("text-xs font-mono uppercase border", STATUS_COLOR[mission.status] ?? "")}>
          {mission.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/5">
          <CardHeader><CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Mission Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Target, label: "DESTINATION", value: mission.destination },
              { icon: Package, label: "PAYLOAD", value: mission.payload },
              { icon: Calendar, label: "LAUNCH DATE", value: new Date(mission.launchDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              { icon: Rocket, label: "MISSION ID", value: `ASTRCRX-${String(mission.id).padStart(4, "0")}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded bg-white/5">
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">{label}</p>
                  <p className="text-sm font-medium font-mono mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              AI Assessment
              <Button size="sm" variant="outline" onClick={handlePredict} disabled={getPrediction.isPending} className="text-xs font-mono border-primary/30 hover:border-primary">
                <BrainCircuit className="w-3 h-3 mr-1" />
                {getPrediction.isPending ? "COMPUTING..." : "RUN ANALYSIS"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestPrediction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">RISK LEVEL</span>
                  <Badge className={cn("text-xs font-mono uppercase border", RISK_COLOR[latestPrediction.riskLevel] ?? "")}>
                    {latestPrediction.riskLevel}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-muted-foreground">SUCCESS PROBABILITY</span>
                    <span className="text-emerald-400">{parseFloat(latestPrediction.successProbability).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-emerald-400 h-2 rounded-full transition-all"
                      style={{ width: `${parseFloat(latestPrediction.successProbability)}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 rounded bg-white/5">
                  <p className="text-xs text-muted-foreground font-mono uppercase mb-1">Recommendation</p>
                  <p className="text-xs font-mono">{latestPrediction.recommendation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase mb-2">Risk Factors</p>
                  <div className="space-y-1">
                    {latestPrediction.riskFactors?.map((rf: string, i: number) => (
                      <p key={i} className="text-xs font-mono text-muted-foreground">• {rf}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BrainCircuit className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-xs text-muted-foreground font-mono">NO ANALYSIS AVAILABLE</p>
                <p className="text-xs text-muted-foreground/50 font-mono mt-1">Run AI analysis to generate prediction</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {mission.description && (
        <Card className="glass-panel border-white/5">
          <CardHeader><CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Mission Brief</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed font-mono">{mission.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="destructive" onClick={handleDelete} disabled={deleteMission.isPending} className="font-mono">
          <Trash2 className="w-4 h-4 mr-2" />
          DELETE MISSION
        </Button>
      </div>
    </div>
  );
}
