
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { isAuthenticated } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">BRD Wizard</h1>
          <p className="mt-2 text-gray-600">AI-powered Business Requirements Documents</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
