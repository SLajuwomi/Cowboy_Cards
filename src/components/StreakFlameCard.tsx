import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card'; // Assuming shadcn Card is available

interface Props {
  streak: number;
}

export default function StreakFlameCard({ streak }: Props) {
  const [alive, setAlive] = useState(streak > 0);
  const [paused, setPaused] = useState(!alive);

  const prev = useRef(streak);
  useEffect(() => {
    setAlive(streak > 0);

    if (streak === 0) {
      setPaused(true);
      const t = setTimeout(() => setPaused(false), 3000);
      return () => clearTimeout(t);
    } else {
      setPaused(false); // Ensure it's not paused if streak > 0
    }
    prev.current = streak;
  }, [streak]);

  return (
    <Card className="flex items-center gap-3 px-4 py-3 w-fit">
      <motion.div
        animate={
          paused
            ? { opacity: 0.4, scale: 1, filter: 'grayscale(1)' }
            : {
                scale: [1, 1.15, 1],
                filter: [
                  'drop-shadow(0 0 2px #fb923c)', // orange-400
                  'drop-shadow(0 0 8px #fb923c)', // orange-400
                  'drop-shadow(0 0 2px #fb923c)', // orange-400
                ],
              }
        }
        transition={
          paused
            ? { duration: 0.3 }
            : { repeat: Infinity, duration: 1.2, repeatDelay: 2 }
        }
      >
        <Flame className="w-8 h-8 text-orange-500" />
      </motion.div>

      <motion.span
        key={streak} // Re-trigger animation on streak change
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="text-3xl font-extrabold text-orange-500 tabular-nums"
      >
        <CountUp
          start={prev.current}
          end={streak}
          duration={0.7}
          preserveValue // Keep value on initial load
        />
      </motion.span>
    </Card>
  );
}
