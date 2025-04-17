import React, { useState, useEffect, useCallback } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonButton,
  IonButtons,
  IonSpinner,
  IonText,
  useIonToast,
} from '@ionic/react';
import { makeHttpCall } from '@/utils/makeHttpCall';
import { SetUser } from '@/types/flashcards';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface AddSetToClassDialogProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  classId: string | undefined;
  existingSetIds: number[];
  onSetAdded: () => void;
}

const AddSetToClassDialog: React.FC<AddSetToClassDialogProps> = ({
  isOpen,
  onDidDismiss,
  classId,
  existingSetIds,
  onSetAdded,
}) => {
  const [userSets, setUserSets] = useState<SetUser[]>([]);
  const [availableSets, setAvailableSets] = useState<SetUser[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentToast] = useIonToast();

  const fetchUserSets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSets = await makeHttpCall<SetUser[]>(
        `${API_BASE}/api/set_user/list`,
        { method: 'GET', headers: {} }
      );
      setUserSets(fetchedSets || []);
    } catch (err) {
      console.error('Failed to fetch user sets:', err);
      setError(
        `Failed to load your sets: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
      setUserSets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUserSets();
    } else {
      setUserSets([]);
      setAvailableSets([]);
      setSelectedSetId(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, fetchUserSets]);

  useEffect(() => {
    const setsNotInClass = userSets.filter(
      (set) => !existingSetIds.includes(set.SetID)
    );
    setAvailableSets(setsNotInClass);
  }, [userSets, existingSetIds]);

  const handleAddSet = async () => {
    if (!selectedSetId || !classId) {
      presentToast({
        message: 'Please select a set to add.',
        duration: 2000,
        color: 'warning',
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await makeHttpCall<string>(`${API_BASE}/api/class_set/`, {
        method: 'POST',
        headers: {
          id: classId,
          set_id: selectedSetId.toString(),
        },
      });
      presentToast({
        message: 'Set added successfully!',
        duration: 2000,
        color: 'success',
      });
      onSetAdded();
      onDidDismiss();
    } catch (err) {
      console.error('Failed to add set to class:', err);
      const errorMessage = `Failed to add set: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`;
      setError(errorMessage);
      presentToast({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('selectedSetId', selectedSetId);

  console.log('availableSets', availableSets);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Set to Class</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDidDismiss} color="medium">
              Cancel
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && !availableSets.length ? (
          <div className="flex justify-center items-center h-full">
            <IonSpinner name="circular" />
            <span className="ml-2">Loading your sets...</span>
          </div>
        ) : error ? (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        ) : availableSets.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            You have no available sets to add to this class. Create a new set or
            check if all your sets are already added.
          </p>
        ) : (
          <IonRadioGroup
            value={selectedSetId}
            onIonChange={(e) => {
              console.log('e.detail.value', e.detail.value);
              setSelectedSetId(Number(e.detail.value));
            }}
          >
            <IonList>
              {availableSets.map((set) => (
                <IonItem key={set.SetID}>
                  <IonRadio slot="start" key={set.SetID} value={set.SetID} />
                  <IonLabel>
                    <h2>{set.SetName}</h2>
                    <p className="text-sm text-gray-500">
                      {set.SetDescription}
                    </p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonRadioGroup>
        )}

        {error && availableSets.length > 0 && (
          <IonText color="danger" className="block mt-4">
            <p>{error}</p>
          </IonText>
        )}
      </IonContent>
      {!isLoading && availableSets.length > 0 && (
        <div className="ion-padding">
          <IonButton
            expand="block"
            onClick={handleAddSet}
            disabled={!selectedSetId}
            className="ion-margin-bottom"
          >
            {isLoading ? <IonSpinner name="dots" /> : 'Add Selected Set'}
          </IonButton>
        </div>
      )}
    </IonModal>
  );
};

export default AddSetToClassDialog;
