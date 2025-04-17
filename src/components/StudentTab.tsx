import React, { useState } from 'react';
import StudentList from '@/components/StudentList';
import { IonAlert } from '@ionic/react';

// TODO: Move this type to a shared types file (e.g., src/types/index.ts)
//       to avoid duplication and maintain consistency across the application.
type ClassUser = {
  UserID: number;
  ClassID: number;
  Role: string;
  FirstName: string;
  LastName: string;
};

interface StudentTabProps {
  isTeacher: boolean;
  students: ClassUser[];
  handleActualDelete: (studentId: number) => void;
}

const StudentTab: React.FC<StudentTabProps> = ({
  isTeacher,
  students,
  handleActualDelete,
}) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState<{
    isOpen: boolean;
    studentId: number | null;
  }>({
    isOpen: false,
    studentId: null,
  });

  const handleShowDeleteAlert = (studentId: number) => {
    setShowDeleteAlert({ isOpen: true, studentId: studentId });
  };

  return (
    <>
      <div className="flex flex-col">
        <StudentList
          isTeacher={isTeacher}
          students={students}
          onDeleteStudent={handleShowDeleteAlert}
        />
      </div>

      <IonAlert
        isOpen={showDeleteAlert.isOpen}
        onDidDismiss={
          () => setShowDeleteAlert({ isOpen: false, studentId: null }) // Reset state on dismiss
        }
        header="Confirm Deletion"
        message="Are you sure you want to remove this student from the class? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
          {
            text: 'Delete',
            handler: () => {
              if (showDeleteAlert.studentId !== null) {
                handleActualDelete(showDeleteAlert.studentId);
                console.log(
                  `Student deletion initiated for ID: ${showDeleteAlert.studentId}`
                );
              }
            },
          },
        ]}
      />
    </>
  );
};

export default StudentTab;
