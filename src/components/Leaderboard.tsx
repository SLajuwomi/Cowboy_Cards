import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonList,
} from '@ionic/react';

const Leaderboard = (props) => {
  return (
    <IonCard className="rounded-lg border shadow-sm">
      <IonCardHeader>
        <IonCardTitle className="text-xl font-semibold">
          Class Leaderboard
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList className="space-y-3" lines="none">
          {props.leaderboard === null ? (
            <h1 className="text-center text-gray-500">No scores available</h1>
          ) : (
            props.leaderboard.map((entry) => (
              <IonItem key={entry.UserID} className="muted-item p-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-lg">{entry.Username}</span>
                </div>
                <span slot="end" className="text-primary font-semibold">
                  {entry.ClassScore} points
                </span>
              </IonItem>
            ))
          )}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};

export default Leaderboard;
