import { Navbar } from '@/components/navbar';
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PublicClasses = () => {

    const [classes, setClasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch(`${API_BASE}/classes/list`);
                if (!res.ok) throw new Error('Failed to fetch classes');
                const data = await res.json();
                console.log(data);
                setClasses(data);
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        }

        fetchClasses();
    });
    
    return (
        <IonContent>
            <Navbar />
            <div id="main-content" className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold pb-8">Public Classes</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((classItem) => (
                    <Link key={classItem.ID} to={`/class/${classItem.ID}`}>
                        <IonCard className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform-shadow duration-200 rounded-lg border shadow-sm">
                            <IonCardHeader className="flex flex-col space-y-1.5 p-6">
                            <IonCardTitle className="text-2xl font-semibold leading-none tracking-tight">
                                {classItem.ClassName}
                            </IonCardTitle>
                            <IonCardSubtitle className="text-sm text-gray-600">
                                {classItem.ClassDescription || 'No description'}
                            </IonCardSubtitle>
                            </IonCardHeader>
                        </IonCard>
                    </Link>
                ))}
                </div>
            </div>

        </IonContent>
    );
};

export default PublicClasses;