/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import api from "../utils/api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";



const FileUploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
  
    
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      setLoading(true);
      const token = Cookies.get("token");
      console.log("[INFO] Initiating file upload...");
  
      const response = await api.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("[INFO] Upload successful:", response.data);
      setMessage("File uploaded successfully!");
  
      navigate(`/file-view/${response.data.fileName}`);
    } catch (error: any) {
      console.error("[ERROR] Upload failed:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "File upload failed.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Upload File</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />
        <button
          onClick={handleUpload}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>
        {message && <p className="mt-4 text-sm text-center">{message}</p>}
      </div>
    </div>
  );
};

export default FileUploadPage;
