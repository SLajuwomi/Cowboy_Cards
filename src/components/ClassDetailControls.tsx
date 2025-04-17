import React from 'react';
import { IonButton, IonIcon, IonCardContent } from '@ionic/react';
import { arrowBackOutline, createOutline, addOutline } from 'ionicons/icons';

interface ClassDetailControlsProps {
  isTeacher: boolean;
  classId: string | undefined;
  onAddSetClick: () => void;
}

const ClassDetailControls: React.FC<ClassDetailControlsProps> = ({
  isTeacher,
  classId,
  onAddSetClick,
}) => {
  return (
    <IonCardContent>
      <div className="flex justify-between items-center mb-4">
        <IonButton routerLink="/home" color="medium">
          <IonIcon slot="start" icon={arrowBackOutline} />
          Back
        </IonButton>
        {isTeacher && (
          <div className="flex gap-2">
            <IonButton
              onClick={onAddSetClick}
              color="secondary"
              disabled={!classId}
            >
              {/* TODO: Fix colors on this button */}
              <IonIcon slot="start" icon={addOutline} />
              Add Existing Set
            </IonButton>

            {/* TODO: Confirm create-set route and query param handling */}
            <IonButton
              routerLink={`/create-set?classId=${classId}`}
              color="primary"
              disabled={!classId}
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
