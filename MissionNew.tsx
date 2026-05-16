import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, ArrowLeft } from "lucide-react";
import { useCreateMission } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const missionSchema = z.object({
  name: z.string().min(3, "Mission name required"),
  destination: z.string().min(2, "Destination required"),
  launchDate: z.string().min(1, "Launch date required"),
  payload: z.string().min(2, "Payload description required"),
  status: z.enum(["planning", "active", "completed", "failed", "aborted"]),
  description: z.string().optional(),
});

type MissionFormValues = z.infer<typeof missionSchema>;

const DESTINATIONS = ["Moon", "Mars", "Venus", "Jupiter", "Saturn", "Deep Space", "ISS (Low Earth Orbit)"];

export default function MissionNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMission = useCreateMission();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: { status: "planning" },
  });

  const onSubmit = async (data: MissionFormValues) => {
    try {
      const mission = await createMission.mutateAsync({ data: { ...data, launchDate: new Date(data.launchDate).toISOString() } });
      toast({ title: "Mission Created", description: `${data.name} has been logged in the system.` });
      setLocation(`/missions/${(mission as any).id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to create mission", description: error.message });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/missions">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono neon-text tracking-widest">NEW MISSION</h1>
          <p className="text-muted-foreground text-sm font-mono">REGISTER MISSION IN CONTROL DATABASE</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-muted-foreground">
              <Rocket className="w-4 h-4 text-primary" />
              Mission Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Mission Name</Label>
                  <Input {...register("name")} className="bg-black/40 border-white/10 font-mono" placeholder="e.g. Helios-7" />
                  {errors.name && <p className="text-xs text-destructive font-mono">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Status</Label>
                  <Select defaultValue="planning" onValueChange={(v) => setValue("status", v as any)}>
                    <SelectTrigger className="bg-black/40 border-white/10 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 border-white/10">
                      {["planning", "active", "completed", "failed", "aborted"].map((s) => (
                        <SelectItem key={s} value={s} className="font-mono uppercase">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Destination</Label>
                  <Select onValueChange={(v) => setValue("destination", v)}>
                    <SelectTrigger className="bg-black/40 border-white/10 font-mono">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 border-white/10">
                      {DESTINATIONS.map((d) => (
                        <SelectItem key={d} value={d} className="font-mono">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destination && <p className="text-xs text-destructive font-mono">{errors.destination.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Launch Date</Label>
                  <Input type="date" {...register("launchDate")} className="bg-black/40 border-white/10 font-mono" />
                  {errors.launchDate && <p className="text-xs text-destructive font-mono">{errors.launchDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Payload Description</Label>
                <Input {...register("payload")} className="bg-black/40 border-white/10 font-mono" placeholder="e.g. Scientific instruments, crew of 4" />
                {errors.payload && <p className="text-xs text-destructive font-mono">{errors.payload.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Mission Brief (Optional)</Label>
                <Textarea {...register("description")} className="bg-black/40 border-white/10 font-mono resize-none" rows={3} placeholder="Describe mission objectives and parameters..." />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground neon-border font-mono uppercase tracking-wider" disabled={createMission.isPending}>
                {createMission.isPending ? "REGISTERING..." : "REGISTER MISSION"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
