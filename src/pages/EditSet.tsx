//TODO: Add a back button to the page
//TODO: fix redirecting from this page. It's not working.

import FlashcardListEditor from '@/components/FlashcardListEditor';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import SetMetadataEditor from '@/components/SetMetadataEditor';
import { Flashcard, FlashcardSet } from '@/types/globalTypes';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonButton,
  IonContent,
  IonLoading,
  IonPage,
  IonText,
  useIonToast,
} from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const EditSet = () => {
  const { id } = useParams<{ id: string }>();
  const [presentToast] = useIonToast();

  const [originalSetDetails, setOriginalSetDetails] =
    useState<FlashcardSet | null>(null);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [editedSetName, setEditedSetName] = useState<string>('');
  const [editedSetDescription, setEditedSetDescription] = useState<string>('');
  const [cards, setCards] = useState<Flashcard[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Set ID is missing from URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSaveError(null);
    try {
      const [fetchedSetDetails, fetchedCards] = await Promise.all([
        makeHttpCall<FlashcardSet>(`/api/flashcards/sets/`, {
          method: 'GET',
          headers: { id: id },
        }),
        makeHttpCall<Flashcard[]>(`/api/flashcards/list`, {
          method: 'GET',
          headers: { set_id: id },
        }),
      ]);
      setOriginalSetDetails(fetchedSetDetails);
      setOriginalCards(fetchedCards);
      setEditedSetName(fetchedSetDetails.SetName);
      setEditedSetDescription(fetchedSetDetails.SetDescription);

      if (fetchedCards) {
        setCards(fetchedCards.map((card) => ({ ...card, ID: card.ID || 0 })));
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error('Error fetching data for EditSet:', err);
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      setError(`Failed to load set data: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetDetailChange = (
    field: 'SetName' | 'SetDescription',
    value: string | null | undefined
  ) => {
    const newValue = value ?? '';
    if (field === 'SetName') {
      setEditedSetName(newValue);
    } else {
      setEditedSetDescription(newValue);
    }
  };

  const addCard = () => {
    if (!originalSetDetails) return;
    const newCard: Flashcard = {
      ID: 0, // Use 0 to indicate a new card, backend assigns real ID
      Front: '',
      Back: '',
      SetID: originalSetDetails.ID,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };
    setCards([...cards, newCard]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (
    index: number,
    field: 'Front' | 'Back',
    value: string | null | undefined
  ) => {
    const newValue = value ?? '';
    setCards(
      cards.map((card, i) =>
        i === index ? { ...card, [field]: newValue } : card
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!originalSetDetails || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    const apiPromises: Promise<any>[] = [];

    if (editedSetName !== originalSetDetails.SetName) {
      apiPromises.push(
        makeHttpCall(`/api/flashcards/sets/set_name`, {
          method: 'PUT',
          headers: { id: originalSetDetails.ID, set_name: editedSetName },
        })
      );
    }
    if (editedSetDescription !== originalSetDetails.SetDescription) {
      apiPromises.push(
        makeHttpCall(`/api/flashcards/sets/set_description`, {
          method: 'PUT',
          headers: {
            id: originalSetDetails.ID,
            set_description: editedSetDescription,
          },
        })
      );
    }

    const currentCardIds = new Set(
      cards.map((card) => card.ID).filter((id) => id > 0)
    );
    if (originalCards) {
      originalCards.forEach((originalCard) => {
        if (!currentCardIds.has(originalCard.ID)) {
          apiPromises.push(
            makeHttpCall(`/api/flashcards`, {
              method: 'DELETE',
              headers: { id: originalCard.ID },
            })
          );
        }
      });
    }

    cards.forEach((card) => {
      if (card.ID <= 0) {
        apiPromises.push(
          makeHttpCall<Flashcard>(`/api/flashcards`, {
            method: 'POST',
            headers: {
              front: card.Front,
              back: card.Back,
              id: originalSetDetails.ID,
            },
          })
        );
      } else {
        const originalCard = originalCards.find((oc) => oc.ID === card.ID);
        if (originalCard) {
          if (card.Front !== originalCard.Front) {
            apiPromises.push(
              makeHttpCall(`/api/flashcards/front`, {
                method: 'PUT',
                headers: { id: card.ID, front: card.Front },
              })
            );
          }

          if (card.Back !== originalCard.Back) {
            apiPromises.push(
              makeHttpCall(`/api/flashcards/back`, {
                method: 'PUT',
                headers: { id: card.ID, back: card.Back },
              })
            );
          }
        }
      }
    });

    try {
      await Promise.all(apiPromises);
      presentToast({
        message: 'Changes saved successfully!',
        duration: 2000,
        color: 'success',
      });
      await fetchData();
    } catch (err) {
      console.error('Error saving changes:', err);
      let message = 'Unknown error during save';
      if (err instanceof Error) message = err.message;
      setSaveError(`Failed to save changes: ${message}`);
      presentToast({
        message: `Save failed: ${message}`,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>
      <Navbar />
      <IonContent className="ion-padding">
        <div
          id="main-content"
          className="container mx-auto px-4 py-8 max-w-4xl"
        >
          <h1 className="text-3xl font-bold mb-6">Edit Flashcard Set</h1>

          <IonLoading isOpen={loading} message={'Loading set data...'} />
          <IonLoading isOpen={isSaving} message={'Saving changes...'} />

          {error && !loading && (
            <IonText color="danger" className="block mb-4">
              <p>Error loading data: {error}</p>
            </IonText>
          )}
          {saveError && !isSaving && (
            <IonText color="danger" className="block mb-4">
              <p>Error saving: {saveError}</p>
            </IonText>
          )}

          {!loading && !error && originalSetDetails && (
            <>
              <SetMetadataEditor
                setName={editedSetName}
                setDescription={editedSetDescription}
                onNameChange={(value) =>
                  handleSetDetailChange('SetName', value)
                }
                onDescriptionChange={(value) =>
                  handleSetDetailChange('SetDescription', value)
                }
              />

              <FlashcardListEditor
                cards={cards}
                onAddCard={addCard}
                onRemoveCard={removeCard}
                onUpdateCard={updateCard}
              />

              <div className="flex justify-end">
                <IonButton
                  onClick={handleSaveChanges}
                  color="primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </IonButton>
              </div>
            </>
          )}
        </div>
      </IonContent>
      <Footer />
    </IonPage>
  );
};

export default EditSet;
