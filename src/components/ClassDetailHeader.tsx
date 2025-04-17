/**
 * @file ClassDetailHeader.tsx
 * Purpose: Defines the header component for the Class Detail page.
 * This component is responsible for displaying the class name, description,
 * and handling the editing functionality for these fields. It contains both
 * the display view (when not editing) and the editing form (when editing).
 */

import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import { EditableField } from '@/utils/EditableField';

// Define the structure for Class data, mirroring the one in ClassDetail.tsx
// TODO: Consider moving this type to a shared types file (e.g., src/types/index.ts)
//       to avoid duplication and maintain consistency.
type Class = {
  ID: number;
  ClassName: string;
  ClassDescription: string;
  CreatedAt: string; // Keep for potential future use
  UpdatedAt: string; // Keep for potential future use
  Role: string; // Keep for potential future use (though isTeacher prop is derived from this)
};

/**
 * Props for the ClassDetailHeader component.
 */
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

/**
 * ClassDetailHeader Component
 *
 * Renders the header section of the Class Detail page.
 * It displays the class name and description, or an editing form if `isEditing` is true.
 * Shows skeleton loaders while data is loading (only in display mode).
 * Provides controls for saving or canceling edits.
 *
 * @param {ClassDetailHeaderProps} props - Component properties.
 * @returns {JSX.Element} The rendered header component.
 */
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
        // Editing Mode Form
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
          {/* Save and Cancel Buttons */}
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
        // Display Mode (Data Loaded)
        <>
          <div className="flex items-center">
            {' '}
            {/* Flex container for title and icon */}
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
        // Fallback if not loading and no data (Display Mode)
        <h1>Class details unavailable</h1>
      )}
    </>
  );
};

export default ClassDetailHeader;
