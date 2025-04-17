import React from 'react';
import { Flashcard } from '@/types/globalTypes';
import {
  IonCard,
  IonCardContent,
  IonTextarea,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { addOutline, trashOutline } from 'ionicons/icons';

interface FlashcardListEditorProps {
  cards: Flashcard[];
  onAddCard: () => void;
  onRemoveCard: (index: number) => void;
  onUpdateCard: (
    index: number,
    field: 'Front' | 'Back',
    value: string | null | undefined
  ) => void;
}

const FlashcardListEditor: React.FC<FlashcardListEditorProps> = ({
  cards,
  onAddCard,
  onRemoveCard,
  onUpdateCard,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Edit Cards</h2>
      {cards.map((card, index) => (
        <IonCard key={card.ID} className="mb-4 rounded-lg border shadow-sm">
          <IonCardContent>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-gray-600">
                Card {index + 1} {card.ID > 0 ? '(Existing)' : '(New)'}
              </span>
              <IonButton
                fill="clear"
                color="danger"
                size="small"
                onClick={() => onRemoveCard(index)}
                className="-mt-2 -mr-2"
              >
                <IonIcon slot="icon-only" icon={trashOutline} />
              </IonButton>
            </div>
            <IonTextarea
              label={`Front (Card ${index + 1})`}
              labelPlacement="stacked"
              placeholder="Front of card"
              value={card.Front}
              onIonChange={(e) => onUpdateCard(index, 'Front', e.detail.value)}
              rows={2}
              autoGrow
              className="mb-3"
              style={{ resize: 'none' }}
            />
            <IonTextarea
              label={`Back (Card ${index + 1})`}
              labelPlacement="stacked"
              placeholder="Back of card"
              value={card.Back}
              onIonChange={(e) => onUpdateCard(index, 'Back', e.detail.value)}
              rows={2}
              autoGrow
              style={{ resize: 'none' }}
            />
          </IonCardContent>
        </IonCard>
      ))}

      <div className="flex justify-center mt-4 mb-6">
        <IonButton onClick={onAddCard} fill="outline">
          <IonIcon slot="start" icon={addOutline} /> Add Card
        </IonButton>
      </div>
    </>
  );
};

export default FlashcardListEditor;
