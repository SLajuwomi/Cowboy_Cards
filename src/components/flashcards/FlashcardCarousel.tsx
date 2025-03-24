import React, { useEffect, useState } from 'react';
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
import { api } from '@/utils/api';

type Flashcards = {
    ID: number;
    Front: string;
    Back: string;
    SetID: number;
    CreatedAt: string;
    UpdatedAt: string;
};

const FlashcardCarousel = (props) => {
    const [flashcards, setFlashcards] = useState<Flashcards[]>([]);
    const [selectedSet, setSelectedSet] = useState<number | null>(null);

    useEffect(() => {
        async function fetchFlashcards() {
            console.log('selectedSet', selectedSet);
            const cards = await api.get<Flashcards[]>(
                ` https://cowboy-cards.dsouth.org/api/flashcards/list`,
                {
                    headers: {
                        set_id: selectedSet,
                    },
                }
            );
            console.log('cards', cards);
            setFlashcards(cards);
        }
        if (selectedSet) {
            fetchFlashcards();
        }
    }, [selectedSet]);

    return (
        <div className="mt-6">
            {selectedSet === null ? (
                <IonGrid>
                    <IonRow>
                        {props.flashcardSets.map((set) => (
                            <IonCol
                                size="12"
                                sizeMd="6"
                                sizeLg="4"
                                key={set.ID}
                            >
                                <IonCard
                                    className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-lg border shadow-sm"
                                    onClick={() => setSelectedSet(set.ID)}
                                >
                                    <IonCardHeader>
                                        <IonCardTitle className="text-lg font-semibold">
                                            {set.SetName}
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <p className="text-muted-foreground mb-2">
                                            {set.SetDescription}
                                        </p>
                                        {/* <p className="text-muted-foreground">
                                            {set.cards.length} cards
                                        </p> */}
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
                            setApi={props.setApi}
                        >
                            <CarouselContent className="-mt-1 h-[400px]">
                                {flashcards.map((card) => (
                                    <CarouselItem key={card.ID}>
                                        <FlashCard
                                            front={card.Front}
                                            back={card.Back}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>

                        <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                            {flashcards.map((_, index) => (
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
