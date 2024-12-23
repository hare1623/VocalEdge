/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Cookies from "js-cookie";

const FileViewPage = () => {
    const { filename } = useParams();
  console.log("File NAME:", filename);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFileContent = async () => {
    if (!filename) {
      setError("File NAME is missing.");
      return;
    }
    setLoading(true);
    setError("");
    try {
        const token = Cookies.get("token");
        const response = await api.get(`/files/${filename}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFileContent(response.data.file.content);
      } catch (error: any) {
        console.error("Error fetching file content:", error.message);
        setError("Failed to fetch file content.");
      }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileContent();
  }, [filename]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1>File Content</h1>
      <pre>{fileContent}</pre>
    </div>
  );
};

export default FileViewPage;
