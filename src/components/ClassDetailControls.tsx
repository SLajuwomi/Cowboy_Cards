import { IonButton, IonIcon, IonGrid, IonCol, IonRow } from '@ionic/react';
import { addOutline, arrowBackOutline, createOutline } from 'ionicons/icons';

const ClassDetailControls = (props) => {
  return (
     <IonGrid className="mb-4">
      <IonRow className="ion-align-items-center ion-justify-content-between">
        <IonCol size="12" sizeMd="auto">
      <IonButton routerLink="/home" color="primary">
        <IonIcon slot="start" icon={arrowBackOutline} />
        Back
      </IonButton>
      </IonCol>

      {props.isTeacher && (
        <IonCol
        size="12"
        sizeMd="auto"
        className="flex gap-2 flex-wrap justify-end"
      >
          <IonButton
            onClick={props.onAddSetClick}
            color="primary"
            disabled={!props.classId}
          >
            <IonIcon slot="start" icon={addOutline} />
            Add Existing Set
          </IonButton>

          <IonButton
            routerLink={`/create-set?classId=${props.classId}`}
            color="primary"
            disabled={!props.classId}
          >
            <IonIcon slot="start" icon={createOutline} />
            Create New Set
          </IonButton>
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default ClassDetailControls;