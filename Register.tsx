import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, ShieldAlert } from "lucide-react";
import { useRegister } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "At least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await registerMutation.mutateAsync({ data: { ...data, role: "user" } });
      setAuthToken(res.token);
      toast({
        title: "Clearance Granted",
        description: `Welcome aboard, Commander ${res.user.username}.`,
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Unable to create account.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full"
            initial={{ x: Math.random() * 1200, y: Math.random() * 900, opacity: Math.random() * 0.4 + 0.1 }}
            animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }}
            transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="glass-panel border-accent/20 neon-border-accent bg-black/40 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30 neon-border-accent mb-4">
              <Rocket className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-widest neon-text font-mono">ASTRACORE</CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-xs">
              Request Mission Control Clearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Operator ID</Label>
                <Input {...register("username")} className="bg-black/50 border-accent/30 focus:border-accent font-mono" placeholder="Choose your callsign" />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Comm Channel (Email)</Label>
                <Input type="email" {...register("email")} className="bg-black/50 border-accent/30 focus:border-accent font-mono" placeholder="operator@mission.space" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Access Code</Label>
                <Input type="password" {...register("password")} className="bg-black/50 border-accent/30 focus:border-accent font-mono" placeholder="••••••••" />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 neon-border-accent" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "PROCESSING..." : "REQUEST CLEARANCE"}
              </Button>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Already authorized?{" "}
                  <Link href="/" className="text-primary hover:text-primary/80 underline decoration-primary/50 underline-offset-4">
                    Access terminal
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="mt-8 flex items-center justify-center text-xs text-muted-foreground/50 space-x-2 font-mono">
          <ShieldAlert className="w-4 h-4" />
          <span>RESTRICTED ACCESS - AUTHORIZED PERSONNEL ONLY</span>
        </div>
      </motion.div>
    </div>
  );
}
