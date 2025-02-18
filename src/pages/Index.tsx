import { AuthForm } from "@/components/auth/AuthForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">CowboyCards</h1>
        <p className="text-gray-600">Master any subject with smart flashcards</p>
      </div>
      <AuthForm />
    </div>
  );
};

export default Index;