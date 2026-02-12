import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Circle, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Schedule() {
  const sports = [
    "panegg", 
    "skiing", 
    "hockey", 
    "curling", 
    "lumberjacking", 
    "snowboarding", 
    "skeleton"
  ];
  const days = Array.from({ length: 14 }, (_, i) => i + 1);

  const scheduleMap: Record<string, number[]> = {
    skeleton: [1, 8],
    curling: [2, 9],
    snowboarding: [3, 10],
    skiing: [4, 11],
    lumberjacking: [5, 12],
    hockey: [6, 13],
    panegg: [7, 14],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Schedule :)
            </h1>
            <p className="text-slate-500">Plan your viewing for the games</p>
          </div>

          <Card className="overflow-hidden bg-white shadow-xl border-slate-100 rounded-3xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                    <TableHead className="w-[200px] font-bold text-slate-900 pl-6 py-6">Sport</TableHead>
                    {days.map(d => (
                      <TableHead key={d} className="text-center font-bold text-slate-500 min-w-[60px] py-6">
                        Day {d}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sports.map((sport) => (
                    <TableRow key={sport} className="hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <TableCell className="font-semibold capitalize text-slate-700 pl-6 py-4">
                        {sport}
                      </TableCell>
                      {days.map((day) => {
                        const hasEvent = scheduleMap[sport]?.includes(day);
                        return (
                          <TableCell key={day} className="text-center p-2">
                            {hasEvent && (
                              <div className="flex justify-center">
                                <Circle className="w-6 h-6 fill-blue-600 text-blue-600 animate-pulse" />
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
