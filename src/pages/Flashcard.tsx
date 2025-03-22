import { IonContent, IonIcon } from "@ionic/react";
import FlashcardCarousel from "@/components/flashcards/FlashcardCarousel";
import { Navbar } from "@/components/navbar";
import { construct } from "ionicons/icons"; // Importing the wrench (construct) icon

const Flashcard = () => {
  const selectedSet = {
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
  };

  return (
    <IonContent className="ion-padding">
      <Navbar />

      <div id="main-content" className="container mx-auto px-4 py-8">
        {/* Flashcards */}
        <div id="flashcards-section" className="mt-8">
          <FlashcardCarousel
            classData={{ flashcardSets: [selectedSet] }}
            selectedSet={selectedSet.id}
            currentCardIndex={0}
            setSelectedSet={() => {}}
          />
        </div>
      </div>

      {/* Floating Edit Button (Bottom-Right) */}
      <div className="fixed bottom-4 right-4">
        <button className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-purple-500 text-purple-500 bg-transparent hover:bg-purple-500 hover:text-white transition-all shadow-lg">
          <IonIcon icon={construct} className="text-2xl" />
        </button>
      </div>
    </IonContent>
  );
};

export default Flashcard;
