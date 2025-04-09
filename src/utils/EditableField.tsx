import { IonInput, IonItem, IonLabel } from "@ionic/react";

interface EditableFieldProps {
  label: string;
  name: string;
  value: string;
  isEditing: boolean;
  error?: string;
  onChange: (e: CustomEvent) => void;
}

export const EditableField = ({
  label,
  name,   
  value,
  isEditing,
  error,      
  onChange,
}: EditableFieldProps) => {
  return isEditing ? (
    <div>
      <IonItem>
        <IonLabel position="stacked">{label}</IonLabel>
        <IonInput
          type="text" // TODO: Make this a prop
          name={name}
          value={value}
          onIonChange={onChange}
        />
      </IonItem>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ) : (
    <div>
      <span className="font-medium">{label}: </span>
      {value}
    </div>
  );
};