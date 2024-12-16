/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

interface FileData {
  _id: string;
  originalName: string;
  uploadTime: string;
}

interface Subscription {
  isActive: boolean;
  expiresAt: string;
}

const Dashboard = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await api.get("/files/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data.files);
      setSubscription(response.data.subscription);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search files
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await api.get(`/files/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data.files);
    } catch (error: any) {
      console.error("Search error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Subscription Info */}
          {subscription && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Subscription Status</h2>
              <p>
                Status:{" "}
                <span className={subscription.isActive ? "text-green-500" : "text-red-500"}>
                  {subscription.isActive ? "Active" : "Expired"}
                </span>
              </p>
              {subscription.isActive && (
                <p>Expires At: {new Date(subscription.expiresAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Search */}
          <div className="flex items-center mb-6">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mr-4"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Search
            </button>
          </div>

          {/* Uploaded Files */}
          <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file._id}
                  className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
                >
                  <span>{file.originalName}</span>
                  <span className="text-gray-500">
                    Uploaded: {new Date(file.uploadTime).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded yet.</p>
          )}


<Link
  to="/upload"
  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
>
  Upload New File
</Link>
        </>
      )}
    </div>
  );
};

export default Dashboard;
