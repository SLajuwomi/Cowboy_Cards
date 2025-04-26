import { Navbar } from '@/components/Navbar';
import SetCardList from '@/components/SetCardList';
import SetOverviewControls from '@/components/SetOverviewControls';
import SetOverviewHeader from '@/components/SetOverviewHeader';
import type { Flashcard, FlashcardSet } from '@/types/globalTypes';
import { makeHttpCall } from '@/utils/makeHttpCall';
import { IonAlert, IonContent, useIonToast } from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

const SetOverview = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [flashcardSetData, setFlashcardSetData] = useState<FlashcardSet>();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [editedCards, setEditedCards] = useState<Flashcard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    set_name: '',
    set_description: '',
  });
  const [metadataErrors, setMetadataErrors] = useState<{
    setName?: string;
    setDescription?: string;
    general?: string;
  }>({});
  const [cardErrors, setCardErrors] = useState<{
    [key: number]: { front?: string; back?: string };
  }>({});

  const fetchData = useCallback(async () => {
    setLoadingCards(true);
    try {
      const [setDetails, fetchedCardsData] = await Promise.all([
        makeHttpCall<FlashcardSet>(`/api/flashcards/sets/`, {
          method: 'GET',
          headers: { id: id },
        }),
        makeHttpCall<Flashcard[]>(`/api/flashcards/list`, {
          method: 'GET',
          headers: { set_id: id },
        }),
      ]);

      setFlashcardSetData(setDetails);
      setIsOwner(setDetails.Role === 'owner');
      const initialCards = Array.isArray(fetchedCardsData)
        ? fetchedCardsData
        : [];
      setCards(initialCards);
      setOriginalCards(initialCards);
    } catch (error) {
      console.error('Failed to fetch data', error);
      let message = 'Unknown error';
      if (error instanceof Error) message = error.message;
      presentToast({
        message: `Error loading data: ${message}`,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoadingCards(false);
    }
  }, [id, presentToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = () => {
    if (!flashcardSetData) return;
    setUpdatedInfo({
      set_name: flashcardSetData.SetName || '',
      set_description: flashcardSetData.SetDescription || '',
    });
    setOriginalCards([...cards]);
    setEditedCards(cards.map((card) => ({ ...card })));
    setIsEditing(true);
    setMetadataErrors({});
    setCardErrors({});
  };

  const handleMetadataChange = (e: CustomEvent) => {
    const { name } = e.target as HTMLInputElement;
    const value = e.detail.value ?? '';
    setUpdatedInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardChange = (
    index: number,
    field: 'Front' | 'Back',
    value: string | null | undefined
  ) => {
    const newValue = value ?? '';
    setEditedCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index ? { ...card, [field]: newValue } : card
      )
    );
  };

  const handleAddCard = () => {
    if (!flashcardSetData) return;
    const newCard: Flashcard = {
      ID: 0 - editedCards.filter((c) => c.ID <= 0).length - 1,
      Front: '',
      Back: '',
      SetID: flashcardSetData.ID,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };
    setEditedCards((prevCards) => [...prevCards, newCard]);
  };

  const handleRemoveCard = (index: number) => {
    setEditedCards((prevCards) => prevCards.filter((_, i) => i !== index));
  };

  const validateMetadata = () => {
    const newErrors: { setName?: string; setDescription?: string } = {};
    let isValid = true;

    const trimmedName = updatedInfo.set_name.trim();
    const trimmedDescription = updatedInfo.set_description.trim();

    if (!trimmedName) {
      newErrors.setName = 'Set name is required';
      isValid = false;
    }
    if (!trimmedDescription) {
      newErrors.setDescription = 'Set description is required';
      isValid = false;
    }

    setMetadataErrors(newErrors);
    setUpdatedInfo({
      set_name: trimmedName,
      set_description: trimmedDescription,
    });
    return isValid;
  };

  const validateCards = () => {
    const newCardErrors: { [key: number]: { front?: string; back?: string } } =
      {};
    let isValid = true;
    editedCards.forEach((card, index) => {
      const errors: { front?: string; back?: string } = {};
      const trimmedFront = card.Front.trim();
      const trimmedBack = card.Back.trim();

      if (!trimmedFront) {
        errors.front = 'Front cannot be empty';
        isValid = false;
      }
      if (!trimmedBack) {
        errors.back = 'Back cannot be empty';
        isValid = false;
      }
      if (Object.keys(errors).length > 0) {
        newCardErrors[index] = errors;
      }
      if (trimmedFront !== card.Front || trimmedBack !== card.Back) {
        setEditedCards((prev) =>
          prev.map((c, i) =>
            i === index ? { ...c, Front: trimmedFront, Back: trimmedBack } : c
          )
        );
      }
    });
    setCardErrors(newCardErrors);
    return isValid;
  };

  const handleSave = async () => {
    const isMetadataValid = validateMetadata();
    const areCardsValid = validateCards();

    if (!isMetadataValid || !areCardsValid || !flashcardSetData) {
      console.log('Form validation failed:', metadataErrors, cardErrors);
      presentToast({
        message: 'Please fix validation errors before saving.',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    setLoadingCards(true);
    const apiPromises: Promise<any>[] = [];

    if (updatedInfo.set_name !== (flashcardSetData.SetName || '').trim()) {
      apiPromises.push(
        makeHttpCall(`/api/flashcards/sets/set_name`, {
          method: 'PUT',
          headers: { id: id, set_name: updatedInfo.set_name }, // Send trimmed name
        })
      );
    }
    if (
      updatedInfo.set_description !==
      (flashcardSetData.SetDescription || '').trim()
    ) {
      apiPromises.push(
        makeHttpCall(`/api/flashcards/sets/set_description`, {
          method: 'PUT',
          headers: { id: id, set_description: updatedInfo.set_description }, // Send trimmed description
        })
      );
    }

    const originalCardMap = new Map(
      originalCards.map((card) => [card.ID, card])
    );
    const editedCardMap = new Map(editedCards.map((card) => [card.ID, card]));

    originalCards.forEach((originalCard) => {
      if (!editedCardMap.has(originalCard.ID) && originalCard.ID > 0) {
        apiPromises.push(
          makeHttpCall(`/api/flashcards`, {
            method: 'DELETE',
            headers: { id: originalCard.ID },
          })
        );
      }
    });

    editedCards.forEach((editedCard) => {
      if (editedCard.ID <= 0) {
        apiPromises.push(
          makeHttpCall<Flashcard>(`/api/flashcards`, {
            method: 'POST',
            headers: {
              front: editedCard.Front,
              back: editedCard.Back,
              id: flashcardSetData.ID,
            },
          })
        );
      } else {
        const originalCard = originalCardMap.get(editedCard.ID);
        if (originalCard) {
          if (editedCard.Front !== (originalCard.Front || '').trim()) {
            apiPromises.push(
              makeHttpCall(`/api/flashcards/front`, {
                method: 'PUT',
                headers: { id: editedCard.ID, front: editedCard.Front },
              })
            );
          }
          if (editedCard.Back !== (originalCard.Back || '').trim()) {
            apiPromises.push(
              makeHttpCall(`/api/flashcards/back`, {
                method: 'PUT',
                headers: { id: editedCard.ID, back: editedCard.Back },
              })
            );
          }
        }
      }
    });

    try {
      await Promise.all(apiPromises);
      presentToast({
        message: 'Set details and cards updated successfully!',
        duration: 2000,
        color: 'success',
      });
      setIsEditing(false);
      setMetadataErrors({});
      setCardErrors({});
      await fetchData();
    } catch (error) {
      console.error('Failed to update set:', error);
      let message = 'Unknown error during save';
      if (error instanceof Error) message = error.message;
      setMetadataErrors((prev) => ({
        ...prev,
        general: `Failed to save: ${message}`,
      }));
      presentToast({
        message: `Failed to save changes: ${message}`,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMetadataErrors({});
    setCardErrors({});
  };

  const handleDeleteSet = async () => {
    if (!id) {
      console.error('Cannot delete set: ID is missing.');
      presentToast({
        message: 'Cannot delete: Set ID missing.',
        duration: 3000,
        color: 'danger',
      });
      return;
    }
    try {
      await makeHttpCall<void>(`/api/flashcards/sets/`, {
        method: 'DELETE',
        headers: { id: id },
      });
      presentToast({
        message: 'Set deleted successfully.',
        duration: 2000,
        color: 'success',
      });
      history.push('/student-dashboard');
    } catch (error) {
      console.error('Failed to delete set:', error);
      let message = 'Unknown error during deletion';
      if (error instanceof Error) message = error.message;
      presentToast({
        message: `Failed to delete set: ${message}`,
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleBackClick = () => {
    if (!isEditing) {
      window.history.back();
    }
  };

  const cardsToDisplay = isEditing ? editedCards : cards;

  return (
    <IonContent className="">
      <Navbar />
      <div id="main-content" className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <SetOverviewHeader
            loading={loadingCards}
            flashcardSetData={flashcardSetData}
            isEditing={isEditing}
            isOwner={isOwner}
            updatedInfo={updatedInfo}
            metadataErrors={metadataErrors}
            onMetadataChange={handleMetadataChange}
            onBackClick={handleBackClick}
          />

          <SetOverviewControls
            isOwner={isOwner}
            isEditing={isEditing}
            onBackClick={handleBackClick}
            onEditClick={handleEdit}
            onSaveClick={handleSave}
            onCancelClick={handleCancel}
            onDeleteClick={() => setShowDeleteAlert(true)}
            studyLink={`/flashcards/${id}`}
          />
        </div>

        <SetCardList
          loading={loadingCards}
          cardsToDisplay={cardsToDisplay}
          isEditing={isEditing}
          isOwner={isOwner}
          cardErrors={cardErrors}
          onCardChange={handleCardChange}
          onAddCard={handleAddCard}
          onRemoveCard={handleRemoveCard}
          onAddCardClick={handleEdit}
        />
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
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: handleDeleteSet,
          },
        ]}
      />
    </IonContent>
  );
};

export default SetOverview;
