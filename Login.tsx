import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, ShieldAlert } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      setAuthToken(res.token);
      toast({
        title: "Authentication Successful",
        description: `Welcome back, Commander ${res.user.username}.`,
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="glass-panel border-primary/20 neon-border bg-black/40 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 neon-border mb-4">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-widest neon-text font-mono">ASTRACORE</CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-xs">
              Mission Control Authentication Gate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">Operator ID</Label>
                <Input
                  id="username"
                  {...register("username")}
                  className="bg-black/50 border-primary/30 focus:border-primary focus:ring-primary font-mono"
                  placeholder="Enter your identifier"
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Access Code</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-black/50 border-primary/30 focus:border-primary focus:ring-primary font-mono"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 neon-border"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "AUTHORIZING..." : "INITIALIZE LOGIN"}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  New operator?{" "}
                  <Link href="/register" className="text-primary hover:text-primary/80 underline decoration-primary/50 underline-offset-4">
                    Request clearance
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
