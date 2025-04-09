import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from "@ionic/react";
import { EditableField } from "@/utils/EditableField";
import { createOutline } from "ionicons/icons";


const UserAccountFirstRow = (props) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Account Information Card */}
      <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
  <IonCardHeader className="p-6">
    <IonCardTitle className="text-xl font-semibold text-primary">
      Account Information
    </IonCardTitle>
  </IonCardHeader>
  <IonCardContent className="p-6 pt-0">
    {/* TODO: Make this into an EditingField component where you can pass whatever label or field you want. */}

    {props.isEditing ? (
      <div className="space-y-4">
        <EditableField
          label="First Name"
          name="first_name"
          value={props.updatedInfo?.first_name || ''}
          isEditing={props.isEditing}
          error={props.errors.first_name}
          onChange={props.handleChange}
        />
        <EditableField
          label="Last Name"
          name="last_name"
          value={props.updatedInfo?.last_name || ''}
          isEditing={props.isEditing}
          error={props.errors.last_name}
          onChange={props.handleChange}
        />
        <EditableField
          label="Username"
          name="username"
          value={props.updatedInfo?.username || ''}
          isEditing={props.isEditing}
          error={props.errors.username}
          onChange={props.handleChange}
        />
        <EditableField
          label="Email"
          name="email"
          value={props.updatedInfo?.email || ''}
          isEditing={props.isEditing}
          error={props.errors.email}
          onChange={props.handleChange}
        />
        <div className="mt-4 flex justify-end">
          <IonButton onClick={props.handleSave}>Save Changes</IonButton>
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <div>
          <span className="font-medium">First Name: </span>
          {props.userInfo?.first_name}
        </div>
        <div>
          <span className="font-medium">Last Name: </span>
          {props.userInfo?.last_name}
        </div>
        <div>
          <span className="font-medium">Username: </span>
          {props.userInfo?.username}
        </div>
        <div>
          <span className="font-medium">Email: </span>
          {props.userInfo?.email}
        </div>
        <IonButton
          fill="outline"
          onClick={props.handleEdit}
          className="mt-4"
        >
          <IonIcon slot="start" icon={createOutline} />
          Edit Info
        </IonButton>
      </div>
    )}
  </IonCardContent>
</IonCard>

{/* Account Stats Card */}
<IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
  <IonCardHeader className="p-6">
    <IonCardTitle className="text-xl font-semibold text-primary">
      Account Stats
    </IonCardTitle>
  </IonCardHeader>
  <IonCardContent className="p-6 pt-0">
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium">Account Created:</span>
        <span>{props.stats?.accountCreated}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">Classes Taken:</span>
        <span>{props.stats?.numClasses}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">Cards Shown:</span>
        <span>{props.stats?.cardsShown}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">Cards Mastered:</span>
        <span>{props.stats?.cardsMastered}</span>
      </div>
    </div>
  </IonCardContent>
</IonCard>
    </div>
  );
};

export default UserAccountFirstRow;
