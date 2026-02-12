import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useContestants } from "@/hooks/use-contestants";
import { useDisciplines } from "@/hooks/use-disciplines";
import { useCreateResult } from "@/hooks/use-results";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { AlertTriangle, Dices, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Simulate() {
  const { data: contestants } = useContestants();
  const { data: disciplines } = useDisciplines();
  const { mutate: submitResult, isPending } = useCreateResult();
  const { toast } = useToast();

  const [selectedContestantId, setSelectedContestantId] = useState<string>("");
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("");
  const [rolling, setRolling] = useState(false);
  const [rollValue, setRollValue] = useState<number | null>(null);
  
  // Conflict dialog state
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  const selectedContestant = contestants?.find(
    (c) => c.id.toString() === selectedContestantId
  );

  const handleRoll = () => {
    if (!selectedContestantId || !selectedDisciplineId) {
      toast({
        title: "Missing selection",
        description: "Please select both an athlete and a discipline.",
        variant: "destructive",
      });
      return;
    }

    setRolling(true);
    setRollValue(null);

    // Simulate dice roll duration
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setRollValue(roll);
      setRolling(false);

      if (roll === 20) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      submitResult(
        {
          contestantId: parseInt(selectedContestantId),
          disciplineId: parseInt(selectedDisciplineId),
          roll,
        },
        {
          onSuccess: (data) => {
            toast({
              title: "Score Submitted!",
              description: `${selectedContestant?.name} scored ${data.score.toFixed(1)}!`,
              className: "bg-green-50 border-green-200 text-green-900",
            });
          },
          onError: (err) => {
            if (err.message.includes("nuh uh")) {
              setConflictMessage(err.message);
              setShowConflictDialog(true);
            } else {
              toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
              });
            }
          },
        }
      );
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />
            <h1 className="text-3xl font-display font-bold relative z-10 mb-2">Simulate Event</h1>
            <p className="text-blue-200 relative z-10">Roll the dice to determine the athlete's performance</p>
          </div>

          <div className="p-8 md:p-12">
            {/* Skill Multiplier Display */}
            <div className="flex justify-center mb-12">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Skill Multiplier</p>
                <div className="text-4xl font-display font-bold text-blue-600">
                  {selectedContestant ? selectedContestant.multiplierText : "---"}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              {/* Left Column: Discipline Selection */}
              <div className="w-full md:w-1/3 space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Discipline</label>
                <Select
                  value={selectedDisciplineId}
                  onValueChange={setSelectedDisciplineId}
                >
                  <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 text-lg">
                    <SelectValue placeholder="Pick a discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines?.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Center Column: Dice */}
              <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                <div className="dice-container mb-8">
                  <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center transform transition-all duration-500 ${rolling ? 'animate-spin' : 'hover:scale-105 hover:-translate-y-2'}`}>
                    {rolling ? (
                      <Dices className="w-16 h-16 text-white animate-pulse" />
                    ) : rollValue !== null ? (
                      <span className="text-6xl font-display font-bold text-white">{rollValue}</span>
                    ) : (
                      <Dices className="w-16 h-16 text-white/90" />
                    )}
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={handleRoll} 
                  disabled={rolling || isPending}
                  className="w-full h-14 text-lg rounded-xl bg-slate-900 hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                >
                  {rolling ? "Rolling..." : "Roll!"}
                </Button>
              </div>

              {/* Right Column: Athlete Selection */}
              <div className="w-full md:w-1/3 space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Athlete</label>
                <Select
                  value={selectedContestantId}
                  onValueChange={setSelectedContestantId}
                >
                  <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 text-lg">
                    <SelectValue placeholder="Pick an athlete" />
                  </SelectTrigger>
                  <SelectContent>
                    {contestants?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Conflict Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 text-xl font-bold">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Whoops!
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-lg font-medium text-slate-900">
              {conflictMessage || "nuh uh ya cant roll twice"}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Each athlete can only compete once per discipline.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowConflictDialog(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
