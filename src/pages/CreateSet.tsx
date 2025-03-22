import {
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonTextarea,
    IonText
  } from '@ionic/react';
  import { useState } from 'react';
  import { addOutline, trashOutline } from 'ionicons/icons';
  import { Navbar } from '@/components/navbar';
  import { useHistory } from 'react-router-dom'; // 🔥 NEW
  
  const CreateSet = () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const history = useHistory(); // 🔥 NEW
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cards, setCards] = useState([{ front: '', back: '' }]);
    const [errors, setErrors] = useState({ title: '', description: '' });
  
    const addCard = () => {
      setCards([...cards, { front: '', back: '' }]);
    };
  
    const removeCard = (index: number) => {
      setCards(cards.filter((_, i) => i !== index));
    };
  
    const updateCard = (index: number, field: string, value: string) => {
      setCards(cards.map((card, i) => (i === index ? { ...card, [field]: value } : card)));
    };
  
    const saveSet = async () => {
      const newErrors = { title: '', description: '' };
      let hasError = false;
  
      if (!title.trim()) {
        newErrors.title = 'Title is required';
        hasError = true;
      }
  
      if (!description.trim()) {
        newErrors.description = 'Description is required';
        hasError = true;
      }
  
      setErrors(newErrors);
  
      if (hasError) return;
  
      const cleanedCards = cards.filter(
        (card) => card.front.trim() !== '' || card.back.trim() !== ''
      );
  
      try {
        // 1. Create the set
        const setResponse = await fetch(`${API_BASE}/flashcards/sets/`, {
          method: 'POST',
          headers: {
            'set_name': title,
            'set_description': description,
          },
        });
  
        if (!setResponse.ok) throw new Error('Failed to create set');
        const setData = await setResponse.json();
        const setId = setData.ID;
  
        // 2. Create flashcards
        for (const card of cleanedCards) {
          await fetch(`${API_BASE}/flashcards`, {
            method: 'POST',
            headers: {
              'front': card.front,
              'back': card.back,
              'set_id': setId.toString(),
            },
          });
        }
  
        // ✅ Navigate instead of alert
        history.push(`/flashcards/${setId}`);
      } catch (error) {
        console.error('Error saving flashcard set:', error);
        alert('Failed to save flashcard set.');
      }
    };
  
    const deleteSet = () => {
      setTitle('');
      setDescription('');
      setCards([{ front: '', back: '' }]);
      setErrors({ title: '', description: '' });
      console.log('Flashcard set deleted');
    };
  
    return (
      <IonContent className="ion-padding">
        <Navbar />
        <div id="main-content" className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Create New Flashcard Set</h1>
  
          {/* Title & Description inputs */}
          <IonCard className="mb-6 rounded-lg border shadow-sm">
            <IonCardContent>
              <IonTextarea
                placeholder="Enter set title"
                value={title}
                onIonChange={(e) => setTitle(e.detail.value!)}
                rows={1}
                autoGrow
                className="w-full text-xl font-bold mb-2"
                style={{ resize: 'none' }}
              />
              {errors.title && (
                <IonText color="danger">
                  <p className="text-sm mt-1">{errors.title}</p>
                </IonText>
              )}
  
              <IonTextarea
                placeholder="Enter set description"
                value={description}
                onIonChange={(e) => setDescription(e.detail.value!)}
                rows={1}
                autoGrow
                className="w-full text-base mt-4"
                style={{ resize: 'none' }}
              />
              {errors.description && (
                <IonText color="danger">
                  <p className="text-sm mt-1">{errors.description}</p>
                </IonText>
              )}
            </IonCardContent>
          </IonCard>
  
          {/* Flashcard Inputs */}
          {cards.map((card, index) => (
            <IonCard key={index} className="mb-6 rounded-lg border shadow-sm">
              <IonCardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-semibold">Card {index + 1}</span>
                  <IonButton fill="clear" color="danger" onClick={() => removeCard(index)}>
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
                <IonTextarea
                  placeholder="Front of card"
                  value={card.front}
                  onIonChange={(e) => updateCard(index, 'front', e.detail.value!)}
                  rows={1}
                  autoGrow
                  className="mb-4"
                  style={{ resize: 'none' }}
                />
                <IonTextarea
                  placeholder="Back of card"
                  value={card.back}
                  onIonChange={(e) => updateCard(index, 'back', e.detail.value!)}
                  rows={1}
                  autoGrow
                  style={{ resize: 'none' }}
                />
              </IonCardContent>
            </IonCard>
          ))}
  
          {/* Add card button */}
          <div className="flex justify-center mb-6">
            <IonButton color="primary" className="rounded-lg shadow-sm" onClick={addCard}>
              <IonIcon slot="start" icon={addOutline} /> Add Card
            </IonButton>
          </div>
  
          {/* Create button */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-8">
            <IonButton
              color="success"
              className="rounded-lg shadow-sm w-full md:w-auto"
              onClick={saveSet}
            >
              Create Set
            </IonButton>
          </div>
        </div>
      </IonContent>
    );
  };
  
  export default CreateSet;
  