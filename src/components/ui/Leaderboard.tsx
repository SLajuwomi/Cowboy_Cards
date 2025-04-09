import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonList,
} from '@ionic/react';

type LeaderboardEntry = {
  name: string;
  totalScore: number;
};

type LeaderboardProps = {
  leaderboard: LeaderboardEntry[];
  classUsers: any[];
};

const Leaderboard = ({ leaderboard, classUsers }: LeaderboardProps) => {
  return (
    <IonCard className='rounded-lg border shadow-sm'>
      <IonCardHeader>
        <IonCardTitle className='text-xl font-semibold'>
          Class Leaderboard
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList className='space-y-3' lines='none'>
          {leaderboard.map((entry, index) => (
            <IonItem key={index} className='muted-item p-3'>
              <div className='flex items-center gap-3'>
                <span className='font-medium text-lg'>{index + 1}</span>
                <span className='font-medium'>{entry.name}</span>
              </div>
              <span slot='end' className='text-primary font-semibold'>
                {entry.totalScore} points
              </span>
            </IonItem>
          ))}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};

export default Leaderboard;
