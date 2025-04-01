import { type CarouselApi } from '@/components/ui/carousel';
import {
    IonContent,
    IonIcon,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    createOutline,
    trophyOutline,
    bookOutline,
    arrowBackOutline,
} from 'ionicons/icons';
import Leaderboard from '@/components/ui/Leaderboard';
import FlashcardCarousel from '@/components/flashcards/FlashcardCarousel';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { api } from '@/utils/api';

type User = {
    role: string;
};

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

const ClassDetail = () => {
    const { id } = useParams();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [tab, setTab] = useState('flashcards');
    const [isTeacher, setIsTeacher] = useState(false);
    const [classData, setClassData] = useState<Class>();
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

    useEffect(() => {
        async function fetchClass() {
            const data = await api.get<Class>(
                `https://cowboy-cards.dsouth.org/api/classes/`,
                {
                    headers: {
                        id: id,
                    },
                }
            );
            console.log('data', data);
            setClassData(data);
        }

        async function fetchFlashcardSets() {
            const sets = await api.get<FlashcardSet[]>(
                `https://cowboy-cards.dsouth.org/api/flashcards/sets/list`
            );
            console.log('sets', sets);
            setFlashcardSets(sets);
        }

        fetchClass();
        fetchFlashcardSets();
    }, []);

    // TODO: get the user role from the backend, this code is currently not functional
    // need a way to get the user role from the backend, maybe through auth, RLS, or a query
    // useEffect(() => {
    //   async function fetchUser() {
    //     const user = await api.get<User>(
    //       'https://cowboy-cards.dsouth.org/api/class_user/',
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {classData?.ClassName || 'Loading...'}
                    </h1>
                    <p className="text-gray-600">
                        {classData?.ClassDescription || 'Loading...'}
                    </p>
                </div>

                <div className="flex flex-row justify-between mb-6">
                    <IonButton
                        onClick={() => window.history.back()}
                        fill="outline"
                    >
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
                    <Leaderboard leaderboard={leaderboard} />
                )}

                <FlashcardCarousel
                    flashcardSets={flashcardSets}
                    currentCardIndex={currentCardIndex}
                    setApi={setCarouselApi}
                />
            </div>
            <Footer />
        </IonContent>
    );
};

export default ClassDetail;
