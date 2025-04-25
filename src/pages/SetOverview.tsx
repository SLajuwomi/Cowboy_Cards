import { Navbar } from '@/components/Navbar';
import type { Flashcard, FlashcardSet } from '@/types/globalTypes';
import { EditableField } from '@/utils/EditableField';
import { makeHttpCall } from '@/utils/makeHttpCall';
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonItem,
  IonSpinner,
  IonText,
  IonTextarea,
  useIonToast,
} from '@ionic/react';
import { addOutline, trashOutline } from 'ionicons/icons';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

const SetOverview = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [flashcardSetData, setFlashcardSetData] = useState<FlashcardSet>();
  const [cards, setCards] = useState<Flashcard[]>([]); // Holds the displayed cards (original or fetched)
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]); // Holds cards at the start of edit
  const [editedCards, setEditedCards] = useState<Flashcard[]>([]); // Holds cards being edited
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
        ? fetchedCardsData.map((c) => ({ ...c, ID: c.ID || 0 })) // Ensure ID is number
        : [];
      setCards(initialCards);
      setOriginalCards(initialCards); // Store original state for cancel/comparison
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
    setOriginalCards([...cards]); // Store current cards as original for this edit session
    setEditedCards(cards.map((card) => ({ ...card }))); // Deep copy cards for editing
    setIsEditing(true);
    setMetadataErrors({});
    setCardErrors({});
  };

  const handleMetadataChange = (e: CustomEvent) => {
    // ... existing handleMetadataChange ...
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
    // Optionally clear validation error for this field on change
    setCardErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[index]) {
        delete newErrors[index][field.toLowerCase()];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      return newErrors;
    });
  };

  const handleAddCard = () => {
    if (!flashcardSetData) return;
    const newCard: Flashcard = {
      ID: 0 - editedCards.filter((c) => c.ID <= 0).length - 1, // Temporary negative ID for new cards
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
    // ... existing validateMetadata ...
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
      if (!card.Front.trim()) {
        errors.front = 'Front cannot be empty';
        isValid = false;
      }
      if (!card.Back.trim()) {
        errors.back = 'Back cannot be empty';
        isValid = false;
      }
      if (Object.keys(errors).length > 0) {
        newCardErrors[index] = errors;
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

    const apiPromises: Promise<any>[] = [];

    // --- Metadata Updates --- (as before)
    if (updatedInfo.set_name !== flashcardSetData.SetName) {
      apiPromises.push(
        makeHttpCall(`/api/flashcards/sets/set_name`, {
          method: 'PUT',
          headers: { id: id, set_name: updatedInfo.set_name },
        })
      );
    }
    if (updatedInfo.set_description !== flashcardSetData.SetDescription) {
      apiPromises.push(
        makeHttpCall(`/api/flashcards/sets/set_description`, {
          method: 'PUT',
          headers: { id: id, set_description: updatedInfo.set_description },
        })
      );
    }

    // --- Card Updates --- //
    const originalCardMap = new Map(
      originalCards.map((card) => [card.ID, card])
    );
    const editedCardMap = new Map(editedCards.map((card) => [card.ID, card]));

    // Identify Deletions
    originalCards.forEach((originalCard) => {
      if (!editedCardMap.has(originalCard.ID)) {
        apiPromises.push(
          makeHttpCall(`/api/flashcards`, {
            method: 'DELETE',
            headers: { id: originalCard.ID },
          })
        );
      }
    });

    // Identify Additions and Updates
    editedCards.forEach((editedCard) => {
      if (editedCard.ID <= 0) {
        // New card
        apiPromises.push(
          makeHttpCall<Flashcard>(`/api/flashcards`, {
            method: 'POST',
            headers: {
              front: editedCard.Front.trim(),
              back: editedCard.Back.trim(),
              id: flashcardSetData.ID, // Set ID
            },
          })
        );
      } else {
        // Existing card, check for updates
        const originalCard = originalCardMap.get(editedCard.ID);
        if (originalCard) {
          const trimmedFront = editedCard.Front.trim();
          const trimmedBack = editedCard.Back.trim();
          if (trimmedFront !== originalCard.Front) {
            apiPromises.push(
              makeHttpCall(`/api/flashcards/front`, {
                method: 'PUT',
                headers: { id: editedCard.ID, front: trimmedFront },
              })
            );
          }
          if (trimmedBack !== originalCard.Back) {
            apiPromises.push(
              makeHttpCall(`/api/flashcards/back`, {
                method: 'PUT',
                headers: { id: editedCard.ID, back: trimmedBack },
              })
            );
          }
        }
        // If originalCard not found, it's an error case, but handled by delete logic
      }
    });

    try {
      // Execute all API calls
      await Promise.all(apiPromises);

      presentToast({
        message: 'Set details and cards updated successfully!',
        duration: 2000,
        color: 'success',
      });

      // Reset editing state and fetch fresh data AFTER save
      setIsEditing(false);
      setMetadataErrors({});
      setCardErrors({});
      await fetchData(); // Re-fetch to get actual IDs for new cards and confirm changes
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
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMetadataErrors({});
    setCardErrors({});
    setCards(originalCards); // Revert displayed cards to original state for this edit session
  };

  const handleDeleteSet = async () => {
    // ... existing handleDeleteSet code ...
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

  // Use `editedCards` for rendering when editing, otherwise use `cards`
  const cardsToDisplay = isEditing ? editedCards : cards;

  return (
    <IonContent className="ion-padding">
      <Navbar />
      <div id="main-content" className="container max-w-4xl mx-auto px-4 py-8">
        {/* --- Header Section --- */}
        {/* ... existing header JSX ... */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1 pr-4">
            <IonButton
              className="rounded-lg"
              fill="outline"
              style={{ '--border-radius': '0.5rem' }}
              onClick={() => !isEditing && window.history.back()} // Disable back while editing?
              disabled={isEditing}
            >
              Back
            </IonButton>

            <div className="flex flex-col w-full">
              {loadingCards || !flashcardSetData ? (
                <IonSpinner name="dots" />
              ) : isEditing && isOwner ? (
                <>
                  <EditableField
                    type="text"
                    label="Set Name"
                    name="set_name"
                    value={updatedInfo.set_name}
                    onChange={handleMetadataChange}
                    error={metadataErrors.setName}
                  />
                  <EditableField
                    type="text"
                    label="Set Description"
                    name="set_description"
                    value={updatedInfo.set_description}
                    onChange={handleMetadataChange}
                    error={metadataErrors.setDescription}
                  />
                  {metadataErrors.general && (
                    <p className="text-red-500 text-sm mt-1">
                      {metadataErrors.general}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">
                    {flashcardSetData.SetName}
                  </h1>
                  <p className="text-base mt-1 text-gray-700">
                    {flashcardSetData.SetDescription}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* --- Controls Section --- */}
          <div className="self-start md:self-center flex gap-2 md:mt-0 mt-4 w-full md:w-auto">
            {isOwner && !isEditing && (
              <>
                <IonButton
                  className="rounded-lg w-auto"
                  fill="outline"
                  style={{ '--border-radius': '0.5rem' }}
                  onClick={handleEdit}
                >
                  Edit Set & Cards
                </IonButton>
                <IonButton
                  className="rounded-lg w-auto"
                  color={'danger'}
                  style={{ '--border-radius': '0.5rem' }}
                  onClick={() => setShowDeleteAlert(true)}
                >
                  Delete Set
                </IonButton>
              </>
            )}
            {isOwner && isEditing && (
              <>
                <IonButton
                  className="rounded-lg"
                  color="primary"
                  size="small"
                  onClick={handleSave}
                >
                  Save All Changes
                </IonButton>
                <IonButton
                  className="rounded-lg"
                  color="medium"
                  size="small"
                  onClick={handleCancel}
                >
                  Cancel
                </IonButton>
              </>
            )}

            <IonButton
              className="rounded-lg w-1/3 md:w-auto"
              color={'primary'}
              style={{ '--border-radius': '0.5rem' }}
              routerLink={`/flashcards/${id}`}
              disabled={isEditing}
            >
              Study Set
            </IonButton>
          </div>
        </div>

        {/* --- Card List Section --- */}
        <div className="mt-8 min-h-[200px]">
          {loadingCards ? (
            <div className="flex items-center justify-center">
              <IonSpinner name="circular" />
            </div>
          ) : cardsToDisplay.length === 0 && !isEditing ? (
            <div className="text-center">
              <p className="text-lg text-gray-900 dark:text-gray-400 mb-4">
                This set has no cards yet.
              </p>
              {isOwner && (
                <IonButton
                  color="primary"
                  className="rounded-lg"
                  style={{ '--border-radius': '0.5rem' }}
                  onClick={handleEdit} // Trigger edit mode to add cards
                >
                  Add Cards
                </IonButton>
              )}
            </div>
          ) : (
            <div className="w-full">
              {cardsToDisplay.map((card, index) =>
                isEditing && isOwner ? (
                  // --- Edit Mode Card --- //
                  <IonCard
                    key={card.ID <= 0 ? `new-${index}` : card.ID} // Use temp key for new cards
                    className="mb-4 rounded-lg border shadow-sm p-4"
                  >
                    <IonItem lines="none">
                      <IonText className="text-md font-semibold text-gray-900 dark:text-gray-300 mr-auto">
                        Card {index + 1}
                      </IonText>
                      <IonButton
                        fill="clear"
                        color="danger"
                        size="small"
                        onClick={() => handleRemoveCard(index)}
                      >
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    </IonItem>
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                      <div className="flex-1">
                        <IonTextarea
                          label="Front"
                          labelPlacement="stacked"
                          value={card.Front}
                          onIonInput={(e) =>
                            handleCardChange(index, 'Front', e.detail.value)
                          }
                          className={`w-full border rounded-md p-2 ${
                            cardErrors[index]?.front
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          autoGrow={true}
                          rows={3}
                        />
                        {cardErrors[index]?.front && (
                          <p className="text-red-500 text-xs mt-1">
                            {cardErrors[index].front}
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <IonTextarea
                          label="Back"
                          labelPlacement="stacked"
                          value={card.Back}
                          onIonInput={(e) =>
                            handleCardChange(index, 'Back', e.detail.value)
                          }
                          className={`w-full border rounded-md p-2 ${
                            cardErrors[index]?.back
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          autoGrow={true}
                          rows={3}
                        />
                        {cardErrors[index]?.back && (
                          <p className="text-red-500 text-xs mt-1">
                            {cardErrors[index].back}
                          </p>
                        )}
                      </div>
                    </div>
                  </IonCard>
                ) : (
                  // --- Display Mode Card --- //
                  <IonCard
                    key={card.ID} // Use actual ID when displaying
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
                )
              )}
              {isEditing && isOwner && (
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleAddCard}
                  className="mt-4 rounded-lg"
                >
                  <IonIcon slot="start" icon={addOutline} />
                  Add New Card
                </IonButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Delete Alert --- */}
      {/* ... existing IonAlert code ... */}
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
