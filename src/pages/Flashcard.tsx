import { FlashCard } from '@/components/flashcards/FlashCard';
import { Navbar } from '@/components/navbar';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCurrentCardIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();

    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  const handleAdvance = () => {
    if (carouselApi) {
      carouselApi.scrollNext();
    }
  };

  return (
    <IonContent className='ion-padding'>
      <Navbar />

      <div id='main-content' className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Flashcards */}
        <div className='flex items-center gap-4 mb-6'>
          <IonButton
            className='rounded-lg'
            fill='outline'
            style={{ '--border-radius': '0.5rem' }}
            routerLink={`/set-overview/${id}`}
          >
            Back
          </IonButton>
          <div>
            <h1 className='text-2xl font-bold'>{title}</h1>
            <p className='text-gray-500'>{description}</p>
          </div>
        </div>

        <div className='w-full max-w-xl mx-auto relative py-8'>
          {cards.length === 0 ? (
            <div className='text-center text-gray-500 text-lg py-20'>
              This set has no cards yet.
            </div>
          ) : (
            <>
              <Carousel
                orientation='vertical'
                setApi={setCarouselApi}
                className='w-full'
              >
                <CarouselContent className='-mt-1 h-[400px]'>
                  {cards.map((card, index) => (
                    <CarouselItem key={index}>
                      <FlashCard
                        front={card.front}
                        back={card.back}
                        onAdvance={handleAdvance}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className='absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-2'>
                {cards.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCardIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </IonContent>
  );
};

export default Flashcard;
