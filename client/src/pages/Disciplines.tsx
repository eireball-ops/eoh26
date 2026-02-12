import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useDisciplines } from "@/hooks/use-disciplines";
import { Input } from "@/components/ui/input";
import { Search, Snowflake } from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function Disciplines() {
  const { data: disciplines, isLoading, error } = useDisciplines();
  const [search, setSearch] = useState("");

  const filtered = disciplines?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Disciplines</h1>
              <p className="text-slate-500">Explore the sports of the 2026 Winter Games</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Search sports..." 
                className="pl-10 h-12 rounded-xl bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
             <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
               Failed to load disciplines. Please try again.
             </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((discipline, idx) => {
                // Dynamically resolve icon from string name
                const IconComponent = (Icons as any)[discipline.icon] || Snowflake;
                
                return (
                  <motion.div
                    key={discipline.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Card className="h-full border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                        
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner group-hover:shadow-lg z-10">
                          <IconComponent className="w-10 h-10" />
                        </div>
                        
                        <h3 className="text-xl font-bold font-display text-slate-900 group-hover:text-blue-700 transition-colors z-10 capitalize">
                          {discipline.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Snowflake className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium">No disciplines found matching "{search}"</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
