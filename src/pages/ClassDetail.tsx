import FlashcardCarousel from '@/components/flashcards/FlashcardCarousel';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { type CarouselApi } from '@/components/ui/carousel';
import Leaderboard from '@/components/ui/Leaderboard';
import StudentList from '@/components/ui/StudentList';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonAlert,
  IonButton,
  IonCardContent,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/react';
import { set } from 'date-fns';
import {
  arrowBackOutline,
  bookOutline,
  createOutline,
  peopleOutline,
  trophyOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Class = {
  ID: number;
  ClassName: string;
  ClassDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
  Role: string;
};

type FlashcardSet = {
  ID: number;
  SetName: string;
  SetDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
};

type ClassUser = {
  UserID: number;
  ClassID: number;
  Role: string;
  FirstName: string;
  LastName: string;
};

type SetScore = {
  SetName: string;
  Correct: number;
  Incorrect: number;
  NetScore: number;
  TimesAttempted: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ClassDetail = () => {
  const { id } = useParams();
  console.log("id", id);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [tab, setTab] = useState('flashcards');
  const [isTeacher, setIsTeacher] = useState(true);
  const [classData, setClassData] = useState<Class>();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [classUsers, setClassUsers] = useState<ClassUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<
    Array<{ name: string; totalScore: number }>
  >([]);
  const [loadingScores, setLoadingScores] = useState(false);

  // Update Class Name and Description Form
  const [isEditing, setIsEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    class_name: '',
    class_description: '',
  });

  const handleEdit = () => {
    console.log('Handling Edit');
    setUpdatedInfo({
      class_name: classData?.ClassName || '',
      class_description: classData?.ClassDescription || '',
    });
    setIsEditing(true);
  };

  // Form validation
  const [errors, setErrors] = useState<{
    className?: string;
    classDescription?: string;
    general?: string;
  }>({});

  // Basic validation before submitting
  const validateForm = () => {
    const newErrors: {
      className?: string;
      classDescription?: string;
    } = {};
    let isValid = true;

    // Trim whitespace from the input values
    updatedInfo.class_name = updatedInfo.class_name.trim();
    updatedInfo.class_description = updatedInfo.class_description.trim();

    if (!updatedInfo.class_name) {
      newErrors.className = 'Class name is required';
      isValid = false;
    }

    if (!updatedInfo.class_description) {
      newErrors.classDescription = 'Class description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    // Define the fields to be updated
    const fieldsToUpdate = ['class_name', 'class_description'];

    try {
      // Identify which fields have changed and create API call promises
      const updatePromises = fieldsToUpdate
        // .filter((field) => updatedInfo[field] !== classData[field]) // Only include modified fields
        .map((field) =>
          makeHttpCall<Class>(`${API_BASE}/api/classes/${field}`, {
            method: 'PUT',
            headers: {
              id: id, // User ID as a string
              [field]: updatedInfo[field], // New value for the field
            },
          })
        );

      // Wait for all API calls to complete successfully
      await Promise.all(updatePromises);
      // If all updates succeed, update the local state and exit editing mode
      setClassData((prev) => ({
        ...prev,
        ClassName: updatedInfo.class_name,
        ClassDescription: updatedInfo.class_description,
      }));
      setIsEditing(false);
    } catch (error) {
      // Log the error and notify the user if any update fails
      console.error(error);
      alert('Failed to update some fields. Please try again.');
    }
  };

  const handleChange = (e: any) => {
    const { name } = e.target;
    const value = e.detail.value;
    setUpdatedInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    async function fetchClass() {
      setLoading(true);
      setError(null);
      try {
        const data = await makeHttpCall<Class>(`${API_BASE}/api/classes/`, {
          method: 'GET',
          headers: {
            id: id,
          },
        });
        console.log('data', data);
        setClassData(data);
      } catch (error) {
        setError(`Error fetching class: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    async function fetchFlashcardSets() {
      const sets = await makeHttpCall<FlashcardSet[]>(
        `${API_BASE}/api/class_set/list_sets`,
        {
          method: 'GET',
          headers: {
            id: id,
          },
        }
      );
      console.log('sets', sets);
      setFlashcardSets(sets);
    }

    async function fetchClassUsers() {
      const users = await makeHttpCall<ClassUser[]>(
        `${API_BASE}/api/class_user/members`,
        {
          method: 'GET',
          headers: {
            class_id: id,
          },
        }
      );
      console.log('users', users);
      setClassUsers(users);
    }
    fetchClass();
    fetchFlashcardSets();
    fetchClassUsers();
  }, [id]);

  // New useEffect for score calculation
  useEffect(() => {
    async function calculateLeaderboardScores() {
      if (!classUsers.length || !flashcardSets.length) return;

      setLoadingScores(true);
      setError(null);
      const userScores = new Map<number, number>();

      try {
        // Process all users concurrently
        await Promise.all(
          classUsers.map(async (user) => {
            try {
              // Fetch scores for all sets concurrently for this user
              const setScores = await Promise.all(
                flashcardSets.map(async (set) => {
                  try {
                    const setScoresResponse = await makeHttpCall<SetScore[]>(
                      `${API_BASE}/api/card_history/set`,
                      {
                        method: 'GET',
                        headers: {
                          user_id: user.UserID.toString(),
                          set_id: set.ID.toString(),
                        },
                      }
                    );

                    // Calculate total NetScore for this set
                    if (Array.isArray(setScoresResponse)) {
                      return setScoresResponse.reduce(
                        (sum, score) => sum + (score.NetScore || 0),
                        0
                      );
                    }
                    return 0;
                  } catch (error) {
                    console.error(
                      `Error fetching scores for set ${set.ID}:`,
                      error
                    );
                    return 0;
                  }
                })
              );

              // Sum up all set scores for this user
              const totalUserScore = setScores.reduce(
                (sum, score) => sum + score,
                0
              );
              userScores.set(user.UserID, totalUserScore);
            } catch (error) {
              console.error(`Error processing user ${user.UserID}:`, error);
              userScores.set(user.UserID, 0);
            }
          })
        );

        // Create and sort final leaderboard data
        const finalLeaderboard = classUsers
          .map((user) => ({
            name: `${user.FirstName} ${user.LastName}`,
            totalScore: userScores.get(user.UserID) || 0,
          }))
          .sort((a, b) => b.totalScore - a.totalScore);

        setLeaderboardData(finalLeaderboard);
      } catch (error) {
        setError('Error calculating leaderboard scores');
        console.error('Leaderboard calculation error:', error);
      } finally {
        setLoadingScores(false);
      }
    }

    calculateLeaderboardScores();
  }, [classUsers, flashcardSets]);

  // TODO: get the user role from the backend, this code is currently not functional
  // need a way to get the user role from the backend, maybe through auth, RLS, or a query
  // useEffect(() => {
  //   async function fetchUser() {
  //     const user = await api.get<User>(
  //       `${API_BASE}/api/class_user/`,
  //       {
  //         headers: {
  //           user_id: id,
  //         },
  //       }
  //     );
  //     if (user.role === 'teacher') {
  //       setIsTeacher(true);
  //     }
  //   }
  //   fetchUser();
  // }, []);

  // Should hold the id of the student to be deleted and the state of the alert
  const [showDeleteStudentAlert, setShowDeleteStudentAlert] = useState({
    isOpen: false,
    studentId: null,
  });

  const onDeleteStudentClicked = (studentId) => {
    setShowDeleteStudentAlert((prev) => ({
      ...prev,
      isOpen: true,
      studentId: studentId,
    }));
  };

  const [showDeleteSetAlert, setShowDeleteSetAlert] = useState({
    isOpen: false,
    setId: null,
  });

  const onDeleteSetClicked = (setID) => {
    setShowDeleteSetAlert((prev) => ({
      ...prev,
      isOpen: true,
      setId: setID,
    }));
  };

  // Handler to delete a flashcard set
  const handleDeleteSet = (setId) => {
    try {
      makeHttpCall(`${API_BASE}/api/class_set/`, {
        method: 'DELETE',
        headers: {
          id: id,
          set_id: setId,
        },
      });
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      setError('Error deleting flashcard set');
    }
  };

  // Handler to delete a student
  const handleDeleteStudent = (studentId) => {
    try {
      makeHttpCall(`${API_BASE}/api/class_user/`, {
        method: 'DELETE',
        headers: {
          class_id: id,
          user_id: studentId,
        },
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Error deleting student');
    }
  };

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentCardIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  return (
    <IonContent className="ion-padding">
      <Navbar />

      <div id="main-content" className="container mx-auto px-4 py-8">
        {error && <div className="text-red-500 mt-2">{error}</div>}

        {isEditing ? (
          <IonCardContent className="p-6 pt-0">
            <h1 className="text-3xl font-bold mb-2">
              Update Class Information
            </h1>
            <div className="space-y-4">
              <IonItem>
                <IonLabel position="stacked">Class Name</IonLabel>
                <IonInput
                  type="text"
                  name="class_name"
                  placeholder="Enter class name"
                  value={updatedInfo?.class_name}
                  onIonChange={handleChange}
                />
              </IonItem>
              {errors.className && (
                <p className="text-red-500 text-xs mt-1">{errors.className}</p>
              )}
              <IonItem>
                <IonLabel position="stacked">Class Description</IonLabel>
                <IonInput
                  type="text"
                  name="class_description"
                  placeholder="Enter class description"
                  value={updatedInfo?.class_description}
                  onIonChange={handleChange}
                />
              </IonItem>
              {errors.classDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.classDescription}
                </p>
              )}
              <div className="flex justify-end">
                <IonButton
                  onClick={handleCancel}
                  fill="outline"
                  className="mr-2"
                >
                  Cancel
                </IonButton>
                <IonButton onClick={handleSave} fill="solid" color="primary">
                  Save
                </IonButton>
              </div>
            </div>
          </IonCardContent>
        ) : (
          <div className="flex justify-between items-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {loading ? 'Loading...' : classData?.ClassName}
              </h1>
              <p className="text-gray-600">
                {loading ? 'Loading...' : classData?.ClassDescription}
              </p>
              {isTeacher && (
                <IonIcon
                  icon={createOutline}
                  size="large"
                  color="primary"
                  className="hover:transform hover:scale-110 cursor-pointer p-2"
                  onClick={handleEdit}
                ></IonIcon>
              )}
            </div>
            {isTeacher && (
              //  TODO: create-set isn't accepting the class ID right now, will be necessary for making a set for a specific class
              <div className="mb-8">
                <IonButton
                  routerLink={`/create-set`}
                  fill="solid"
                  color="primary"
                >
                  Create Flashcard Set
                </IonButton>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-row justify-between mb-6">
          <IonButton onClick={() => window.history.back()} fill="outline">
            <IonIcon slot="start" icon={arrowBackOutline} />
            Back
          </IonButton>
          {/* TODO: should only show for teachers */}
        </div>

        <IonSegment
          value={tab}
          onIonChange={(e) => setTab(e.detail.value as string)}
          className="w-full mb-6"
        >
          <IonSegmentButton value="flashcards">
            <IonIcon icon={bookOutline} className="mr-2" />
            <IonLabel>Flashcard Sets</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="leaderboard">
            <IonIcon icon={trophyOutline} className="mr-2" />
            <IonLabel>Leaderboard</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="students">
            <IonIcon icon={peopleOutline} className="mr-2" />
            <IonLabel>Students</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {tab === 'leaderboard' && (
          <>
            {loadingScores ? (
              <div className="flex justify-center items-center p-8">
                <IonSpinner name="circular" />
                <span className="ml-2">Calculating scores...</span>
              </div>
            ) : (
              <Leaderboard
                leaderboard={leaderboardData}
                classUsers={classUsers}
              />
            )}
          </>
        )}

        {tab === 'flashcards' && (
          <FlashcardCarousel
            flashcardSets={flashcardSets}
            currentCardIndex={currentCardIndex}
            setApi={setCarouselApi}
            isTeacher={isTeacher}
            onDeleteSet={onDeleteSetClicked}
          />
        )}

        {tab === 'students' && (
          <div className="flex flex-col">
            <StudentList
              isTeacher={isTeacher}
              students={classUsers}
              onDeleteStudent={onDeleteStudentClicked}
            />
          </div>
        )}
      </div>

      {/* Delete Student Alert */}
      <IonAlert
        isOpen={showDeleteStudentAlert.isOpen}
        onDidDismiss={() =>
          setShowDeleteStudentAlert((prev) => ({
            ...prev,
            isOpen: false,
            studentId: null,
          }))
        }
        header="Confirm Deletion"
        message="Are you sure you want to delete this Student? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
              setShowDeleteStudentAlert((prev) => ({
                ...prev,
                isOpen: false,
                studentId: null,
              }));
            },
          },
          {
            text: 'Delete',
            handler: () => {
              // Add your delete account logic here
              handleDeleteStudent(showDeleteStudentAlert.studentId);
              setShowDeleteStudentAlert((prev) => ({
                ...prev,
                isOpen: false,
                studentId: null,
              }));
              console.log('Account deleted');
            },
          },
        ]}
      />

      {/* Delete Set Alert */}
      <IonAlert
        isOpen={showDeleteSetAlert.isOpen}
        onDidDismiss={() =>
          setShowDeleteSetAlert((prev) => ({
            ...prev,
            isOpen: false,
            setId: null,
          }))
        }
        header="Confirm Deletion"
        message="Are you sure you want to delete this Set? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
              setShowDeleteSetAlert((prev) => ({
                ...prev,
                isOpen: false,
                setId: null,
              }));
            },
          },
          {
            text: 'Delete',
            handler: () => {
              // Add your delete account logic here
              handleDeleteSet(showDeleteSetAlert.setId);
              setShowDeleteSetAlert((prev) => ({
                ...prev,
                isOpen: false,
                setId: null,
              }));
              console.log('Account deleted');
            },
          },
        ]}
      />
      <Footer />
    </IonContent>
  );
};

export default ClassDetail;
