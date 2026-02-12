import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { 
  Trophy, 
  Users, 
  Dices, 
  Coffee, 
  Calendar, 
  Medal,
  Snowflake,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { 
    title: "Disciplines", 
    href: "/disciplines", 
    icon: Snowflake, 
    color: "from-blue-400 to-cyan-300",
    description: "Explore the winter sports" 
  },
  { 
    title: "Leaderboards", 
    href: "/leaderboard", 
    icon: Trophy, 
    color: "from-yellow-400 to-amber-300",
    description: "See who's on top" 
  },
  { 
    title: "Contestants", 
    href: "/contestants", 
    icon: Users, 
    color: "from-emerald-400 to-green-300",
    description: "Meet the athletes" 
  },
  { 
    title: "Simulate", 
    href: "/simulate", 
    icon: Dices, 
    color: "from-purple-400 to-pink-300",
    description: "Roll the dice & compete" 
  },
  { 
    title: "Buy Me A Coffee", 
    href: "/buymeacoffee", 
    icon: Coffee, 
    color: "from-orange-400 to-red-300",
    description: "Support the creator" 
  },
  { 
    title: "Schedule", 
    href: "/schedule", 
    icon: Calendar, 
    color: "from-indigo-400 to-blue-300",
    description: "Event timeline" 
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <Medal className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Official 2026 Games</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
            Milano Maribor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">2026</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Welcome to the winter games. Simulate events, track results, and follow the schedule.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={item.href} className="group block h-full">
                <div className="h-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100/50 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                  {/* Background Gradient Blob */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 text-white`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-500 font-medium mb-6">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Enter Section <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
