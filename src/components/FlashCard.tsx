import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { makeHttpCall } from '@/utils/makeHttpCall';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

export const FlashCard = (props) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleScoreUpdate = async (endpoint: string) => {
    try {
      const result = await makeHttpCall(`${endpoint}`, {
        method: 'POST',
        headers: {
          card_id: props.cardId.toString(),
        },
      });
      console.log(`Score update successful for card ${props.cardId}:`, result);
      props.onAdvance?.();
    } catch (error) {
      console.error(`Failed to update score for card ${props.cardId}:`, error);
    }
  };

  const handleLearningClick = () => {
    handleScoreUpdate('/api/card_history/incorrect');
  };

  const handleMasteredClick = () => {
    handleScoreUpdate('/api/card_history/correct');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`flip-card cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card className="flip-card-front p-8 min-h-[300px] flex items-center justify-center text-center">
          <p className="text-xl">{props.front}</p>
        </Card>
        <Card className="flip-card-back p-8 min-h-[300px] flex items-center justify-center text-center absolute top-0 w-full">
          <p className="text-xl">{props.back}</p>
        </Card>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          className="w-32"
          onClick={handleLearningClick}
        >
          <X className="mr-2 h-4 w-4" />
          Learning
        </Button>
        <Button className="w-32" onClick={handleMasteredClick}>
          <Check className="mr-2 h-4 w-4" />
          Mastered
        </Button>
      </div>
    </div>
  );
};
