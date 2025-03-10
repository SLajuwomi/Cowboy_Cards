import { FlashCard } from '@/components/flashcards/FlashCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createOutline,
  trophyOutline,
  bookOutline,
  peopleOutline,
  arrowBackOutline,
} from 'ionicons/icons';

/**
 * ClassDetail Component
 *
 * This component displays detailed information about a specific class.
 * It allows teachers to:
 * - View class information and leaderboard
 * - Manage flashcard sets
 * - Add new students to the class
 * - Add new flashcard sets to the class
 *
 * The component uses the class ID from the URL to load the correct class data.
 */
const ClassDetail = () => {
  // Get the class ID from the URL parameters
  const { id } = useParams();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [tab, setTab] = useState('leaderboard');

  // Mock data - in a real app this would come from an API based on the class ID
  const classData = {
    id: id,
    name: 'Biology 101',
    teacher: 'Dr. Smith',
    students: [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com' },
      { id: 4, name: 'Alice Williams', email: 'alice.williams@example.com' },
      { id: 5, name: 'Charlie Brown', email: 'charlie.brown@example.com' },
    ],
    leaderboard: [
      { name: 'John Doe', cardsMastered: 95 },
      { name: 'Jane Smith', cardsMastered: 90 },
      { name: 'Bob Johnson', cardsMastered: 85 },
      { name: 'Alice Williams', cardsMastered: 82 },
      { name: 'Charlie Brown', cardsMastered: 80 },
    ],
    flashcardSets: [
      {
        id: 1,
        name: 'Cell Biology',
        description: 'Basic concepts of cell biology',
        cards: [
          {
            id: 1,
            front: 'What is a cell?',
            back: 'The basic structural unit of all living organisms',
          },
          {
            id: 2,
            front: 'What is a nucleus?',
            back: 'The control center of the cell containing genetic material',
          },
          {
            id: 3,
            front: 'What is mitochondria?',
            back: 'The powerhouse of the cell',
          },
        ],
      },
      {
        id: 2,
        name: 'Plant Biology',
        description: 'Introduction to plant biology concepts',
        cards: [
          {
            id: 1,
            front: 'What is photosynthesis?',
            back: 'The process by which plants convert light energy into chemical energy',
          },
          {
            id: 2,
            front: 'What are chloroplasts?',
            back: 'Organelles where photosynthesis occurs',
          },
        ],
      },
    ],
  };

  // Update current card index when the carousel changes
  // TODO: get the current card index from the backend
  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setCurrentCardIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <IonContent>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
          <p className="text-gray-600">Teacher: {classData.teacher}</p>
          <p className="text-gray-600">Class ID: {id}</p>
        </div>

        <div className="flex flex-row justify-between mb-6">
          <IonButton onClick={() => window.history.back()} fill="outline">
            <IonIcon slot="start" icon={arrowBackOutline} />
            Back
          </IonButton>
          <IonIcon
            icon={createOutline}
            size="large"
            color="primary"
            className="hover:transform hover:scale-110 cursor-pointer"
          ></IonIcon>
        </div>

        <IonSegment
          value={tab}
          onIonChange={(e) => setTab(e.detail.value as string)}
          className="w-full mb-6"
        >
          <IonSegmentButton value="leaderboard">
            <IonIcon icon={trophyOutline} className="mr-2" />
            <IonLabel>Leaderboard</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="flashcards">
            <IonIcon icon={bookOutline} className="mr-2" />
            <IonLabel>Flashcard Sets</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="students">
            <IonIcon icon={peopleOutline} className="mr-2" />
            <IonLabel>Students</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {tab === 'leaderboard' && (
          <IonCard className="rounded-lg border shadow-sm">
            <IonCardHeader>
              <IonCardTitle className="text-xl font-semibold">
                Class Leaderboard
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList className="space-y-3" lines="none">
                {classData.leaderboard.map((entry, index) => (
                  <IonItem key={index} className="muted-item p-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg">{index + 1}</span>
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <span slot="end" className="text-primary font-semibold">
                      {entry.cardsMastered} cards
                    </span>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {tab === 'flashcards' && (
          <div className="mt-6">
            {selectedSet === null ? (
              <IonGrid>
                <IonRow>
                  {classData.flashcardSets.map((set) => (
                    <IonCol size="12" sizeMd="6" sizeLg="4" key={set.id}>
                      <IonCard
                        className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-lg border shadow-sm"
                        onClick={() => setSelectedSet(set.id)}
                      >
                        <IonCardHeader>
                          <IonCardTitle className="text-lg font-semibold">
                            {set.name}
                          </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <p className="text-muted-foreground mb-2">
                            {set.description}
                          </p>
                          <p className="text-muted-foreground">
                            {set.cards.length} cards
                          </p>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            ) : (
              <>
                <IonButton
                  fill="outline"
                  onClick={() => setSelectedSet(null)}
                  className="mb-6"
                >
                  <IonIcon slot="start" icon={arrowBackOutline} />
                  Back to Sets
                </IonButton>
                <div className="w-full max-w-2xl mx-auto relative">
                  <Carousel
                    orientation="vertical"
                    className="w-full"
                    setApi={setApi}
                  >
                    <CarouselContent className="-mt-1 h-[400px]">
                      {classData.flashcardSets
                        .find((set) => set.id === selectedSet)
                        ?.cards.map((card) => (
                          <CarouselItem key={card.id}>
                            <FlashCard front={card.front} back={card.back} />
                          </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                  {/* Pagination dots */}
                  <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                    {classData.flashcardSets
                      .find((set) => set.id === selectedSet)
                      ?.cards.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentCardIndex
                              ? 'bg-primary'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'students' && (
          <IonCard className="mt-6">
            <IonCardHeader>
              <IonCardTitle className="text-xl font-semibold">
                Class Students
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList className="space-y-3" lines="none">
                {classData.students.map((student) => (
                  <IonItem key={student.id} className="muted-item p-3">
                    <span className="font-medium">{student.name}</span>
                    <span slot="end" className="text-muted-foreground">
                      {student.email}
                    </span>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </div>
    </IonContent>
  );
};

export default ClassDetail;
