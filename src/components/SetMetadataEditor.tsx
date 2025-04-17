import React from 'react';
import { IonCard, IonCardContent, IonTextarea } from '@ionic/react';

interface SetMetadataEditorProps {
  setName: string;
  setDescription: string;
  onNameChange: (value: string | null | undefined) => void;
  onDescriptionChange: (value: string | null | undefined) => void;
}

const SetMetadataEditor: React.FC<SetMetadataEditorProps> = ({
  setName,
  setDescription,
  onNameChange,
  onDescriptionChange,
}) => {
  return (
    <IonCard className="mb-6 rounded-lg border shadow-sm">
      <IonCardContent>
        <IonTextarea
          label="Set Title"
          labelPlacement="stacked"
          placeholder="Enter set title"
          value={setName}
          onIonChange={(e) => onNameChange(e.detail.value)}
          rows={1}
          autoGrow
          className="w-full text-xl font-bold mb-2"
          style={{ resize: 'none' }}
        />

        <IonTextarea
          label="Set Description"
          labelPlacement="stacked"
          placeholder="Enter set description"
          value={setDescription}
          onIonChange={(e) => onDescriptionChange(e.detail.value)}
          rows={2}
          autoGrow
          className="w-full text-base mt-4"
          style={{ resize: 'none' }}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default SetMetadataEditor;
