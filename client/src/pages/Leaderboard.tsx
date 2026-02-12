import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useDisciplines } from "@/hooks/use-disciplines";
import { useResults } from "@/hooks/use-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Medal, Flag } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: disciplines, isLoading: disciplinesLoading } = useDisciplines();
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Leaderboards</h1>
          <p className="text-slate-500">View the results by discipline</p>
        </div>

        {disciplinesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {disciplines?.map((discipline, idx) => (
              <motion.div
                key={discipline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card 
                  className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-slate-100 group"
                  onClick={() => setSelectedDisciplineId(discipline.id)}
                >
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                      {discipline.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 font-medium">View Results →</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <ResultsDialog 
        disciplineId={selectedDisciplineId} 
        open={!!selectedDisciplineId} 
        onOpenChange={(open) => !open && setSelectedDisciplineId(null)}
        disciplineName={disciplines?.find(d => d.id === selectedDisciplineId)?.name}
      />

      <Footer />
    </div>
  );
}

function ResultsDialog({ 
  disciplineId, 
  open, 
  onOpenChange,
  disciplineName
}: { 
  disciplineId: number | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  disciplineName?: string;
}) {
  const { data: results, isLoading } = useResults(disciplineId || undefined);

  // Filter is redundant if backend filters, but good for safety
  const sortedResults = results
    ?.filter(r => r.disciplineId === disciplineId)
    .sort((a, b) => b.score - a.score) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[80vh] overflow-y-auto rounded-3xl p-0 gap-0">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
          <DialogTitle className="text-2xl font-display font-bold flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            {disciplineName} Results
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : sortedResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No results yet for this discipline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedResults.map((result, idx) => (
                <div 
                  key={result.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${idx === 0 ? 'bg-yellow-50 border-yellow-200' : idx === 1 ? 'bg-slate-50 border-slate-200' : idx === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx < 3 ? 'text-white' : 'text-slate-500 bg-slate-100'}`}
                      style={{ backgroundColor: idx === 0 ? '#EAB308' : idx === 1 ? '#94A3B8' : idx === 2 ? '#F97316' : undefined }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{result.contestantName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Flag className="w-3 h-3" /> {result.country}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-slate-900">{result.score.toFixed(1)}</div>
                    <div className="text-xs text-slate-400">Points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
