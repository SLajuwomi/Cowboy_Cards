import { IonButton, IonIcon, IonCardContent } from '@ionic/react';
import { arrowBackOutline, createOutline, addOutline } from 'ionicons/icons';

const ClassDetailControls = (props) => {
  return (
    <IonCardContent>
      <div className="flex justify-between items-center mb-4">
        <IonButton routerLink="/home" color="medium">
          <IonIcon slot="start" icon={arrowBackOutline} />
          Back
        </IonButton>
        {props.isTeacher && (
          <div className="flex gap-2">
            <IonButton
              onClick={props.onAddSetClick}
              color="primary"
              disabled={!props.classId}
            >
              {/* TODO: Fix colors on this button */}
              <IonIcon slot="start" icon={addOutline} />
              Add Existing Set
            </IonButton>

            {/* TODO: Confirm create-set route and query param handling */}
            <IonButton
              routerLink={`/create-set?classId=${props.classId}`}
              color="primary"
              disabled={!props.classId}
            >
              <IonIcon slot="start" icon={createOutline} />
              Create New Set
            </IonButton>
          </div>
        )}
      </div>
    </IonCardContent>
  );
};

export default ClassDetailControls;
