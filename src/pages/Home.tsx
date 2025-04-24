import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/react';
import { addOutline, bookOutline, listOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Class = {
  ClassID: number;
  Role: string;
  ClassName: string;
  ClassDescription: string;
};

type Set = {
  SetID: number;
  SetName: string;
  SetDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
};

const Home = () => {
  const [tab, setTab] = useState('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [setsLoading, setSetsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Classes state updated:', classes);
  }, [classes]);

  useEffect(() => {
    const fetchClassesOfUser = async () => {
      setClassesLoading(true);
      setError(null);
      try {
        const data = await makeHttpCall<Class[]>(`/api/class_user/classes`);
        console.log('Classes: ', data);
        setClasses(data);
      } catch (error) {
        setError(`Error fetching classes: ${error.message}`);
      } finally {
        setClassesLoading(false);
      }
    };

    const fetchSetsOfUser = async () => {
      setSetsLoading(true);
      try {
        const data = await makeHttpCall<Set[]>(`/api/set_user/list`);
        console.log('Sets: ', data);
        setSets(data);
      } catch (error) {
        setError(`Error fetching sets: ${error.message}`);
      } finally {
        setSetsLoading(false);
      }
    };

    fetchClassesOfUser();
    fetchSetsOfUser();
  }, []);

  return (
    <>
      <IonContent className="ion-padding flex flex-col min-h-screen" fullscreen>
        <Navbar />
        <div
          id="main-content"
          className="container mx-auto px-4 py-8 flex-grow"
        >
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <h1 className="text-3xl font-bold">
              {tab === 'classes' ? 'My Classes' : 'Personal Flashcard Sets'}
            </h1>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <IonButton
                color="primary"
                className="rounded-lg"
                style={{ '--border-radius': '0.5rem' }}
                href={tab === 'classes' ? '/public-classes' : '/public-cards'}
              >
                <IonIcon slot="start" icon={addOutline} />{' '}
                {tab === 'classes' ? 'Join Class' : 'Join Set'}
              </IonButton>
            </div>
          </div>

          <div className="mb-8">
            <IonSegment
              value={tab}
              onIonChange={(e) =>
                setTab((e.detail.value as string) || 'classes')
              }
              style={{
                '--background': 'var(--ion-color-light)',
              }}
            >
              <IonSegmentButton value="classes">
                <IonIcon icon={listOutline} className="mr-2" />
                <IonLabel>My Classes</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="flashcards">
                <IonIcon icon={bookOutline} className="mr-2" />
                <IonLabel>My Cards</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {tab === 'classes' && (
            <>
              {classesLoading ? (
                <div className="flex justify-center items-center p-8">
                  <IonSpinner name="circular" />
                  <span className="ml-2">Loading classes...</span>
                </div>
              ) : classes === null ? (
                <div className="text-center p-8 text-gray-600">
                  You are not part of any classes. Join a class to get started.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((cls) => (
                    <Link key={cls.ClassID} to={`/class/${cls.ClassID}`}>
                      <IonCard className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform-shadow duration-200 rounded-lg border shadow-sm">
                        <IonCardHeader className="flex flex-col space-y-1.5 p-6">
                          <IonCardTitle className="text-2xl font-semibold leading-none tracking-tight">
                            {cls.ClassName}
                          </IonCardTitle>
                          <IonCardSubtitle className="text-sm text-muted-foreground">
                            {cls.ClassDescription}
                          </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {/* <IonText className="text-sm text-gray-600">
                          {cls.sets} sets
                        </IonText> */}
                        </IonCardContent>
                      </IonCard>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'flashcards' && (
            <>
              {setsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <IonSpinner name="circular" />
                  <span className="ml-2">Loading sets...</span>
                </div>
              ) : sets === null ? (
                <div className="text-center p-8 text-gray-600">
                  You are not part of any sets. Join a set to get started.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sets.map((set) => (
                    <Link key={set.SetID} to={`/set-overview/${set.SetID}`}>
                      <IonCard className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform-shadow duration-200 rounded-lg border shadow-sm">
                        <IonCardHeader className="flex flex-col space-y-1.5 p-6">
                          <IonCardTitle className="text-2xl font-semibold leading-none tracking-tight">
                            {set.SetName}
                          </IonCardTitle>
                          <IonCardSubtitle className="text-sm text-muted-foreground">
                            {set.SetDescription}
                          </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {/* <IonText className="text-sm text-gray-600">
                          {set.cards} cards
                        </IonText> */}
                        </IonCardContent>
                      </IonCard>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </IonContent>
    </>
  );
};

export default Home;
