import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md mx-auto border-none shadow-xl">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">404 Page Not Found</h1>
          <p className="text-slate-500 mb-6">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link href="/">
            <Button className="w-full bg-slate-900 hover:bg-slate-800">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
