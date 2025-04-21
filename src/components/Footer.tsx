import {
  IonButton,
  IonButtons,
  IonFooter,
  IonIcon,
  IonText,
  IonToolbar,
} from '@ionic/react';
import { home } from 'ionicons/icons';

//TODO: Figure out how to not show this on mobile
const Footer = () => {
  return (
    <IonFooter className="hidden md:block ion-no-border fixed bottom-0 w-full">
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton routerLink="/home">
            <IonIcon icon={home} />
          </IonButton>
        </IonButtons>

        {/*/!* Add Button *!/*/}
        {/*<IonButtons slot="primary">*/}
        {/*    <IonButton expand="full" routerLink="/create">*/}
        {/*        <IonIcon icon={addCircle} />*/}
        {/*    </IonButton>*/}
        {/*</IonButtons>*/}

        {/*/!* Settings Button *!/*/}
        {/*<IonButtons slot="end">*/}
        {/*    <IonButton routerLink="/settings">*/}
        {/*        <IonIcon icon={settings} />*/}
        {/*    </IonButton>*/}
        {/*</IonButtons>*/}

        <IonText className="mx-auto text-center text-sm text-gray-500">
          Cowboy Cards 2025. Built for learning and fun.
        </IonText>
      </IonToolbar>
    </IonFooter>
  );
};

export { Footer };
