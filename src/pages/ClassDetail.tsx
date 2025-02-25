import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlashCard } from "@/components/flashcards/FlashCard";
import { Trophy, BookOpen, UserPlus, Plus, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * ClassDetail Component
 *
 * This component displays detailed information about a specific class.
 * It allows teachers to:
 * - View class information and leaderboard
 * - Manage flashcard sets
 * - Add new students to the class
 * - Add new flashcard sets to the class
 *
 * The component uses the class ID from the URL to load the correct class data.
 */
const ClassDetail = () => {
  // Get the class ID from the URL parameters
  const { id } = useParams();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedSet, setSelectedSet] = useState<number | null>(null);

  // State for managing new student form
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [studentNameError, setStudentNameError] = useState("");
  const [studentEmailError, setStudentEmailError] = useState("");

  // State for managing new flashcard set form
  const [newSetName, setNewSetName] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");

  // TODO: get the class data from the database based on the class ID
  // Mock data - in a real app this would come from an API based on the class ID
  const classData = {
    id: id,
    name: "Biology 101",
    teacher: "Dr. Smith",
    students: [
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
      { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
      { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com" },
      { id: 4, name: "Alice Williams", email: "alice.williams@example.com" },
      { id: 5, name: "Charlie Brown", email: "charlie.brown@example.com" },
    ],
    leaderboard: [
      { name: "John Doe", cardsMastered: 95 },
      { name: "Jane Smith", cardsMastered: 90 },
      { name: "Bob Johnson", cardsMastered: 85 },
      { name: "Alice Williams", cardsMastered: 82 },
      { name: "Charlie Brown", cardsMastered: 80 },
    ],
    flashcardSets: [
      {
        id: 1,
        name: "Cell Biology",
        description: "Basic concepts of cell biology",
        cards: [
          {
            id: 1,
            front: "What is a cell?",
            back: "The basic structural unit of all living organisms",
          },
          {
            id: 2,
            front: "What is a nucleus?",
            back: "The control center of the cell containing genetic material",
          },
          {
            id: 3,
            front: "What is mitochondria?",
            back: "The powerhouse of the cell",
          },
        ],
      },
      {
        id: 2,
        name: "Plant Biology",
        description: "Introduction to plant biology concepts",
        cards: [
          {
            id: 1,
            front: "What is photosynthesis?",
            back: "The process by which plants convert light energy into chemical energy",
          },
          {
            id: 2,
            front: "What are chloroplasts?",
            back: "Organelles where photosynthesis occurs",
          },
        ],
      },
    ],
  };

  /**
   * Validates if a string contains both first and last name
   * @param name - The name string to validate
   * @returns boolean - True if valid, false otherwise
   */
  const validateFullName = (name: string): boolean => {
    // Check if name contains at least two words with alphabetic characters
    const nameParts = name.trim().split(/\s+/);
    return nameParts.length >= 2 && nameParts.every((part) => part.length > 0);
  };

  /**
   * Validates if a string is a valid email address
   * @param email - The email string to validate
   * @returns boolean - True if valid, false otherwise
   */
  const validateEmail = (email: string): boolean => {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle adding a new student to the class
   * In a real app, this would make an API call to add the student
   */
  const handleAddStudent = () => {
    // Reset previous error messages
    setStudentNameError("");
    setStudentEmailError("");

    let isValid = true;

    // Validate student name (must have first and last name)
    if (!newStudentName.trim()) {
      setStudentNameError("Name is required");
      isValid = false;
    } else if (!validateFullName(newStudentName)) {
      setStudentNameError("Please enter both first and last name");
      isValid = false;
    }

    // Validate email (must be a valid email format)
    if (!newStudentEmail.trim()) {
      setStudentEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(newStudentEmail)) {
      setStudentEmailError("Please enter a valid email address");
      isValid = false;
    }

    // If validation fails, stop here
    if (!isValid) return;

    console.log("Adding new student:", {
      name: newStudentName,
      email: newStudentEmail,
      classId: id,
    });

    // Reset form fields after successful submission
    setNewStudentName("");
    setNewStudentEmail("");

    // In a real app, we would update the students list after API call
    // For now, just show a success message
    alert("Student added successfully!");
  };

  /**
   * Handle input change for student name field
   * Clears error message when user starts typing
   */
  const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStudentName(e.target.value);
    if (studentNameError) setStudentNameError("");
  };

  /**
   * Handle input change for student email field
   * Clears error message when user starts typing
   */
  const handleStudentEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStudentEmail(e.target.value);
    if (studentEmailError) setStudentEmailError("");
  };

  /**
   * Handle adding a new flashcard set to the class
   * In a real app, this would make an API call to add the set
   */
  const handleAddFlashcardSet = () => {
    // Validation - ensure set name is provided
    if (!newSetName.trim()) {
      alert("Please provide a name for the new flashcard set");
      return;
    }

    console.log("Adding new flashcard set:", {
      name: newSetName,
      description: newSetDescription,
      classId: id,
    });

    // Reset form fields after submission
    setNewSetName("");
    setNewSetDescription("");

    // TODO: add the new flashcard set to the database and update the flashcardSets list after API call
    // In a real app, we would update the flashcard sets list after API call
    // For now, just show a success message
    alert("Flashcard set added successfully!");
  };

  // Handle marking a card as mastered
  const handleMastered = () => {
    console.log("Card marked as mastered");
  };

  // Handle marking a card as still learning
  const handleStillLearning = () => {
    console.log("Card marked as still learning");
  };

  // Update current card index when the carousel changes
  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentCardIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with class name and teacher */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
        <p className="text-gray-600">Teacher: {classData.teacher}</p>
        <p className="text-gray-600">Class ID: {id}</p>
      </div>

      {/* Back button */}
      <Button
        onClick={() => window.history.back()}
        variant="outline"
        className="mb-6"
      >
        ← Back
      </Button>

      {/* Management buttons for adding students and flashcard sets */}
      <div className="flex gap-4 mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the details of the student you want to add to this class.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={newStudentName}
                    onChange={handleStudentNameChange}
                    className={`${studentNameError ? "border-red-500" : ""}`}
                    placeholder="John Doe"
                  />
                  {studentNameError && (
                    <p className="text-red-500 text-sm mt-1">
                      {studentNameError}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    value={newStudentEmail}
                    onChange={handleStudentEmailChange}
                    className={`${studentEmailError ? "border-red-500" : ""}`}
                    placeholder="john.doe@example.com"
                  />
                  {studentEmailError && (
                    <p className="text-red-500 text-sm mt-1">
                      {studentEmailError}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Flashcard Set
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Flashcard Set</DialogTitle>
              <DialogDescription>
                Create a new flashcard set for this class.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="setName" className="text-right">
                  Set Name
                </Label>
                <Input
                  id="setName"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="col-span-3"
                  placeholder="Cell Biology"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newSetDescription}
                  onChange={(e) => setNewSetDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Basic concepts of cell biology"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddFlashcardSet}>Create Set</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="flashcards">
            <BookOpen className="mr-2 h-4 w-4" />
            Flashcard Sets
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard tab content */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Class Leaderboard</h2>
            <div className="space-y-3">
              {classData.leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-lg">{index + 1}</span>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <span className="text-primary font-semibold">
                    {entry.cardsMastered} cards
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Flashcards tab content */}
        <TabsContent value="flashcards" className="mt-6">
          {selectedSet === null ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classData.flashcardSets.map((set) => (
                <Card
                  key={set.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedSet(set.id)}
                >
                  <h3 className="text-lg font-semibold mb-2">{set.name}</h3>
                  <p className="text-muted-foreground mb-2">
                    {set.description}
                  </p>
                  <p className="text-muted-foreground">
                    {set.cards.length} cards
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setSelectedSet(null)}
                className="mb-6"
              >
                ← Back to Sets
              </Button>
              <div className="w-full max-w-2xl mx-auto relative">
                <Carousel
                  orientation="vertical"
                  className="w-full"
                  setApi={setApi}
                >
                  <CarouselContent className="-mt-1 h-[400px]">
                    {classData.flashcardSets
                      .find((set) => set.id === selectedSet)
                      ?.cards.map((card) => (
                        <CarouselItem key={card.id}>
                          <FlashCard
                            front={card.front}
                            back={card.back}
                            onMastered={handleMastered}
                            onStillLearning={handleStillLearning}
                          />
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {/* Pagination dots */}
                <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                  {classData.flashcardSets
                    .find((set) => set.id === selectedSet)
                    ?.cards.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentCardIndex
                            ? "bg-primary"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Students tab content - always shown */}
        <TabsContent value="students" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Class Students</h2>
            <div className="space-y-3">
              {classData.students.map((student) => (
                <div
                  key={student.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <span className="font-medium">{student.name}</span>
                  <span className="text-muted-foreground">{student.email}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetail;
