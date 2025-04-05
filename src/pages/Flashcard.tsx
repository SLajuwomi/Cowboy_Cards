import { FlashCard } from '@/components/flashcards/FlashCard';
import { Navbar } from '@/components/navbar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { IonButton, IonContent } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Flashcard = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);

  useEffect(() => {
    const fetchSetDetails = async () => {
      try {
        const setRes = await fetch(`${API_BASE}/api/flashcards/sets/`, {
          method: 'GET',
          headers: { id },
        });
        const setData = await setRes.json();
        setTitle(setData.SetName);
        setDescription(setData.SetDescription);
      } catch (error) {
        console.error('Failed to fetch set info', error);
      }
    };

    const fetchCards = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/flashcards/list`, {
          method: 'GET',
          headers: { set_id: id },
        });
        const data = await res.json();
        setCards(
          Array.isArray(data)
            ? data.map((card: any) => ({
                front: card.Front,
                back: card.Back,
              }))
            : []
        );
      } catch (error) {
        console.error('Failed to fetch cards', error);
      }
    };

    if (id) {
      fetchSetDetails();
      fetchCards();
    }
  }, [id]);

  return (
    <IonContent className="ion-padding">
      <Navbar />

      <div id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Flashcards */}
        <div className="flex items-center gap-4 mb-6">
          <IonButton
            className="rounded-lg"
            fill="outline"
            style={{ '--border-radius': '0.5rem' }}
            routerLink={`/set-overview/${id}`}
          >
            Back
          </IonButton>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-500">{description}</p>
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto relative py-8">
          {cards.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-20">
              This set has no cards yet.
            </div>
          ) : (
            <Carousel orientation="vertical">
              <CarouselContent className="-mt-1 h-[400px]">
                {cards.map((card, index) => (
                  <CarouselItem key={index}>
                    <FlashCard front={card.front} back={card.back} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Optional: vertical prev/next buttons */}
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>
      </div>
    </IonContent>
  );
};

export default Flashcard;
