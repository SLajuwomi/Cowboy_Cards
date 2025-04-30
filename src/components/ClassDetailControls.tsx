import { IonButton, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/react';
import { addOutline, arrowBackOutline, createOutline, exitOutline } from 'ionicons/icons';

const ClassDetailControls = (props) => {
  return (
    <IonGrid className="mb-4">
      <IonRow className="ion-align-items-center ion-justify-content-between">
        <IonCol size="12" size-md="auto">
          <IonButton routerLink="/home" color="primary">
            <IonIcon slot="start" icon={arrowBackOutline} />
            Back
          </IonButton>
        </IonCol>

        <IonCol size="12" size-md="auto" className="flex gap-2 flex-wrap">
          {props.isTeacher && (
            <>
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
            </>
          )}

          {/* <IonButton
             // Add handler here
            color="danger"
            disabled={!props.classId}
            onClick={() => props.onDeleteStudent(props)}
          >
            <IonIcon slot="start" icon={exitOutline} />
            Leave Class
          </IonButton> */}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default ClassDetailControls;
