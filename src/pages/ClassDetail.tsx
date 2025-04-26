import AddSetToClassDialog from '@/components/AddSetToClassDialog';
import ClassDetailControls from '@/components/ClassDetailControls';
import ClassDetailHeader from '@/components/ClassDetailHeader';
import ClassDetailTabs from '@/components/ClassDetailTabs';
import FlashcardSetList from '@/components/FlashcardSetList';
import { Footer } from '@/components/Footer';
import LeaderboardTab from '@/components/LeaderboardTab';
import { Navbar } from '@/components/Navbar';
import StudentTab from '@/components/StudentTab';
import { type CarouselApi } from '@/components/ui/carousel';
import type {
  Class,
  FlashcardSet,
  GetClassScoresRow,
  ListMembersOfAClassRow,
} from '@/types/globalTypes';
import { makeHttpCall } from '@/utils/makeHttpCall';
import { IonContent } from '@ionic/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

//TODO: 504 Gateway Timeout when using live site, this happens due to Ionic's router remounting the component

// Custom hooks for data fetching
const useClassDetails = (id: string) =>
  useQuery<Class, Error>({
    queryKey: ['class', id],
    queryFn: () =>
      makeHttpCall<Class>(`/api/classes/`, {
        method: 'GET',
        headers: { id },
      }),
    staleTime: 5 * 60 * 1000,
  });

const useClassSets = (id: string) =>
  useQuery<FlashcardSet[], Error>({
    queryKey: ['classSets', id],
    queryFn: () =>
      makeHttpCall<FlashcardSet[]>(`/api/class_set/list_sets`, {
        method: 'GET',
        headers: { id },
      }),
    staleTime: 5 * 60 * 1000,
  });

const useClassMembers = (id: string) =>
  useQuery<ListMembersOfAClassRow[], Error>({
    queryKey: ['classMembers', id],
    queryFn: () =>
      makeHttpCall<ListMembersOfAClassRow[]>(`/api/class_user/members`, {
        method: 'GET',
        headers: { class_id: id },
      }),
    staleTime: 5 * 60 * 1000,
  });

const useClassLeaderboard = (id: string) =>
  useQuery<GetClassScoresRow[], Error>({
    queryKey: ['classLeaderboard', id],
    queryFn: () =>
      makeHttpCall<GetClassScoresRow[]>(`/api/classes/leaderboard`, {
        method: 'GET',
        headers: { id },
      }),
    staleTime: 5 * 60 * 1000,
  });

type UpdateClassArgs = { id: string; field: string; value: string };
const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation<Class, Error, UpdateClassArgs>({
    mutationFn: ({ id, field, value }) =>
      makeHttpCall<Class>(`/api/classes/${field}`, {
        method: 'PUT',
        headers: { id, [field]: value },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class', variables.id] });
    },
  });
};

const useDeleteStudent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (studentId) =>
      makeHttpCall(`/api/class_user/`, {
        method: 'DELETE',
        headers: { student_id: studentId, id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classMembers', id] });
    },
  });
};

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [tab, setTab] = useState('flashcards');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    class_name: '',
    class_description: '',
  });
  const [showAddSetDialog, setShowAddSetDialog] = useState(false);
  const [errors, setErrors] = useState<{
    className?: string;
    classDescription?: string;
    general?: string;
  }>({});

  // React Query hooks
  const {
    data: classData,
    isLoading: isLoadingClass,
    error: classError,
  } = useClassDetails(id!);
  const {
    data: flashcardSets = [],
    isLoading: isLoadingSets,
    error: setsError,
  } = useClassSets(id!);
  const {
    data: classUsers = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useClassMembers(id!);
  const {
    data: leaderboardData = [],
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = useClassLeaderboard(id!);

  const updateClassMutation = useUpdateClass();
  const deleteStudentMutation = useDeleteStudent(id!);
  const queryClient = useQueryClient();

  const isTeacher = classData?.Role === 'teacher';

  const handleEdit = () => {
    setUpdatedInfo({
      class_name: classData?.ClassName || '',
      class_description: classData?.ClassDescription || '',
    });
    setIsEditing(true);
  };

  const validateForm = () => {
    const newErrors: { className?: string; classDescription?: string } = {};
    let isValid = true;
    updatedInfo.class_name = updatedInfo.class_name.trim();
    updatedInfo.class_description = updatedInfo.class_description.trim();
    if (!updatedInfo.class_name) {
      newErrors.className = 'Class name is required';
      isValid = false;
    }
    if (!updatedInfo.class_description) {
      newErrors.classDescription = 'Class description is required';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      await Promise.all([
        updateClassMutation.mutateAsync({
          id,
          field: 'class_name',
          value: updatedInfo.class_name,
        }),
        updateClassMutation.mutateAsync({
          id,
          field: 'class_description',
          value: updatedInfo.class_description,
        }),
      ]);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update some fields. Please try again.');
    }
  };

  const handleChange = (e: CustomEvent) => {
    const { name } = e.target as HTMLInputElement;
    const value = e.detail.value;
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDeleteStudent = async (studentId: number | null) => {
    if (studentId === null) return;
    try {
      await deleteStudentMutation.mutateAsync(studentId);
    } catch (error) {
      alert('Error deleting student');
    }
  };

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on('select', () => {
      setCurrentCardIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Error and loading handling
  const anyLoading =
    isLoadingClass || isLoadingSets || isLoadingUsers || isLoadingLeaderboard;
  const anyError = classError || setsError || usersError || leaderboardError;

  return (
    <>
      <Navbar />
      <IonContent className="ion-padding">
        <div id="main-content" className="max-w-4xl mx-auto">
          {anyError && <div className="text-red-500">{anyError.message}</div>}
          <ClassDetailHeader
            classData={classData}
            isTeacher={isTeacher}
            loading={anyLoading}
            handleEdit={handleEdit}
            isEditing={isEditing}
            updatedInfo={updatedInfo}
            errors={errors}
            handleChange={handleChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />
          <ClassDetailControls
            isTeacher={isTeacher}
            classId={id}
            onAddSetClick={() => setShowAddSetDialog(true)}
          />
          <ClassDetailTabs selectedTab={tab} onTabChange={setTab} />
          {tab === 'leaderboard' && (
            <LeaderboardTab
              leaderboardData={leaderboardData}
              loadingScores={anyLoading}
            />
          )}
          {tab === 'flashcards' && (
            <FlashcardSetList
              flashcardSets={flashcardSets}
              currentCardIndex={currentCardIndex}
              setApi={setCarouselApi}
              loading={anyLoading}
            />
          )}
          {tab === 'students' && (
            <StudentTab
              isTeacher={isTeacher}
              students={classUsers}
              handleActualDelete={handleDeleteStudent}
            />
          )}
        </div>
        <Footer />
      </IonContent>
      <AddSetToClassDialog
        isOpen={showAddSetDialog}
        onDidDismiss={() => setShowAddSetDialog(false)}
        classId={id}
        existingSetIds={flashcardSets.map((set) => set.ID)}
        onSetAdded={() => {
          // Invalidate queries after adding a set
          queryClient.invalidateQueries({ queryKey: ['classSets', id] });
        }}
      />
    </>
  );
};

export default ClassDetail;
