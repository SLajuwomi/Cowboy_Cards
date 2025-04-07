import FlashcardCarousel from '@/components/flashcards/FlashcardCarousel';
import { Navbar } from '@/components/navbar';
import { type CarouselApi } from '@/components/ui/carousel';
import Leaderboard from '@/components/ui/Leaderboard';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonButton,
  IonContent,
  IonIcon,
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

type ClassUser = {
  UserID: number;
  ClassID: number;
  Role: string;
  FirstName: string;
  LastName: string;
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
  const [classUsers, setClassUsers] = useState<ClassUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        `${API_BASE}/api/class_set/get_sets`,
        {
          method: 'GET',
          headers: {
            class_id: id,
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

  const leaderboard = classUsers.map((user) => ({
    name: `${user.FirstName} ${user.LastName}`,
    cardsMastered: 0,
  }));

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setCurrentCardIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  return (
    <IonContent className='ion-padding'>
      <Navbar />

      <div id='main-content' className='container mx-auto px-4 py-8'>
        {error && <div className='text-red-500 mt-2'>{error}</div>}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>
            {loading ? 'Loading...' : classData?.ClassName}
          </h1>
          <p className='text-gray-600'>
            {loading ? 'Loading...' : classData?.ClassDescription}
          </p>
        </div>

        <div className='flex flex-row justify-between mb-6'>
          <IonButton onClick={() => window.history.back()} fill='outline'>
            <IonIcon slot='start' icon={arrowBackOutline} />
            Back
          </IonButton>
          {/* TODO: should only show for teachers */}
          {isTeacher && (
            <IonIcon
              icon={createOutline}
              size='large'
              color='primary'
              className='hover:transform hover:scale-110 cursor-pointer'
            ></IonIcon>
          )}
        </div>

        <IonSegment
          value={tab}
          onIonChange={(e) => setTab(e.detail.value as string)}
          className='w-full mb-6'
        >
          <IonSegmentButton value='flashcards'>
            <IonIcon icon={bookOutline} className='mr-2' />
            <IonLabel>Flashcard Sets</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value='leaderboard'>
            <IonIcon icon={trophyOutline} className='mr-2' />
            <IonLabel>Leaderboard</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {tab === 'leaderboard' && (
          <Leaderboard leaderboard={leaderboard} classUsers={classUsers} />
        )}

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
