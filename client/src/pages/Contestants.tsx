import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useContestants, ContestantWithDisciplines } from "@/hooks/use-contestants";
import { useAuth } from "@/hooks/use-auth";
import { useAdminEditContestant, useAdminDeleteContestant } from "@/hooks/use-admin-contestants";
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

  const { data: contestants, isLoading, error } = useContestants();
  const { user } = useAuth();
  const isAdmin = user?.email === "@admin";
  const editContestant = useAdminEditContestant();
  const deleteContestant = useAdminDeleteContestant();
  const [editId, setEditId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({ name: "", country: "", skillMultiplier: "", multiplierText: "" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filtered: ContestantWithDisciplines[] = contestants?.filter(c => 
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
                      {isAdmin && editId === contestant.id ? (
                        <div className="flex flex-col gap-2 mb-2">
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editFields.name}
                            onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
                            placeholder="Name"
                          />
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editFields.country}
                            onChange={e => setEditFields(f => ({ ...f, country: e.target.value }))}
                            placeholder="Country"
                          />
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editFields.skillMultiplier}
                            onChange={e => setEditFields(f => ({ ...f, skillMultiplier: e.target.value }))}
                            placeholder="Skill Multiplier"
                            type="number"
                          />
                          <input
                            className="border rounded px-2 py-1 mb-1"
                            value={editFields.multiplierText}
                            onChange={e => setEditFields(f => ({ ...f, multiplierText: e.target.value }))}
                            placeholder="Multiplier Text"
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              className="text-green-700 font-bold px-2"
                              onClick={() => {
                                editContestant.mutate({
                                  id: contestant.id,
                                  name: editFields.name,
                                  country: editFields.country,
                                  skillMultiplier: parseFloat(editFields.skillMultiplier),
                                  multiplierText: editFields.multiplierText,
                                });
                                setEditId(null);
                              }}
                            >Save</button>
                            <button
                              className="text-slate-400 px-2"
                              onClick={() => setEditId(null)}
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                            {contestant.name}
                          </h3>
                          <div className="flex items-center text-slate-500 text-sm mb-1">
                            <Flag className="w-4 h-4 mr-2" />
                            {contestant.country}
                          </div>
                          {contestant.disciplines && contestant.disciplines.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {contestant.disciplines.map((d) => (
                                <span key={d.id} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                  <span className="mr-1">{d.icon}</span>{d.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {isAdmin && (
                            <div className="flex gap-2 mt-2">
                              <button
                                className="text-blue-700 font-bold text-xs underline"
                                onClick={() => {
                                  setEditId(contestant.id);
                                  setEditFields({
                                    name: contestant.name,
                                    country: contestant.country,
                                    skillMultiplier: contestant.skillMultiplier.toString(),
                                    multiplierText: contestant.multiplierText,
                                  });
                                }}
                              >Edit</button>
                              <button
                                className="text-red-700 font-bold text-xs underline"
                                onClick={() => deleteContestant.mutate(contestant.id)}
                              >Delete</button>
                            </div>
                          )}
                        </>
                      )}
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
