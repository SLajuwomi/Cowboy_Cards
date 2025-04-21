import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';

export default function StreakFlameCard(props) {
  const [alive, setAlive] = useState(props.streak > 0);
  const [paused, setPaused] = useState(!alive);

  const prev = useRef(props.streak);
  useEffect(() => {
    setAlive(props.streak > 0);

    if (props.streak === 0) {
      setPaused(true);
      const t = setTimeout(() => setPaused(false), 3000);
      return () => clearTimeout(t);
    } else {
      setPaused(false); // Ensure it's not paused if streak > 0
    }
    prev.current = props.streak;
  }, [props.streak]);

  return (
    <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
      <IonCardHeader className="pb-16">
        <IonCardTitle className="text-xl font-semibold text-primary">
          Login Streak
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="py-6 px-0 flex flex-row items-center justify-center gap-6">
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
          <Flame className="w-16 h-16 text-orange-500" />
        </motion.div>

        <motion.span
          key={props.streak} // Re-trigger animation on streak change
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-6xl font-extrabold text-orange-500 tabular-nums"
        >
          <CountUp
            start={prev.current}
            end={props.streak}
            duration={0.7}
            preserveValue // Keep value on initial load
          />
        </motion.span>
      </IonCardContent>
    </IonCard>
  );
}
