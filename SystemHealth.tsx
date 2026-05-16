import React from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Thermometer, Wifi, Wind, Cpu } from "lucide-react";
import { useGetSystemHealth, useGetSystemHealthHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const THRUSTER_COLOR: Record<string, string> = {
  nominal: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  degraded: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  critical: "text-destructive border-destructive/50 bg-destructive/10",
  offline: "text-muted-foreground border-white/10 bg-white/5",
};

function GaugeRing({ value, max = 100, color, size = 140 }: { value: number; max?: number; color: string; size?: number }) {
  const pct = Math.min(value / max, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="transform -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(215,35%,12%)" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function HealthGauge({ label, value, unit = "%", icon: Icon, color }: { label: string; value: number; unit?: string; icon: any; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <Card className="glass-panel border-white/5">
        <CardContent className="p-5 flex flex-col items-center space-y-3">
          <div className="relative">
            <GaugeRing value={value} color={color} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Icon className="w-5 h-5 mb-1" style={{ color }} />
              <p className="text-lg font-bold font-mono" style={{ color }}>{value.toFixed(1)}{unit}</p>
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono text-center">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SystemHealth() {
  const { data: health } = useGetSystemHealth();
  const { data: history } = useGetSystemHealthHistory();

  const historyData = (history ?? []).map((h: any) => ({
    time: new Date(h.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    fuel: parseFloat(h.fuelLevel ?? 0),
    battery: parseFloat(h.battery ?? 0),
    signal: parseFloat(h.signalStrength ?? 0),
    oxygen: parseFloat(h.oxygenLevel ?? 0),
    temperature: parseFloat(h.temperature ?? 0),
  }));

  const fuelLevel = parseFloat(health?.fuelLevel ?? "0");
  const battery = parseFloat(health?.battery ?? "0");
  const temperature = parseFloat(health?.temperature ?? "0");
  const signal = parseFloat(health?.signalStrength ?? "0");
  const oxygen = parseFloat(health?.oxygenLevel ?? "0");

  const TOOLTIP_STYLE = {
    backgroundColor: "hsl(230,40%,8%)",
    border: "1px solid hsl(215,35%,15%)",
    borderRadius: "6px",
    fontFamily: "monospace",
    fontSize: "11px",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">SYSTEM HEALTH</h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">REAL-TIME SPACECRAFT DIAGNOSTICS</p>
        </div>
        {health?.thrusterStatus && (
          <Badge className={cn("text-sm font-mono uppercase border", THRUSTER_COLOR[health.thrusterStatus] ?? "")}>
            <Cpu className="w-3 h-3 mr-1" />
            THRUSTERS: {health.thrusterStatus}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <HealthGauge label="Fuel Level" value={fuelLevel} icon={Zap} color="hsl(210,100%,50%)" />
        <HealthGauge label="Battery" value={battery} icon={Activity} color="hsl(280,100%,60%)" />
        <HealthGauge label="Oxygen Level" value={oxygen} icon={Wind} color="hsl(160,100%,45%)" />
        <HealthGauge label="Signal Strength" value={signal} icon={Wifi} color="hsl(40,100%,50%)" />
        <HealthGauge label="Temperature" value={temperature} unit="°C" icon={Thermometer} max={60} color="hsl(0,85%,60%)" />
      </div>

      {historyData.length > 1 && (
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground">System Telemetry History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={historyData}>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="fuel" stroke="hsl(210,100%,50%)" strokeWidth={1.5} dot={false} name="Fuel %" />
                <Line type="monotone" dataKey="battery" stroke="hsl(280,100%,60%)" strokeWidth={1.5} dot={false} name="Battery %" />
                <Line type="monotone" dataKey="signal" stroke="hsl(40,100%,50%)" strokeWidth={1.5} dot={false} name="Signal %" />
                <Line type="monotone" dataKey="oxygen" stroke="hsl(160,100%,45%)" strokeWidth={1.5} dot={false} name="O2 %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
