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
  peopleOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import Leaderboard from '@/components/ui/Leaderboard';
import FlashcardCarousel from '@/components/flashcards/FlashcardCarousel';
import StudentList from '@/components/ui/StudentList';
import { Navbar } from '@/components/navbar';

const ClassDetail = () => {
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
    <IonContent className="ion-padding">
      <Navbar />

      <div id="main-content" className="container mx-auto px-4 py-8">
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
          <Leaderboard leaderboard={classData.leaderboard} />
        )}

        {tab === 'flashcards' && (
          <FlashcardCarousel
            classData={classData}
            selectedSet={selectedSet}
            setSelectedSet={setSelectedSet}
            currentCardIndex={currentCardIndex}
          />
        )}

        {tab === 'students' && <StudentList students={classData.students} />}
      </div>
    </IonContent>
  );
};

export default ClassDetail;
