import { Navbar } from '@/components/Navbar';
import type { Flashcard, FlashcardSet } from '@/types/globalTypes';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

const SetOverview = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [flashcardSetData, setFlashcardSetData] = useState<FlashcardSet>();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    //TODO: only the owner can see the set details
    const fetchSetDetails = async () => {
      try {
        const setDetails = await makeHttpCall<FlashcardSet>(
          `/api/flashcards/sets/`,
          {
            method: 'GET',
            headers: { id: id },
          }
        );
        setFlashcardSetData(setDetails);
      } catch (error) {
        console.error('Failed to fetch set info', error);
      }
    };

    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        const res = await makeHttpCall<Flashcard[]>(`/api/flashcards/list`, {
          method: 'GET',
          headers: { set_id: id },
        });
        setCards(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Failed to fetch cards', error);
        setCards([]);
      } finally {
        setLoadingCards(false);
      }
    };

    if (id) {
      fetchSetDetails();
      fetchCards();
    }
  }, [id]);

  const handleDeleteSet = async () => {
    if (!id) {
      console.error('Cannot delete set: ID is missing.');
      return;
    }
    try {
      await makeHttpCall<void>(`/api/flashcards/sets/`, {
        method: 'DELETE',
        headers: {
          id: id,
        },
      });

      history.push('/student-dashboard');
    } catch (error) {
      console.error('Failed to delete set:', error);
    }
  };

  return (
    <IonContent className="ion-padding">
      <Navbar />
      <div id="main-content" className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1 pr-4">
            <IonButton
              className="rounded-lg"
              fill="outline"
              style={{ '--border-radius': '0.5rem' }}
              onClick={() => window.history.back()}
            >
              <IonIcon slot="start" icon={arrowBackOutline} />
              Back
            </IonButton>

            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">{flashcardSetData.SetName}</h1>
              <p className="text-base mt-1 text-gray-700">
                {flashcardSetData.SetDescription}
              </p>
            </div>
          </div>

          <div className="self-start md:self-center flex gap-2 md:mt-0 mt-4 w-full md:w-auto">
            <IonButton
              className="rounded-lg w-1/3 md:w-auto"
              fill="outline"
              style={{ '--border-radius': '0.5rem' }}
              routerLink={`/edit-set/${id}`}
            >
              Edit Set
            </IonButton>

            <IonButton
              className="rounded-lg w-1/3 md:w-auto"
              color={'primary'}
              style={{ '--border-radius': '0.5rem' }}
              routerLink={`/flashcards/${id}`}
            >
              Study Set
            </IonButton>

            <IonButton
              className="rounded-lg w-1/3 md:w-auto"
              color={'danger'}
              style={{ '--border-radius': '0.5rem' }}
              onClick={() => setShowDeleteAlert(true)}
            >
              Delete Set
            </IonButton>
          </div>
        </div>

        <div className="mt-8 min-h-[200px] flex items-center justify-center">
          {loadingCards ? (
            <IonSpinner name="circular" />
          ) : cards.length === 0 ? (
            <div className="text-center">
              <p className="text-lg text-gray-900 dark:text-gray-400 mb-4">
                This set has no cards yet.
              </p>
              <IonButton
                color="primary"
                className="rounded-lg"
                style={{ '--border-radius': '0.5rem' }}
                routerLink={`/edit-set/${id}`}
              >
                Add Cards
              </IonButton>
            </div>
          ) : (
            <div className="w-full">
              {cards.map((card, index) => (
                <IonCard
                  key={index}
                  className="mb-4 rounded-lg border shadow-sm"
                >
                  <IonCardContent>
                    <div className="border-b border-gray-300 mb-3 pb-1 m-4">
                      <IonText className="text-md font-semibold text-gray-900 dark:text-gray-300">
                        Card {index + 1}
                      </IonText>
                    </div>

                    <div className="flex flex-row justify-between items-start">
                      <div className="w-3/12 pr-4 border-r border-gray-300 m-4">
                        <IonText className="block whitespace-pre-wrap text-lg text-gray-900 dark:text-gray-200">
                          {card.Front}
                        </IonText>
                      </div>

                      <div className="w-9/12 pl-4 m-4">
                        <IonText className="block whitespace-pre-wrap text-lg text-gray-900 dark:text-gray-200">
                          {card.Back}
                        </IonText>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header={'Confirm Deletion'}
        message={
          'Are you sure you want to delete this set? This action cannot be undone.'
        }
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Delete canceled');
            },
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
              handleDeleteSet();
            },
          },
        ]}
      />
    </IonContent>
  );
};

export default SetOverview;
