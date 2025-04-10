import { IonInput, IonItem, IonLabel } from "@ionic/react";

export const EditableField = (props) => {
  return props.isEditing ? (
    <div>
      <IonItem>
        <IonLabel position="stacked">{props.label}</IonLabel>
        <IonInput
          type="text" // TODO: Make this a prop
          name={props.name}
          value={props.value}
          onIonChange={props.onChange}
        />
      </IonItem>
      {props.error && <p className="text-red-500 text-xs mt-1">{props.error}</p>}
    </div>
  ) : (
    <div>
      <span className="font-medium">{props.label}: </span>
      {props.value}
    </div>
  );
};