import { Navbar, NavbarTitle } from '@/components/navbar';
import { IonContent, IonItem, IonList, IonInput, IonText } from '@ionic/react';

const CreateClass = () => {
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
        <IonList>
          <IonItem>
            <IonInput
              label="Class Name"
              type="text"
              placeholder="Enter Class Name"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Class Description"
              type="text"
              placeholder="Enter Class Description"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Join Code"
              type="text"
              placeholder="Enter Join Code"
            />
          </IonItem>
        </IonList>
      </div>
    </IonContent>
  );
};

export default CreateClass;
