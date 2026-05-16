import React from "react";
import { motion } from "framer-motion";
import { Users as UsersIcon, ShieldCheck, User } from "lucide-react";
import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Users() {
  const { data: users, isLoading } = useListUsers();

  const admins = users?.filter((u: any) => u.role === "admin").length ?? 0;
  const regular = users?.filter((u: any) => u.role === "user").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">OPERATORS</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">PERSONNEL MANAGEMENT — ADMIN ACCESS ONLY</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Operators", value: users?.length ?? 0, icon: UsersIcon, color: "text-primary" },
          { label: "Administrators", value: admins, icon: ShieldCheck, color: "text-destructive" },
          { label: "Standard Operators", value: regular, icon: User, color: "text-emerald-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-panel border-white/5">
              <CardContent className="p-5 flex items-center gap-4">
                <s.icon className={cn("w-8 h-8", s.color)} />
                <div>
                  <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground font-mono uppercase">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-primary" />
            Personnel Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded glass-panel animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {(users ?? []).map((u: any, i: number) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-md bg-white/5 border border-white/5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold font-mono text-primary">{u.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold font-mono">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-muted-foreground font-mono hidden sm:block">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <Badge className={cn(
                      "text-xs font-mono uppercase border",
                      u.role === "admin"
                        ? "text-destructive border-destructive/50 bg-destructive/10"
                        : "text-emerald-400 border-emerald-400/50 bg-emerald-400/10"
                    )}>
                      {u.role === "admin" ? <ShieldCheck className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {u.role}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
