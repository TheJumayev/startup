import React, { useState } from "react";
import Modal from "react-modal";
import { FiEye, FiDownload } from "react-icons/fi";
import { baseUrl } from "../../../config";

Modal.setAppElement("#root");

const FileViewer = ({ file }) => {
    const [open, setOpen] = useState(false);

    if (!file) return null;

    const fileUrl = `${baseUrl}/api/v1/file/preview/${file.id}`; // or your download endpoint
    const downloadUrl = `${baseUrl}/api/v1/file/download/${file.id}`;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setOpen(true)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
                <FiEye /> Ko'rish
            </button>

            <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
            >
                <FiDownload /> Yuklab olish
            </a>

            <Modal
                isOpen={open}
                onRequestClose={() => setOpen(false)}
                contentLabel="Faylni ko'rish"
                className="max-w-5xl mx-auto mt-20 bg-white rounded-lg shadow-xl p-5"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">📄 Faylni ko'rish</h3>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-red-500 hover:text-red-700 font-bold"
                    >
                        ✕
                    </button>
                </div>
                <iframe
                    src={fileUrl}
                    title="File Preview"
                    className="w-full h-[80vh] border rounded-md"
                />
            </Modal>
        </div>
    );
};

export default FileViewer;
