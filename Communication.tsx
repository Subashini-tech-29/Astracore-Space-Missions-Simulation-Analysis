import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Wifi, Clock, Send, Zap } from "lucide-react";
import { useSimulateCommunication } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DESTINATIONS = ["ISS (Low Earth Orbit)", "Moon", "Mars", "Venus", "Jupiter", "Saturn", "Deep Space"];

const STATUS_COLOR: Record<string, string> = {
  excellent: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  good: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  degraded: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  critical: "text-destructive border-destructive/50 bg-destructive/10",
};

function formatDelay(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

function formatDistance(km: number): string {
  if (km < 1000) return `${km.toLocaleString()} km`;
  if (km < 1e6) return `${(km / 1000).toFixed(1)}K km`;
  if (km < 1e9) return `${(km / 1e6).toFixed(1)}M km`;
  return `${(km / 1e9).toFixed(2)}B km`;
}

function SignalWave({ active, status }: { active: boolean; status?: string }) {
  const color =
    status === "excellent" ? "#34d399" :
    status === "good" ? "#60a5fa" :
    status === "degraded" ? "#fbbf24" :
    status === "critical" ? "#f87171" :
    "#60a5fa";

  return (
    <div className="flex items-center justify-center h-20 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={active ? {
            height: [(i + 1) * 8, (i + 1) * 16, (i + 1) * 8],
            opacity: [0.4, 1, 0.4],
          } : { height: 4, opacity: 0.2 }}
          transition={{ duration: 0.8, repeat: active ? Infinity : 0, delay: i * 0.1, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function Communication() {
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const simulate = useSimulateCommunication();

  const handleSimulate = async () => {
    if (!destination) {
      toast({ variant: "destructive", title: "Select a destination" });
      return;
    }
    try {
      const res = await simulate.mutateAsync({ data: { destination, message: message || undefined } });
      setResult(res);
    } catch {
      toast({ variant: "destructive", title: "Simulation failed" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">COMMUNICATION</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">DEEP SPACE SIGNAL DELAY SIMULATOR</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              Transmission Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Target Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger className="bg-black/40 border-white/10 font-mono">
                  <SelectValue placeholder="Select target body..." />
                </SelectTrigger>
                <SelectContent className="bg-background/95 border-white/10">
                  {DESTINATIONS.map((d) => (
                    <SelectItem key={d} value={d} className="font-mono">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Message (Optional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-black/40 border-white/10 font-mono resize-none text-sm"
                rows={3}
                placeholder="Enter transmission message..."
              />
            </div>
            <Button onClick={handleSimulate} disabled={simulate.isPending || !destination} className="w-full bg-primary neon-border font-mono uppercase tracking-wider">
              <Send className="w-4 h-4 mr-2" />
              {simulate.isPending ? "TRANSMITTING..." : "SIMULATE TRANSMISSION"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Wifi className="w-4 h-4 text-primary" />
              Signal Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignalWave active={!!result} status={result?.status} />
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground uppercase">Signal Status</span>
                    <Badge className={cn("text-xs font-mono uppercase border", STATUS_COLOR[result.status] ?? "")}>
                      {result.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Zap, label: "DISTANCE", value: formatDistance(result.distanceKm) },
                      { icon: Wifi, label: "SIGNAL STRENGTH", value: `${result.signalStrength.toFixed(1)}%` },
                      { icon: Clock, label: "ONE-WAY DELAY", value: formatDelay(result.oneWayDelaySeconds) },
                      { icon: Clock, label: "ROUND-TRIP DELAY", value: formatDelay(result.roundTripDelaySeconds) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="p-3 rounded bg-white/5 border border-white/5">
                        <p className="text-xs text-muted-foreground font-mono uppercase mb-1">{label}</p>
                        <p className="text-sm font-bold font-mono text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                  {result.message && (
                    <div className="p-3 rounded bg-white/5 border border-white/5">
                      <p className="text-xs text-muted-foreground font-mono uppercase mb-1">TRANSMISSION LOG</p>
                      <p className="text-xs font-mono">{result.message}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {!result && (
              <p className="text-center text-xs text-muted-foreground/50 font-mono mt-4">AWAITING TRANSMISSION DATA</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
