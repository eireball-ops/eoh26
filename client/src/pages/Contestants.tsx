import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useContestants } from "@/hooks/use-contestants";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, User, Flag } from "lucide-react";
import { motion } from "framer-motion";

type SortOption = "name" | "country";

export default function Contestants() {
  const { data: contestants, isLoading, error } = useContestants();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filtered = contestants?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.country.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return a.country.localeCompare(b.country);
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Contestants</h1>
              <p className="text-slate-500">Meet the athletes competing for glory</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="Search name or country..." 
                  className="pl-10 h-12 rounded-xl bg-white border-slate-200 shadow-sm focus:border-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-white border-slate-200 shadow-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="country">Sort by Country</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((contestant, idx) => (
                <motion.div
                  key={contestant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                >
                  <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 group h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                          {contestant.name.charAt(0)}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          {contestant.multiplierText}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {contestant.name}
                      </h3>
                      
                      <div className="flex items-center text-slate-500 text-sm">
                        <Flag className="w-4 h-4 mr-2" />
                        {contestant.country}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
