import React, { useState } from "react";
import api from "../utils/api";

interface FileActionsProps {
  fileId: string;
}

const FileActions: React.FC<FileActionsProps> = ({ fileId }) => {
  const [summary, setSummary] = useState("");
  const [answer, setAnswer] = useState("");
  const [audioPath, setAudioPath] = useState("");
  const [loading, setLoading] = useState(false);

  // Summarize File
  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await api.post("/files/summarize", { fileId });
      setSummary(response.data.summary);
    } catch (err) {
      console.error("Summarization error:", err);
    }
    setLoading(false);
  };

  // Ask Question
  const handleAskQuestion = async () => {
    const question = prompt("Enter your question:");
    if (!question) return;

    setLoading(true);
    try {
      const response = await api.post("/files/ask-question", { fileId, question });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Q&A error:", err);
    }
    setLoading(false);
  };

  // Generate Audio
  const handleGenerateAudio = async () => {
    setLoading(true);
    try {
      const response = await api.post("/files/generate-audio", {
        audioScript: summary || "Generated audio content.",
      });
      setAudioPath(response.data.filePath);
    } catch (err) {
      console.error("Audio generation error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="w-1/2 p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Actions</h2>

      <button
        onClick={handleSummarize}
        className="w-full mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      <button
        onClick={handleAskQuestion}
        className="w-full mb-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        {loading ? "Asking..." : "Ask Question"}
      </button>

      <button
        onClick={handleGenerateAudio}
        className="w-full mb-4 bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
      >
        {loading ? "Generating Audio..." : "Generate Audio"}
      </button>

      {summary && (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold">Summary:</h3>
          <p>{summary}</p>
        </div>
      )}

      {answer && (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold">Answer:</h3>
          <p>{answer}</p>
        </div>
      )}

      {audioPath && (
        <div className="mt-4">
          <p>Audio Generated: </p>
          <a href={`http://localhost:5000/${audioPath}`} target="_blank" rel="noreferrer">
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
};

export default FileActions;
