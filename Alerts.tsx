import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Filter } from "lucide-react";
import { useListAlerts, useAcknowledgeAlert } from "@workspace/api-client-react";
import { getListAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-destructive border-destructive/50 bg-destructive/10",
  warning: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  safe: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
};

const SEVERITY_GLOW: Record<string, string> = {
  critical: "neon-border-destructive",
  warning: "",
  safe: "",
};

export default function Alerts() {
  const [severity, setSeverity] = useState("");
  const [acknowledged, setAcknowledged] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (severity && severity !== "all") params.severity = severity;
  if (acknowledged && acknowledged !== "all") params.acknowledged = acknowledged;

  const { data: alerts, isLoading } = useListAlerts(params, { query: { queryKey: getListAlertsQueryKey(params) } });
  const acknowledge = useAcknowledgeAlert();

  const handleAcknowledge = async (id: number) => {
    await acknowledge.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey(params) });
    toast({ title: "Alert Acknowledged", description: `Alert #${String(id).padStart(4, "0")} marked as acknowledged.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">ALERT CENTER</h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">{alerts?.length ?? 0} ALERTS MATCHING FILTERS</p>
        </div>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="sm:w-48 bg-black/40 border-white/10 font-mono">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 border-white/10">
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
          </SelectContent>
        </Select>
        <Select value={acknowledged} onValueChange={setAcknowledged}>
          <SelectTrigger className="sm:w-48 bg-black/40 border-white/10 font-mono">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 border-white/10">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="false">Unacknowledged</SelectItem>
            <SelectItem value="true">Acknowledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-lg glass-panel animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(alerts ?? []).length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400 opacity-50" />
              <p className="font-mono text-muted-foreground">ALL SYSTEMS NOMINAL — NO ALERTS</p>
            </div>
          ) : (
            (alerts ?? []).map((a: any, i: number) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn("glass-panel border transition-all", a.severity === "critical" && !a.acknowledged ? "border-destructive/30 neon-border-destructive" : "border-white/5")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <AlertTriangle className={cn("w-5 h-5 flex-shrink-0 mt-0.5", SEVERITY_COLOR[a.severity]?.split(" ")[0])} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold font-mono uppercase">{a.type?.replace(/_/g, " ")}</p>
                            <Badge className={cn("text-xs font-mono uppercase border", SEVERITY_COLOR[a.severity] ?? "")}>
                              {a.severity}
                            </Badge>
                            {a.acknowledged && (
                              <Badge className="text-xs font-mono border border-white/10 bg-white/5 text-muted-foreground">ACK</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                          <p className="text-xs text-muted-foreground/50 font-mono mt-1">
                            {new Date(a.createdAt).toLocaleString()} — ALERT #{String(a.id).padStart(4, "0")}
                          </p>
                        </div>
                      </div>
                      {!a.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(a.id)}
                          disabled={acknowledge.isPending}
                          className="flex-shrink-0 text-xs font-mono border-white/10 hover:border-emerald-400/50 hover:text-emerald-400"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          ACK
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
