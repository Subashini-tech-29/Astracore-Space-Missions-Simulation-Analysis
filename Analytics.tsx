import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  useGetAnalyticsSummary,
  useGetMissionsByStatus,
  useGetMissionsByDestination,
  useGetAlertsTimeline,
} from "@workspace/api-client-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["hsl(210,100%,50%)", "hsl(280,100%,60%)", "hsl(160,100%,45%)", "hsl(40,100%,50%)", "hsl(0,85%,60%)"];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(230,40%,8%)",
  border: "1px solid hsl(215,35%,15%)",
  borderRadius: "6px",
  fontFamily: "monospace",
  fontSize: "12px",
};

export default function Analytics() {
  const { data: summary } = useGetAnalyticsSummary();
  const { data: byStatus } = useGetMissionsByStatus();
  const { data: byDestination } = useGetMissionsByDestination();
  const { data: alertsTimeline } = useGetAlertsTimeline();

  const statusData = (byStatus ?? []).map((d: any) => ({ name: d.status?.toUpperCase(), value: d.count }));
  const destinationData = (byDestination ?? []).map((d: any) => ({ name: d.destination, count: d.count }));

  const timelineMap: Record<string, Record<string, number>> = {};
  (alertsTimeline ?? []).forEach((d: any) => {
    const date = d.date ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Unknown";
    if (!timelineMap[date]) timelineMap[date] = { date, critical: 0, warning: 0, safe: 0 };
    timelineMap[date][d.severity] = (timelineMap[date][d.severity] ?? 0) + Number(d.count);
  });
  const timelineData = Object.values(timelineMap).slice(0, 14).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">ANALYTICS</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">MISSION DATA INTELLIGENCE CENTER</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Missions", value: summary?.totalMissions ?? 0 },
          { label: "Success Rate", value: `${summary?.successRate ?? 0}%` },
          { label: "Total Alerts", value: summary?.totalAlerts ?? 0 },
          { label: "Critical Alerts", value: summary?.criticalAlerts ?? 0 },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-panel border-white/5 text-center">
              <CardContent className="p-5">
                <p className="text-3xl font-bold font-mono text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Missions by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={3} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Missions by Destination</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={destinationData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,35%,15%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215,20%,65%)", fontSize: 10, fontFamily: "monospace" }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "hsl(215,20%,65%)", fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="hsl(210,100%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Alerts Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground font-mono text-sm">NO TIMELINE DATA</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,35%,15%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(215,20%,65%)", fontSize: 10, fontFamily: "monospace" }} />
                <YAxis tick={{ fill: "hsl(215,20%,65%)", fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }} />
                <Line type="monotone" dataKey="critical" stroke="hsl(0,85%,60%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="warning" stroke="hsl(40,100%,50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="safe" stroke="hsl(160,100%,45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
