import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonAlert,
} from '@ionic/react';
import StreakFlameCard from './StreakFlameCard';

interface Props {
  streak: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  showPasswordAlert: boolean;
  setShowPasswordAlert: (show: boolean) => void;
  showDeleteAlert: boolean;
  setShowDeleteAlert: (show: boolean) => void;
  presentToast: (options: any) => void;
  isEditing: boolean;
  errors: { [key: string]: string | undefined };
  handleChange: (e: CustomEvent) => void;
  handleSave: () => Promise<void>;
  updatedInfo: any;
  userInfo: any;
  expandedClass: number | null;
  toggleClassDetails: (classID: number) => void;
}

const UserAccountSecondRow = (props: Props) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 py-6">
        <StreakFlameCard streak={props.streak} />
        <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
          <IonCardHeader className="p-6">
            <IonCardTitle className="text-xl font-semibold text-primary">
              Account Options
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="p-6 pt-0">
            <div className="space-y-4">
              <IonItem>
                <IonSelect
                  label="Theme"
                  value={props.theme}
                  onIonChange={(e) =>
                    props.setTheme(e.detail.value as 'light' | 'dark')
                  }
                  interface="popover"
                  placeholder="Select Theme"
                >
                  <IonSelectOption value="light">Light</IonSelectOption>
                  <IonSelectOption value="dark">Dark</IonSelectOption>
                </IonSelect>
              </IonItem>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Change Your Password</p>
                  <p className="text-xs text-gray-600">
                    Reset your account password.
                  </p>
                </div>
                <IonButton onClick={() => props.setShowPasswordAlert(true)}>
                  Change Password
                </IonButton>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Delete Your Account</p>
                  <p className="text-xs text-gray-600">
                    This will delete all account data and can't be undone.
                  </p>
                </div>
                <IonButton
                  color="danger"
                  onClick={() => props.setShowDeleteAlert(true)}
                >
                  Delete Account
                </IonButton>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </div>

      <IonAlert
        isOpen={props.showPasswordAlert}
        onDidDismiss={() => props.setShowPasswordAlert(false)}
        header="Change Password"
        inputs={[
          {
            name: 'oldPassword',
            type: 'password',
            placeholder: 'Old Password',
          },
          {
            name: 'newPassword',
            type: 'password',
            placeholder: 'New Password',
          },
          {
            name: 'confirmPassword',
            type: 'password',
            placeholder: 'Confirm New Password',
          },
        ]}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
          {
            text: 'Save',
            handler: (data) => {
              if (data.newPassword !== data.confirmPassword) {
                props.presentToast({
                  message: 'Passwords do not match',
                  duration: 2000,
                  color: 'danger',
                });
                return true;
              }

              console.log('Password changed');
              return true;
            },
          },
        ]}
      />

      <IonAlert
        isOpen={props.showDeleteAlert}
        onDidDismiss={() => props.setShowDeleteAlert(false)}
        header="Confirm Deletion"
        message="Are you sure you want to delete your account? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
          {
            text: 'Delete',
            handler: () => {
              console.log('Account deleted');
            },
          },
        ]}
      />
    </>
  );
};

export default UserAccountSecondRow;
