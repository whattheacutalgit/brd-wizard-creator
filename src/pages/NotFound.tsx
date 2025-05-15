
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-6 max-w-md">
        <FileText className="h-24 w-24 text-primary mx-auto" />
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button className="mt-4">Return to Dashboard</Button>
        </Link>
        <p className="text-sm text-gray-500 pt-6">
          BRD Wizard - AI-powered Business Requirements Documents
        </p>
      </div>
    </div>
  );
};

export default NotFound;
