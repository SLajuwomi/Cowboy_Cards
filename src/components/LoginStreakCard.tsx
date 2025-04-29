import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const IMAGE_SIZE = 256; // Size of the image in pixels

export default function LoginStreakCard(props) {
  const [frame, setFrame] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.7,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setFrame(frame + 1), 1000);
      if (frame == props.streak - 1) {
        clearTimeout(timer);
      }
    }
  }, [frame, props.streak, inView]);

  return (
    <IonCard className="md:w-1/2 rounded-lg border shadow-sm">
      <IonCardHeader className="p-6">
        <IonCardTitle className="text-xl font-rye font-semibold text-primary">
          Login Streak
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent
        ref={ref}
        className="py-6 px-0 flex flex-row items-center justify-center gap-8"
      >
        <img
          src={`/frame-${frame}.png`}
          alt="bonsai tree"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span className="text-6xl px-4 font-rye font-extrabold text-[color:--ion-color-primary] tabular-nums">
          {inView && (
            <CountUp
              start={0}
              end={props.streak}
              duration={6}
              useEasing={false}
            />
          )}
        </span>
      </IonCardContent>
    </IonCard>
  );
}
