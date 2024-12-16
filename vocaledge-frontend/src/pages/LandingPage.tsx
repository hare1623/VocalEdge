import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token); 
  }, []);

  const handleLogout = () => {
    Cookies.remove("token"); 
    setIsLoggedIn(false);
    navigate("/"); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-blue-500 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">VocalEdge</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="hover:underline">
                  Signup
                </Link>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-4xl font-extrabold mb-4 text-gray-800">
          Welcome to VocalEdge!
        </h2>
        <p className="text-gray-600 mb-6">
          Transform text into audio, summarize documents, and more.
        </p>
        {isLoggedIn ? (
          <Link
            to="/dashboard"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            to="/signup"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Get Started
          </Link>
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-blue-500 text-white py-4 text-center">
        <p>&copy; {new Date().getFullYear()} VocalEdge. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
