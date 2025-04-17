import React from 'react';
import FlashcardSetList from '@/components/FlashcardSetList';
import { type CarouselApi } from '@/components/ui/carousel';

// TODO: Move this type to a shared types file (e.g., src/types/index.ts)
//       to avoid duplication and maintain consistency across the application.
type FlashcardSet = {
  ID: number;
  SetName: string;
  SetDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
};

interface FlashcardTabProps {
  flashcardSets: FlashcardSet[];
  currentCardIndex: number;
  setApi: (api: CarouselApi | undefined) => void;
  loading: boolean;
}

const FlashcardTab: React.FC<FlashcardTabProps> = ({
  flashcardSets,
  currentCardIndex,
  setApi,
  loading,
}) => {
  return (
    <FlashcardSetList
      flashcardSets={flashcardSets}
      currentCardIndex={currentCardIndex}
      setApi={setApi}
      loading={loading}
    />
  );
};

export default FlashcardTab;
