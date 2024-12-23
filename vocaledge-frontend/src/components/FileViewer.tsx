import React from "react";

interface FileViewerProps {
  content: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ content }) => {
  return (
    <div className="w-1/2 p-4 bg-gray-100 border-r">
      <h2 className="text-xl font-bold mb-4">File Content</h2>
      <textarea
        value={content}
        readOnly
        className="w-full h-[80vh] p-2 border rounded bg-white focus:outline-none"
      ></textarea>
    </div>
  );
};

export default FileViewer;
