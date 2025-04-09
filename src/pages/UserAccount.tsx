import { Navbar } from '@/components/navbar';
import { useTheme } from '@/contexts/ThemeContext';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  useIonToast,
} from '@ionic/react';
import {
  arrowBackOutline,
  chevronDownOutline,
  chevronUpOutline,
  createOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
};

type Stats = {
  accountCreated: string;
  numClasses: number;
  cardsShown: number;
  cardsMastered: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const UserAccount = () => {
  const { theme, setTheme } = useTheme();
  const [userInfo, setUserInfo] = useState<User>();
  const [stats, setStats] = useState<Stats>();

  const [classHistory, setClassHistory] = useState([
    {
      id: 1,
      title: 'Biology 101',
      startDate: '2023-01-15',
      endDate: '2023-05-20',
      link: '#',
    },
    {
      id: 2,
      title: 'Chemistry 201',
      startDate: '2022-08-10',
      endDate: '2022-12-15',
      link: '#',
    },
    {
      id: 3,
      title: 'Chemistry 202',
      startDate: '2023-08-10',
      endDate: '2023-12-15',
      link: '#',
    },
  ]);

  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState(userInfo);

  const toggleClassDetails = (classID: number) => {
    setExpandedClass(expandedClass === classID ? null : classID);
  };

  const handleEdit = () => {
    setUpdatedInfo(userInfo);
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Define the fields that can be updated
    const fieldsToUpdate = ['first_name', 'last_name', 'username', 'email'];

    try {
      // Identify which fields have changed and create API call promises
      const updatePromises = fieldsToUpdate
        .filter((field) => updatedInfo[field] !== userInfo[field]) // Only include modified fields
        .map((field) =>
          makeHttpCall<User>(`${API_BASE}/api/users/${field}`, {
            method: 'PUT',
            headers: {
              [field]: updatedInfo[field], // New value for the field
            },
          })
        );

      // Wait for all API calls to complete successfully
      await Promise.all(updatePromises);
      // If all updates succeed, update the local state and exit editing mode
      setUserInfo(updatedInfo);
      setIsEditing(false);
    } catch (error) {
      // Log the error and notify the user if any update fails
      console.error(error);
      alert('Failed to update some fields. Please try again.');
    }
  };

  // Basic validation before submitting
  const validateForm = () => {
    const newErrors: {
      first_name?: string;
      last_name?: string;
      email?: string;
      username?: string;
    } = {};
    let isValid = true;

    // First name validation
    if (!updatedInfo.first_name) {
      newErrors.first_name = 'First name is required';
      isValid = false;
    }

    // Last name validation
    if (!updatedInfo.last_name) {
      newErrors.last_name = 'Last name is required';
      isValid = false;
    }

    // Email validation
    if (!updatedInfo.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(updatedInfo.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Username validation
    if (!updatedInfo.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    // Trim whitespace from the input values
    updatedInfo.first_name = updatedInfo.first_name.trim();
    updatedInfo.last_name = updatedInfo.last_name.trim();
    updatedInfo.email = updatedInfo.email.trim();
    updatedInfo.username = updatedInfo.username.trim();

    setErrors(newErrors);
    return isValid;
  };

  // Form validation
  const [errors, setErrors] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
    username?: string;
    general?: string;
  }>({});

  const handleChange = (e: any) => {
    const { name } = e.target;
    const value = e.detail.value;
    setUpdatedInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await makeHttpCall<User>(`${API_BASE}/api/users/`, {
          method: 'GET',
          headers: {},
        });
        setUserInfo(data);
        setStats({
          accountCreated: data.created_at,
          numClasses: 2,
          cardsShown: 120,
          cardsMastered: 85,
        });
        setUpdatedInfo(data);
        console.log('data', data);
      } catch (error) {
        console.log(`Failed to fetch User Data: ${error.message}`);
      }
    };

    fetchUserData();

    // cleanup func not necessary here
    // https://blog.logrocket.com/understanding-react-useeffect-cleanup-function/
  }, []);

  // Hook for showing toast messages, used for password change
  const [presentToast] = useIonToast();

  return (
    <IonContent>
      <Navbar />

      <div id="main-content" className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <p className="text-xl font-semibold text-primary">
            Welcome back, {userInfo?.username || 'Auth Failed'}!
          </p>
        </div>

        {/* Back Button */}
        <IonButton
          onClick={() => window.history.back()}
          fill="outline"
          className="mb-6"
        >
          <IonIcon slot="start" icon={arrowBackOutline} />
          Back
        </IonButton>

        {/* First Row: Account Information and Stats */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Account Information Card */}
          <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
            <IonCardHeader className="p-6">
              <IonCardTitle className="text-xl font-semibold text-primary">
                Account Information
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="p-6 pt-0">
              {isEditing ? (
                <div className="space-y-4">
                  <IonItem>
                    <IonLabel position="stacked">First Name</IonLabel>
                    <IonInput
                      type="text"
                      name="first_name"
                      value={updatedInfo?.first_name || 'Auth Failed'}
                      onIonChange={handleChange}
                    />
                  </IonItem>
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.first_name}
                    </p>
                  )}
                  <IonItem>
                    <IonLabel position="stacked">Last Name</IonLabel>
                    <IonInput
                      type="text"
                      name="last_name"
                      value={updatedInfo?.last_name || 'Auth Failed'}
                      onIonChange={handleChange}
                    />
                  </IonItem>
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.last_name}
                    </p>
                  )}
                  <IonItem>
                    <IonLabel position="stacked">Username</IonLabel>
                    <IonInput
                      type="text"
                      name="username"
                      value={updatedInfo?.username || 'Auth Failed'}
                      onIonChange={handleChange}
                    />
                  </IonItem>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      type="email"
                      name="email"
                      value={updatedInfo?.email || 'Auth Failed'}
                      onIonChange={handleChange}
                    />
                  </IonItem>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <IonButton onClick={handleSave}>Save Changes</IonButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">First Name: </span>
                    {userInfo?.first_name || 'Auth Failed'}
                  </div>
                  <div>
                    <span className="font-medium">Last Name: </span>
                    {userInfo?.last_name || 'Auth Failed'}
                  </div>
                  <div>
                    <span className="font-medium">Username: </span>
                    {userInfo?.username || 'Auth Failed'}
                  </div>
                  <div>
                    <span className="font-medium">Email: </span>
                    {userInfo?.email || 'Auth Failed'}
                  </div>
                  <IonButton
                    fill="outline"
                    onClick={handleEdit}
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
                  <span>{stats?.accountCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Classes Taken:</span>
                  <span>{stats?.numClasses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Cards Shown:</span>
                  <span>{stats?.cardsShown}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Cards Mastered:</span>
                  <span>{stats?.cardsMastered}</span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Second Row: Class History and Account Options */}
        <div className="flex flex-col md:flex-row gap-6 py-6">
          {/* Class History Card */}
          <IonCard className="w-full md:w-1/2 rounded-lg border shadow-sm">
            <IonCardHeader className="p-6">
              <IonCardTitle className="text-xl font-semibold text-primary">
                Class History
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="p-6 pt-0">
              <IonList>
                {classHistory.map((cls) => (
                  <div key={cls.id}>
                    <IonItem button onClick={() => toggleClassDetails(cls.id)}>
                      <IonLabel>{cls.title}</IonLabel>
                      <IonIcon
                        icon={
                          expandedClass === cls.id
                            ? chevronUpOutline
                            : chevronDownOutline
                        }
                        slot="end"
                      />
                    </IonItem>
                    {expandedClass === cls.id && (
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
          </IonCard>

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
                    value={theme}
                    onIonChange={(e) =>
                      setTheme(e.detail.value as 'light' | 'dark')
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
                  <IonButton onClick={() => setShowPasswordAlert(true)}>
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
                    onClick={() => setShowDeleteAlert(true)}
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
          isOpen={showPasswordAlert}
          onDidDismiss={() => setShowPasswordAlert(false)}
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
                  presentToast({
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
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
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
      </div>
    </IonContent>
  );
};

export default UserAccount;
