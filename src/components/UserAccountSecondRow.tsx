import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonAlert,
} from '@ionic/react';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';

const UserAccountSecondRow = (props) => {
  return (
    <>
      {/* Second Row: Class History and Account Options */}
      <div className="flex flex-col md:flex-row gap-6 py-6">
        {/* Class History Card */}
        {/* TODO: Replace this what some other component. Idea: Track user streaks */}
        {/* <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
          <IonCardHeader className="p-6">
            <IonCardTitle className="text-xl font-semibold text-primary">
              Class History
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="p-6 pt-0">
            <IonList>
              {props.classHistory.map((cls) => (
                <div key={cls.id}>
                  <IonItem button onClick={() => props.toggleClassDetails(cls.id)}>
                    <IonLabel>{cls.title}</IonLabel>
                    <IonIcon
                      icon={
                        props.expandedClass === cls.id
                          ? chevronUpOutline
                          : chevronDownOutline
                      }
                      slot="end"
                    />
                  </IonItem>
                  {props.expandedClass === cls.id && (
                    <IonItem lines="none">
                      <div className="pl-4 text-gray-700">
                        <p>
                          <span className="font-medium">Date Started:</span>{' '}
                          {cls.startDate}
                        </p>
                        <p>
                          <span className="font-medium">Date Ended:</span>{' '}
                          {cls.endDate}
                        </p>
                        <a href={cls.link} className="text-primary underline">
                          Go to Class Page
                        </a>
                      </div>
                    </IonItem>
                  )}
                </div>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard> */}

        {/* Account Options Card */}
        <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
          <IonCardHeader className="p-6">
            <IonCardTitle className="text-xl font-semibold text-primary">
              Account Options
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="p-6 pt-0">
            <div className="space-y-4">
              <IonItem>
                {/* <IonLabel>Theme</IonLabel> */}
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

      {/* Change Password Alert */}
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
                return true; // Allow the alert to close
              }
              // Add your password change logic here
              console.log('Password changed');
              return true;
            },
          },
        ]}
      />

      {/* Delete Account Alert */}
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
              // Add your delete account logic here
              console.log('Account deleted');
            },
          },
        ]}
      />
    </>
  );
};

export default UserAccountSecondRow;
