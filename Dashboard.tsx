import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, AlertTriangle, CheckCircle, Users, Activity, TrendingUp,
  Zap, Wifi, Gauge, Thermometer, BatteryMedium, Radio, Wind, Atom,
} from "lucide-react";
import { useGetAnalyticsSummary, useListAlerts, useListMissions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTelemetry } from "@/hooks/useTelemetry";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-destructive border-destructive/50 bg-destructive/10",
  warning: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  safe: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
};

const STATUS_COLOR: Record<string, string> = {
  planning: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  active: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  completed: "text-purple-400 border-purple-400/50 bg-purple-400/10",
  failed: "text-destructive border-destructive/50 bg-destructive/10",
  aborted: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
};

function StatCard({
  title, value, icon: Icon, color, sub,
}: {
  title: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="glass-panel border-white/5 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">{title}</p>
              <p className={cn("text-3xl font-bold font-mono", color)}>{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center bg-white/5")}>
              <Icon className={cn("w-6 h-6", color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LiveValueProps {
  label: string;
  value: number | null;
  prevValue: number | null;
  unit: string;
  icon: any;
  color: string;
  format?: (n: number) => string;
  warn?: (n: number) => boolean;
  critical?: (n: number) => boolean;
}

function LiveValue({ label, value, prevValue, unit, icon: Icon, color, format, warn, critical }: LiveValueProps) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(prevValue);

  useEffect(() => {
    const changed = value !== null && prevRef.current !== null && value !== prevRef.current;
    prevRef.current = value;
    if (!changed) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [value]);

  const display = value === null ? "---" : (format ? format(value) : value.toFixed(1));
  const isWarn = value !== null && warn?.(value);
  const isCrit = value !== null && critical?.(value);
  const valueColor = isCrit ? "text-destructive" : isWarn ? "text-yellow-400" : color;

  return (
    <div className={cn(
      "flex flex-col gap-1 p-3 rounded-lg border transition-all duration-300",
      flash ? "border-primary/60 bg-primary/5" : "border-white/5 bg-white/3",
      isCrit ? "border-destructive/40" : isWarn ? "border-yellow-400/30" : "",
    )}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn("w-3 h-3", valueColor)} />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={display}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className={cn("text-lg font-bold font-mono tabular-nums", valueColor)}
        >
          {display}
          <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function LiveStatusDot({ status }: { status: "connecting" | "live" | "error" | "closed" }) {
  const color = status === "live" ? "bg-emerald-400" : status === "connecting" ? "bg-yellow-400" : "bg-destructive";
  const label = status === "live" ? "LIVE" : status === "connecting" ? "CONNECTING" : "OFFLINE";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("relative flex h-2 w-2")}>
        {status === "live" && (
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)} />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
      </span>
      <span className={cn(
        "text-[10px] font-mono uppercase tracking-widest",
        status === "live" ? "text-emerald-400" : status === "connecting" ? "text-yellow-400" : "text-destructive",
      )}>
        {label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary } = useGetAnalyticsSummary();
  const { data: alerts } = useListAlerts({ acknowledged: false });
  const { data: missions } = useListMissions({ status: "active" });
  const { data: tele, prev, status: teleStatus } = useTelemetry();

  const recentAlerts = alerts?.slice(0, 5) ?? [];
  const activeMissions = missions?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">MISSION CONTROL</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">ASTRACORE — SPACE OPERATIONS DASHBOARD</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Missions" value={summary?.totalMissions ?? 0} icon={Rocket} color="text-primary" />
        <StatCard title="Active Missions" value={summary?.activeMissions ?? 0} icon={Activity} color="text-emerald-400" />
        <StatCard title="Success Rate" value={`${summary?.successRate ?? 0}%`} icon={TrendingUp} color="text-purple-400" />
        <StatCard title="Critical Alerts" value={summary?.criticalAlerts ?? 0} icon={AlertTriangle} color="text-destructive" sub={`${summary?.totalAlerts ?? 0} total`} />
        <StatCard title="System Health" value={`${summary?.systemHealthScore ?? 0}%`} icon={Zap} color="text-yellow-400" />
        <StatCard title="Signal Status" value="NOMINAL" icon={Wifi} color="text-emerald-400" />
        <StatCard title="Operators Online" value={summary?.totalUsers ?? 0} icon={Users} color="text-blue-400" />
        <StatCard title="Unacknowledged" value={recentAlerts.length} icon={AlertTriangle} color="text-orange-400" sub="alerts pending" />
      </div>

      {/* Live Telemetry Strip */}
      <Card className="glass-panel border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Live Spacecraft Telemetry
            </div>
            <LiveStatusDot status={teleStatus} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <LiveValue
              label="Fuel" value={tele?.fuelLevel ?? null} prevValue={prev?.fuelLevel ?? null}
              unit="%" icon={Gauge} color="text-primary"
              warn={(v) => v < 30} critical={(v) => v < 15}
            />
            <LiveValue
              label="Temperature" value={tele?.temperature ?? null} prevValue={prev?.temperature ?? null}
              unit="°C" icon={Thermometer} color="text-orange-400"
              warn={(v) => v > 30} critical={(v) => v > 34}
            />
            <LiveValue
              label="Battery" value={tele?.battery ?? null} prevValue={prev?.battery ?? null}
              unit="%" icon={BatteryMedium} color="text-emerald-400"
              warn={(v) => v < 80} critical={(v) => v < 70}
            />
            <LiveValue
              label="Signal" value={tele?.signalStrength ?? null} prevValue={prev?.signalStrength ?? null}
              unit="%" icon={Radio} color="text-blue-400"
              warn={(v) => v < 50} critical={(v) => v < 35}
            />
            <LiveValue
              label="O₂ Level" value={tele?.oxygenLevel ?? null} prevValue={prev?.oxygenLevel ?? null}
              unit="%" icon={Wind} color="text-cyan-400"
              warn={(v) => v < 97} critical={(v) => v < 96}
            />
            <LiveValue
              label="Altitude" value={tele?.altitude ?? null} prevValue={prev?.altitude ?? null}
              unit="km" icon={Rocket} color="text-purple-400"
              format={(v) => v.toFixed(0)}
            />
            <LiveValue
              label="Velocity" value={tele?.velocity ?? null} prevValue={prev?.velocity ?? null}
              unit="km/h" icon={Activity} color="text-yellow-400"
              format={(v) => v.toFixed(0)}
            />
            <LiveValue
              label="Distance" value={tele?.distanceFromEarth ?? null} prevValue={prev?.distanceFromEarth ?? null}
              unit="km" icon={Wifi} color="text-sky-400"
              format={(v) => (v / 1000).toFixed(0) + "k"}
            />
            <LiveValue
              label="Radiation" value={tele?.radiationLevel ?? null} prevValue={prev?.radiationLevel ?? null}
              unit="μSv/h" icon={Atom} color="text-rose-400"
              warn={(v) => v > 20} critical={(v) => v > 30}
            />
            <div className="flex flex-col gap-1 p-3 rounded-lg border border-white/5 bg-white/3">
              <div className="flex items-center gap-1.5">
                <Zap className={cn("w-3 h-3", tele?.thrusterStatus === "warning" ? "text-yellow-400" : "text-emerald-400")} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Thruster</span>
              </div>
              <span className={cn(
                "text-lg font-bold font-mono uppercase",
                tele?.thrusterStatus === "warning" ? "text-yellow-400" : "text-emerald-400",
              )}>
                {tele?.thrusterStatus ?? "---"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Active Missions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeMissions.length === 0 ? (
              <p className="text-muted-foreground text-sm font-mono py-4 text-center">NO ACTIVE MISSIONS</p>
            ) : (
              activeMissions.map((m: any, i: number) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Rocket className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium font-mono">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.destination}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-xs font-mono uppercase border", STATUS_COLOR[m.status] ?? "")}>
                    {m.status}
                  </Badge>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Live Alert Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-muted-foreground text-sm font-mono">ALL SYSTEMS NOMINAL</p>
              </div>
            ) : (
              recentAlerts.map((a: any, i: number) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn("flex items-start gap-3 p-3 rounded-md border", SEVERITY_COLOR[a.severity] ?? "")}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase font-semibold">{a.type?.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.message}</p>
                  </div>
                  <Badge className={cn("text-xs font-mono uppercase border flex-shrink-0 ml-auto", SEVERITY_COLOR[a.severity] ?? "")}>
                    {a.severity}
                  </Badge>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
