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
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
} from '@ionic/react';
import {
  trophy,
  book,
  people,
  chevronBack,
  chevronForward,
  createOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  const [selectedTab, setSelectedTab] = useState('leaderboard');

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
    <IonContent className="ion-padding">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
          <p className="text-gray-600">Teacher: {classData.teacher}</p>
          <p className="text-gray-600">Class ID: {id}</p>
        </div>

        <div className="flex flex-row mb-4">
          <IonButton onClick={() => window.history.back()} fill="outline">
            ← Back
          </IonButton>
          {/* Icon button to link to edit class page */}
          <IonIcon
            icon={createOutline}
            size="large"
            color="primary"
            className="ml-auto hover:cursor-pointer hover:transform hover:scale-110 hover:opacity-75"
          />
        </div>

        <IonSegment
          value={selectedTab}
          onIonChange={(e) => setSelectedTab(e.detail.value as string)}
          style={{
            '--background': 'var(--ion-color-light)',
          }}
        >
          <IonSegmentButton value="leaderboard">
            <IonIcon icon={trophy} />
            <IonLabel>Leaderboard</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="flashcards">
            <IonIcon icon={book} />
            <IonLabel>Flashcard Sets</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="students">
            <IonIcon icon={people} />
            <IonLabel>Students</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Tab Content */}
        <div className="ion-margin-top">
          {selectedTab === 'leaderboard' && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Class Leaderboard</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {classData.leaderboard.map((entry, index) => (
                    <IonItem key={index}>
                      <IonLabel>
                        <h2>
                          {index + 1}. {entry.name}
                        </h2>
                      </IonLabel>
                      <IonChip color="primary" slot="end">
                        {entry.cardsMastered} cards
                      </IonChip>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}

          {selectedTab === 'flashcards' && (
            <>
              {selectedSet === null ? (
                <IonGrid>
                  <IonRow>
                    {classData.flashcardSets.map((set) => (
                      <IonCol size="12" sizeMd="6" sizeLg="4" key={set.id}>
                        <IonCard button onClick={() => setSelectedSet(set.id)}>
                          <IonCardHeader>
                            <IonCardTitle>{set.name}</IonCardTitle>
                          </IonCardHeader>
                          <IonCardContent>
                            <p>{set.description}</p>
                            <p>{set.cards.length} cards</p>
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
                  >
                    <IonIcon slot="start" icon={chevronBack} />
                    Back to Sets
                  </IonButton>
                  <div className="flashcard-container">
                    {/* Implement custom carousel with Ionic gestures */}
                    <IonCard className="ion-margin">
                      <FlashCard
                        front={
                          classData.flashcardSets.find(
                            (set) => set.id === selectedSet
                          )?.cards[currentCardIndex].front
                        }
                        back={
                          classData.flashcardSets.find(
                            (set) => set.id === selectedSet
                          )?.cards[currentCardIndex].back
                        }
                      />
                    </IonCard>
                    <IonButton
                      fill="clear"
                      onClick={() =>
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1))
                      }
                    >
                      <IonIcon icon={chevronBack} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      onClick={() =>
                        setCurrentCardIndex((prev) =>
                          Math.min(
                            (classData.flashcardSets.find(
                              (set) => set.id === selectedSet
                            )?.cards.length || 1) - 1,
                            prev + 1
                          )
                        )
                      }
                    >
                      <IonIcon icon={chevronForward} />
                    </IonButton>
                  </div>
                </>
              )}
            </>
          )}

          {selectedTab === 'students' && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Class Students</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {classData.students.map((student) => (
                    <IonItem key={student.id}>
                      <IonLabel>
                        <h2>{student.name}</h2>
                        <p>{student.email}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </div>
    </IonContent>
  );
};

export default ClassDetail;
