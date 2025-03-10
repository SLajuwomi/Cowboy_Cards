import React from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
} from '@ionic/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { arrowBackOutline } from 'ionicons/icons';
import { FlashCard } from './FlashCard';

const FlashcardCarousel = (props) => {
  return (
    <div className="mt-6">
      {props.selectedSet === null ? (
        <IonGrid>
          <IonRow>
            {props.classData.flashcardSets.map((set) => (
              <IonCol size="12" sizeMd="6" sizeLg="4" key={set.id}>
                <IonCard
                  className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-lg border shadow-sm"
                  onClick={() => props.setSelectedSet(set.id)}
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
            onClick={() => props.setSelectedSet(null)}
            className="mb-6"
          >
            <IonIcon slot="start" icon={arrowBackOutline} />
            Back to Sets
          </IonButton>
          <div className="w-full max-w-2xl mx-auto relative">
            <Carousel
              orientation="vertical"
              className="w-full"
              setApi={props.setApi}
            >
              <CarouselContent className="-mt-1 h-[400px]">
                {props.classData.flashcardSets
                  .find((set) => set.id === props.selectedSet)
                  ?.cards.map((card) => (
                    <CarouselItem key={card.id}>
                      <FlashCard front={card.front} back={card.back} />
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
              {props.classData.flashcardSets
                .find((set) => set.id === props.selectedSet)
                ?.cards.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === props.currentCardIndex
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
  );
};

export default FlashcardCarousel;
