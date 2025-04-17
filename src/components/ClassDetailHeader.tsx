import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import { EditableField } from '@/utils/EditableField';

// TODO: Consider moving this type to a shared types file (e.g., src/types/index.ts)
//       to avoid duplication and maintain consistency.
type Class = {
  ID: number;
  ClassName: string;
  ClassDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
  Role: string;
};

interface ClassDetailHeaderProps {
  classData?: Class;
  isTeacher: boolean;
  loading: boolean;
  handleEdit: () => void;
  isEditing: boolean;
  updatedInfo: { class_name: string; class_description: string };
  errors: { className?: string; classDescription?: string; general?: string };
  handleChange: (e: CustomEvent) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

const ClassDetailHeader: React.FC<ClassDetailHeaderProps> = ({
  classData,
  isTeacher,
  loading,
  handleEdit,
  isEditing,
  updatedInfo,
  errors,
  handleChange,
  handleSave,
  handleCancel,
}) => {
  return (
    <>
      {isEditing ? (
        <>
          <EditableField
            label="Class Name"
            name="class_name"
            value={updatedInfo.class_name}
            onChange={handleChange}
            error={errors.className}
          />
          <EditableField
            label="Class Description"
            name="class_description"
            value={updatedInfo.class_description}
            onChange={handleChange}
            error={errors.classDescription}
          />
          {errors.general && (
            <p className="text-red-500 text-sm mt-1">{errors.general}</p>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <IonButton onClick={handleSave} color="primary" size="small">
              Save
            </IonButton>
            <IonButton onClick={handleCancel} color="medium" size="small">
              Cancel
            </IonButton>
          </div>
        </>
      ) : loading ? (
        <div>Loading...</div>
      ) : classData ? (
        <>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              {loading ? 'Loading...' : classData.ClassName}
            </h1>
            {isTeacher && !isEditing && (
              <IonIcon
                icon={createOutline}
                size="large"
                color="primary"
                className="hover:transform hover:scale-110 cursor-pointer p-2"
                onClick={handleEdit}
              ></IonIcon>
            )}
          </div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : classData.ClassDescription}
          </p>
        </>
      ) : (
        <h1>Class details unavailable</h1>
      )}
    </>
  );
};

export default ClassDetailHeader;
