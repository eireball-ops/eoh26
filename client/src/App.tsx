import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Schedule from "@/pages/Schedule";
import Disciplines from "@/pages/Disciplines";
import Contestants from "@/pages/Contestants";
import Simulate from "@/pages/Simulate";
import Leaderboard from "@/pages/Leaderboard";
import BuyMeACoffee from "@/pages/BuyMeACoffee";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/disciplines" component={Disciplines} />
      <Route path="/contestants" component={Contestants} />
      <Route path="/simulate" component={Simulate} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/buymeacoffee" component={BuyMeACoffee} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
