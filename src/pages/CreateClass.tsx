import { Navbar, NavbarTitle } from '@/components/navbar';
import {
  IonContent,
  IonItem,
  IonList,
  IonInput,
  IonText,
  IonButton,
  IonRadioGroup,
  IonRadio,
  IonToast,
} from '@ionic/react';

import { useState, useEffect } from 'react';

const CreateClass = () => {
  const [buttonClicked, setButtonClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastJoinCode, setLastJoinCode] = useState('');
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    joinCode: '',
  });
  const [isPrivate, setIsPrivate] = useState(false);
  const [textToCopy, setTextToCopy] = useState('This is the text to be copied');
  const [showToast, setShowToast] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  useEffect(() => {
    async function submitForm() {
      if (!buttonClicked) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          'https://cowboy-cards.dsouth.org/api/classes',
          {
            method: 'POST',
            headers: {
              name: formData.className,
              description: formData.description,
              joincode: formData.joinCode,
              teacherid: '12',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Class created successfully:', data);

        setLastJoinCode(formData.joinCode);

        setButtonClicked(false);
        setFormData({
          className: '',
          description: '',
          joinCode: '',
        });
      } catch (error) {
        console.error('Error creating class:', error);
        setError(`Failed to create class: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    submitForm();
  }, [buttonClicked, formData]);

  useEffect(() => {
    if (lastJoinCode) {
      setTextToCopy(lastJoinCode); // Update textToCopy when lastJoinCode changes
    } else {
      setTextToCopy(''); //reset the text to copy, if there is no join code.
    }
  }, [lastJoinCode]);

  return (
    <IonContent>
      <Navbar>
        <NavbarTitle>Create Class</NavbarTitle>
      </Navbar>
      <div id="main-content" className="container mx-auto px-4 py-8">
        <IonText color="warning">
          <p>
            Database only accepts a teacher ID of 12. <br />
            So I have not included an input for that, it will automatically be
            passed
          </p>
        </IonText>
        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}
        <form>
          <IonList>
            <IonItem>
              <IonInput
                label="Class Name"
                type="text"
                placeholder="Enter Class Name"
                value={formData.className}
                onIonChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    className: e.detail.value || '',
                  }))
                }
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Class Description"
                type="text"
                placeholder="Enter Class Description"
                value={formData.description}
                onIonChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.detail.value || '',
                  }))
                }
              />
            </IonItem>
            <IonItem>
              <IonRadioGroup
                onIonChange={(e) => {
                  const value = e.detail.value;
                  setIsPrivate(value === 'private');
                  setFormData((prev) => ({
                    ...prev,
                    joinCode: value === 'private' ? crypto.randomUUID() : '',
                  }));
                }}
              >
                <IonRadio value="public">Public</IonRadio>
                <IonRadio value="private">Private</IonRadio>
              </IonRadioGroup>
            </IonItem>
            <IonButton
              disabled={loading}
              onClick={() => setButtonClicked(true)}
            >
              {loading ? 'Creating...' : 'Submit'}
            </IonButton>
          </IonList>
          <IonText>
            {isPrivate && (
              <p>
                Class created successfully! Please save this join code: <br />
                <b>{lastJoinCode}</b>
              </p>
            )}
            {!isPrivate && <p>Class created successfully!</p>}
            <IonButton onClick={copyToClipboard}>Copy to Clipboard</IonButton>

            <IonToast
              isOpen={showToast}
              onDidDismiss={() => setShowToast(false)}
              message="Text copied to clipboard!"
              duration={2000}
            />
          </IonText>
        </form>
      </div>
    </IonContent>
  );
};

export default CreateClass;
