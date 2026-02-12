import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCoffee, useIncrementCoffee } from "@/hooks/use-coffee";
import { Button } from "@/components/ui/button";
import { Coffee as CoffeeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function BuyMeACoffee() {
  const { data: coffee } = useCoffee();
  const { mutate: increment, isPending } = useIncrementCoffee();
  const [clickCount, setClickCount] = useState(0);

  const handleBuy = () => {
    increment();
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CoffeeIcon className="w-16 h-16 text-orange-600" />
          </div>

          <h1 className="text-5xl font-display font-extrabold text-slate-900 mb-6">
            Buy me a coffee
          </h1>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 max-w-md w-full mx-auto mb-8">
            <div className="text-6xl font-bold text-orange-600 mb-2 font-display tabular-nums">
              {coffee?.count ?? "..."}
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">
              Coffees bought for Eire
            </p>
          </div>

          <Button 
            size="lg"
            onClick={handleBuy}
            disabled={isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-12 h-16 text-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isPending ? "Brewing..." : "Buy a Coffee ☕"}
          </Button>

          {/* Floating hearts animation on click */}
          <AnimatePresence>
            {clickCount > 0 && (
              <motion.div 
                key={clickCount}
                initial={{ opacity: 1, y: 0, x: 0 }}
                animate={{ opacity: 0, y: -100 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none"
                style={{ 
                  left: "50%", 
                  top: "50%",
                  marginLeft: (Math.random() * 100 - 50) + "px",
                  marginTop: "-100px"
                }}
              >
                <div className="text-2xl">❤️</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
