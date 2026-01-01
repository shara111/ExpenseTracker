import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("currentAccountId");

    // Show success message
    toast.success("Logged out successfully!");

    // Redirect to login
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600 font-medium">Logging out...</p>
      </div>
    </div>
  );
}

export default Logout;
