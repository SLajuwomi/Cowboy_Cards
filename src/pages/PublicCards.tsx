import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonSearchbar,
  IonText
} from '@ionic/react';
import { Link } from 'react-router-dom';
import { Navbar, NavbarTitle, NavbarButton } from '@/components/navbar';
import { useState, useEffect } from 'react';

const PublicFlashcards = () => {
  const flashcardSets = [
    {
      id: 1,
      title: 'Basic Spanish Vocabulary',
      creator: 'John Doe',
      cards: 50,
    },
    { id: 2, title: 'World Capitals', creator: 'Jane Smith', cards: 30 },
    { id: 3, title: 'Biology Terms', creator: 'Dr. Emily Brown', cards: 40 },
  ];
  const [searchText, setSearchText] = useState(''); // Add this state
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  const PublicFlashcards = () => {
    const [searchText,setSearchText] = useState(''); // Add this state
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null); // Add this state

    useEffect(() => {
      const testConnection = async () => {
        try {
          const response = await fetch('http://localhost:8000/test-connection'); // Replace with your API endpoint
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Database connection successful:', data); // Log success response
          setConnectionStatus('Database connection successful'); // Update state with success message
        } catch (error) {
          console.error('Error testing database connection:', error); // Log error
          setConnectionStatus('Error testing database connection'); // Update state with error message
        }
      }
    
    testConnection();
  },[]);

  return (
    <IonContent>
      <Navbar>
        <NavbarTitle >
          <div className="text-xl md:text-2xl lg:text-3xl inline-block font-bold">
            Public Flashcards
          </div>
        </NavbarTitle>
        <div className="flex justify-center flex-grow w-full ">
          <IonSearchbar
            placeholder="Search public sets"
            value={searchText} // Bind the searchText state
            onIonChange={(e) => setSearchText(e.detail.value!)} // Update searchText dynamically
            className="max-w-lg w-full flex-grow"
          />
        </div>
      </Navbar>
      <div id="main-content" className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.map((set) => (
            <Link key={set.id} to={`/flashcards/${set.id}`}>
              <IonCard className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform-shadow duration-200 rounded-lg border shadow-sm">
                <IonCardHeader className="flex flex-col space-y-1.5 p-6">
                  <IonCardTitle className="text-2xl font-semibold leading-none tracking-tight">
                  {highlightText(set.title, searchText)} 
                  </IonCardTitle>
                  <IonCardSubtitle className="text-sm text-gray-600">
                    Created by {set.creator}
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonText className="text-sm text-gray-600">
                    {set.cards} cards
                  </IonText>
                </IonCardContent>
              </IonCard>
            </Link>
          ))}
        </div>
      </div>
    </IonContent>
  );};
}
export default PublicFlashcards;
