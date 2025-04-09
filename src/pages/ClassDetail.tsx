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
  IonSpinner,
} from '@ionic/react';
import {
  arrowBackOutline,
  bookOutline,
  createOutline,
  trophyOutline,
} from 'ionicons/icons';
import { Footer } from '@/components/footer';
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [tab, setTab] = useState('flashcards');
  const [isTeacher, setIsTeacher] = useState(false);
  const [classData, setClassData] = useState<Class>();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [classUsers, setClassUsers] = useState<ClassUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<
    Array<{ name: string; totalScore: number }>
  >([]);
  const [loadingScores, setLoadingScores] = useState(false);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {loading ? 'Loading...' : classData?.ClassName}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Loading...' : classData?.ClassDescription}
          </p>
        </div>

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
          />
        )}
      </div>
      <Footer />
    </IonContent>
  );
};

export default ClassDetail;
