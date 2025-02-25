import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * TeacherDashboard Component
 *
 * This component displays a dashboard for teachers to manage their classes.
 * It shows summary statistics and a list of classes with student information.
 * Teachers can also create new classes through a dialog box.
 */
const TeacherDashboard = () => {
  // State for managing new class form
  const [newClassName, setNewClassName] = useState("");
  const [classNameError, setClassNameError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock Data for teacher classes
  // Each class has an id, name, number of students, number of sets, and cards mastered
  // TODO: Get cards mastered from the student's flashcard sets/data
  // TODO: Replace with actual data from the database
  const teacherClasses = [
    {
      id: 1,
      name: "Biology 101",
      students: 25,
      sets: 5,
      cardsMastered: 85,
    },
    {
      id: 2,
      name: "Spanish Basics",
      students: 18,
      sets: 3,
      cardsMastered: 78,
    },
    {
      id: 3,
      name: "World History",
      students: 30,
      sets: 7,
      cardsMastered: 92,
    },
  ];

  // Calculate summary statistics from the class data
  // These statistics provide an overview of all classes at a glance
  const totalClasses = teacherClasses.length;
  const totalStudents = teacherClasses.reduce(
    (sum, cls) => sum + cls.students,
    0
  );
  const totalSets = teacherClasses.reduce((sum, cls) => sum + cls.sets, 0);

  // Calculate average cards mastered across all classes
  // We sum all cards mastered values, then divide by class count
  const averageCardsMastered =
    teacherClasses.reduce((sum, cls) => {
      return sum + cls.cardsMastered;
    }, 0) / totalClasses;

  /**
   * Validates the class name input
   * @param name - The class name to validate
   * @returns boolean - True if valid, false otherwise
   */
  const validateClassName = (name: string): boolean => {
    // Check if name is not empty and has a reasonable length
    return name.trim().length > 0 && name.trim().length <= 50;
  };

  /**
   * Generates a unique class ID
   * In a real app, this would be handled by the backend
   * @returns number - A new unique class ID
   */
  const generateClassId = (): number => {
    // Simple implementation: find the highest existing ID and add 1
    // In a real app, this would be handled by the database
    const highestId = Math.max(...teacherClasses.map((cls) => cls.id), 0);
    return highestId + 1;
  };

  /**
   * Handle creating a new class
   * In a real app, this would make an API call to create the class
   */
  const handleCreateClass = () => {
    // Reset previous error message
    setClassNameError("");

    // Validate class name
    if (!validateClassName(newClassName)) {
      setClassNameError("Please enter a valid class name (1-50 characters)");
      return;
    }

    // Generate a new class ID
    const newClassId = generateClassId();

    console.log("Creating new class:", {
      id: newClassId,
      name: newClassName,
    });

    // TODO: Add the new class to the database and update the teacherClasses list after API call
    // In a real app, we would add the new class to the database
    // and update the teacherClasses list after API call

    // Reset form field and close dialog
    setNewClassName("");
    setIsDialogOpen(false);

    // For demo purposes, show a success message
    alert(
      `Class "${newClassName}" created successfully with ID: ${newClassId}!`
    );
  };

  /**
   * Handle input change for class name field
   * Clears error message when user starts typing
   */
  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClassName(e.target.value);
    if (classNameError) setClassNameError("");
  };

  return (
    // Main container with responsive padding and centering
    <div className="container mx-auto px-4 py-8">
      {/* Header section with title and action button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        {/* Dialog for creating a new class */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Enter the details for your new class. You can add students and
                flashcard sets after creation.
              </DialogDescription>
            </DialogHeader>
            {/* Scrollable content area for the dialog */}
            <ScrollArea className="max-h-[60vh]">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="className" className="text-right">
                    Class Name
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="className"
                      value={newClassName}
                      onChange={handleClassNameChange}
                      className={`${classNameError ? "border-red-500" : ""}`}
                      placeholder="Biology 101"
                    />
                    {classNameError && (
                      <p className="text-red-500 text-sm mt-1">
                        {classNameError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Class ID</Label>
                  <div className="col-span-3">
                    <p className="text-sm text-muted-foreground">
                      A unique ID will be automatically assigned when the class
                      is created.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Note</Label>
                  <div className="col-span-3">
                    <p className="text-sm text-muted-foreground">
                      After creating the class, you'll be able to add students
                      and flashcard sets from the class detail page.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={handleCreateClass}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview section heading */}
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      {/* Statistics cards grid - responsive layout with 1 column on mobile, 4 on larger screens */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-8">
        {/* Summary statistics cards */}
        {/* Each card follows the same pattern: title in header, value in content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClasses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Cards Mastered
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Format to 1 decimal place for readability */}
            <p className="text-2xl font-bold">
              {averageCardsMastered.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes section heading */}
      <h2 className="text-xl font-bold mb-4">Classes</h2>
      {/* Classes grid - responsive layout with different columns based on screen size */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Map through each class to create a card */}
        {teacherClasses.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              {/* Class name as the card title */}
              <CardTitle>{cls.name}</CardTitle>
              {/* Student count as the card description */}
              <CardDescription>
                {cls.students} students enrolled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Additional class details */}
              <p className="text-sm text-gray-600">{cls.sets} sets</p>
              <p className="text-sm text-gray-600">
                Cards mastered: {cls.cardsMastered}
              </p>
              {/* Link to manage the specific class - uses the class ID in the URL */}
              <Button variant="link" asChild className="mt-2 p-0">
                <Link to={`/teacher/class/${cls.id}`}>Manage Class</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
