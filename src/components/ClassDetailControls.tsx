import { IonButton, IonIcon } from '@ionic/react';
import { addOutline, createOutline } from 'ionicons/icons';

const ClassDetailControls = (props) => {
  return (
    <div className="flex justify-between items-center mb-4">
      {props.isTeacher && (
        <div className="flex flex-col md:flex-row gap-2">
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
        </div>
      )}
    </div>
  );
};

export default ClassDetailControls;
