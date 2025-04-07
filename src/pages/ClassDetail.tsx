import FlashcardCarousel from '@/components/flashcards/FlashcardCarousel';
import { Navbar } from '@/components/navbar';
import { type CarouselApi } from '@/components/ui/carousel';
import Leaderboard from '@/components/ui/Leaderboard';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonButton,
  IonCardContent,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import {
  arrowBackOutline,
  bookOutline,
  createOutline,
  trophyOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// type User = {
//     role: string;
// };

type Class = {
  ID: number;
  ClassName: string;
  ClassDescription: string;
  JoinCode: string;
  CreatedAt: string;
  UpdatedAt: string;
};

type FlashcardSet = {
  ID: number;
  SetName: string;
  SetDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ClassDetail = () => {
  const { id } = useParams();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [tab, setTab] = useState('flashcards');
  const [isTeacher, setIsTeacher] = useState(false);
  const [classData, setClassData] = useState<Class>();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update Class Name and Description Form
  const [isEditing, setIsEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    className: '',
    classDescription: '',
  });

  const handleEdit = () => {
    console.log('Handling Edit');
    setUpdatedInfo({
      className: classData?.ClassName || '',
      classDescription: classData?.ClassDescription || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    // try {
    //   await makeHttpCall(`${API_BASE}/api/classes/${id}`, {
    //     method: 'PUT',
    //     body: JSON.stringify(updatedInfo),
    //   });
    //   setClassData((prev) => ({
    //     ...prev,
    //     ClassName: updatedInfo.className,
    //     ClassDescription: updatedInfo.classDescription,
    //   }));
    //   setIsEditing(false);
    // } catch (error) {
    //   console.error('Error updating class:', error);
    // }
    console.log('Saving class data:', updatedInfo);
    setClassData((prev) => ({
      ...prev,
      ClassName: updatedInfo.className,
      ClassDescription: updatedInfo.classDescription,
    }));
    setIsEditing(false);
    setUpdatedInfo({
      className: '',
      classDescription: '',
    });
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
        `${API_BASE}/api/flashcards/sets/list`
      );
      console.log('sets', sets);
      setFlashcardSets(sets);
    }
    console.log('In useEffect');
    fetchClass();
    fetchFlashcardSets();
  }, []);

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

  const leaderboard = [
    { name: 'John Doe', cardsMastered: 95 },
    { name: 'Jane Smith', cardsMastered: 90 },
    { name: 'Bob Johnson', cardsMastered: 85 },
    { name: 'Alice Williams', cardsMastered: 82 },
    { name: 'Charlie Brown', cardsMastered: 80 },
  ];

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
                  name="className"
                  placeholder="Enter class name"
                  value={updatedInfo?.className || 'Auth Failed'}
                  onIonChange={handleChange}
                />
              </IonItem>
              {/* {errors.ClassName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ClassName}
                            </p>
                          )} */}
              <IonItem>
                <IonLabel position="stacked">Class Description</IonLabel>
                <IonInput
                  type="text"
                  name="classDescription"
                  placeholder="Enter class description"
                  value={updatedInfo?.classDescription || 'Auth Failed'}
                  onIonChange={handleChange}
                />
              </IonItem>
              {/* {errors.ClassDescription && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ClassDescription}
                            </p>
                          )} */}
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
            </div>
            <IonButton onClick={handleEdit} fill="outline" color="primary">
              Edit
            </IonButton>
          </div>
        )}

        <div className="flex flex-row justify-between mb-6">
          <IonButton onClick={() => window.history.back()} fill="outline">
            <IonIcon slot="start" icon={arrowBackOutline} />
            Back
          </IonButton>
          {/* TODO: should only show for teachers */}
          {isTeacher && (
            <IonIcon
              icon={createOutline}
              size="large"
              color="primary"
              className="hover:transform hover:scale-110 cursor-pointer"
            ></IonIcon>
          )}
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
        </IonSegment>

        {tab === 'leaderboard' && <Leaderboard leaderboard={leaderboard} />}

        <FlashcardCarousel
          flashcardSets={flashcardSets}
          currentCardIndex={currentCardIndex}
          setApi={setCarouselApi}
        />
      </div>
    </IonContent>
  );
};

export default ClassDetail;
