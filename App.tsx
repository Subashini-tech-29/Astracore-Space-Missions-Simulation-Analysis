import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/Shell";
import "@/lib/auth";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Missions from "@/pages/Missions";
import MissionDetail from "@/pages/MissionDetail";
import MissionNew from "@/pages/MissionNew";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import SystemHealth from "@/pages/SystemHealth";
import AIPredictions from "@/pages/AIPredictions";
import Communication from "@/pages/Communication";
import News from "@/pages/News";
import Users from "@/pages/Users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard">
        <Shell><Dashboard /></Shell>
      </Route>
      <Route path="/missions/new">
        <Shell><MissionNew /></Shell>
      </Route>
      <Route path="/missions/:id">
        <Shell><MissionDetail /></Shell>
      </Route>
      <Route path="/missions">
        <Shell><Missions /></Shell>
      </Route>
      <Route path="/analytics">
        <Shell><Analytics /></Shell>
      </Route>
      <Route path="/alerts">
        <Shell><Alerts /></Shell>
      </Route>
      <Route path="/system-health">
        <Shell><SystemHealth /></Shell>
      </Route>
      <Route path="/ai-predictions">
        <Shell><AIPredictions /></Shell>
      </Route>
      <Route path="/communication">
        <Shell><Communication /></Shell>
      </Route>
      <Route path="/news">
        <Shell><News /></Shell>
      </Route>
      <Route path="/users">
        <Shell><Users /></Shell>
      </Route>

      <Route>
        <Shell>
          <div className="flex items-center justify-center h-full">
            <h1 className="text-4xl font-bold neon-text font-mono tracking-widest">404 — SECTOR NOT FOUND</h1>
          </div>
        </Shell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
