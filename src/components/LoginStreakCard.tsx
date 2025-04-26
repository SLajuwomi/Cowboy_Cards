import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { useRef } from 'react';
import CountUp from 'react-countup';
import GrowthAnimation from './BonsaiTree';

export default function LoginStreakCard(props) {
  const prev = useRef(props.streak);

  return (
    <IonCard className="md:w-1/2 rounded-lg border shadow-sm">
      <IonCardHeader className="p-6">
        <IonCardTitle className="text-xl font-rye font-semibold text-primary">
          Login Streak
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="py-6 px-0 flex flex-row items-center justify-center gap-8">
        <GrowthAnimation streak={props.streak} />

        <span
          key={props.streak}
          className="text-6xl px-4 font-rye font-extrabold text-[color:--ion-color-primary] tabular-nums"
        >
          <CountUp
            start={prev.current}
            end={props.streak}
            duration={0.7}
            preserveValue
          />
        </span>
      </IonCardContent>
    </IonCard>
  );
}
