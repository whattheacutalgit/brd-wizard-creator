
import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { apiGet, isAuthenticated, clearAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, User, Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
}

const AppLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userData = await apiGet<User>("/api/users/me");
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, toast]);

  const handleLogout = () => {
    clearAuthToken();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin-slow">
          <FileText className="h-8 w-8 text-gray-700" />
        </div>
        <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-gray-800" />
            <span className="font-bold text-xl text-gray-900">BRD Wizard</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center text-sm">
                <span className="text-gray-500">Hello, </span>
                <span className="ml-1 font-medium text-gray-800">{user.full_name}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-3 text-gray-800 rounded-md hover:bg-white hover:shadow-sm"
            >
              <Users className="h-5 w-5 mr-3" />
              <span>My Groups</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 text-gray-800 rounded-md hover:bg-white hover:shadow-sm"
            >
              <User className="h-5 w-5 mr-3" />
              <span>Profile</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
