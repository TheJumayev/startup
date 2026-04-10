/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ApiCall, { baseUrl } from "../../../../../config";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfModalViewer({ onClose, title }) {
  const { id: mustaqilId } = useParams();
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [started, setStarted] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /* ================= FULLSCREEN ================= */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = document.querySelector(".pdf-modal-container");
    if (!el) return;
    document.fullscreenElement
      ? document.exitFullscreen()
      : el.requestFullscreen();
  };

  /* ================= LOAD PDF ================= */
  useEffect(() => {
    if (!mustaqilId) return;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setErr("");

        const infoRes = await ApiCall(
          `/api/v1/mustaqil-talim-create/one/${mustaqilId}`,
          "GET"
        );

        const attachment = infoRes.data?.attachment;
        if (!attachment?.id) throw new Error("PDF not found");

        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${baseUrl}/api/v1/file/getFile/${attachment.id}`,
          {
            responseType: "arraybuffer",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const blob = new Blob([res.data], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(blob));
      } catch {
        setErr("PDF yuklanmadi");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [mustaqilId]);

  /* ================= LOAD STUDENT ================= */
  useEffect(() => {
    const loadStudent = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      setStudentId(res.data.id);
    };
    loadStudent();
  }, []);

  /* ================= START ================= */
  const handleStart = async () => {
    if (!studentId) return;

    setStarted(true);
    setPage(1);

    await ApiCall("/api/v1/complete-mustaqil", "POST", {
      studentId,
      createMustaqilTalimId: mustaqilId,
      pageCount: totalPages,
    });

    const activeRes = await ApiCall(
      `/api/v1/complete-mustaqil/${studentId}/${mustaqilId}`,
      "GET"
    );

    setActiveId(activeRes.data.id);
  };

  /* ================= NAVIGATION ================= */
  const handleNext = async () => {
    if (page >= totalPages || !activeId) return;

    const next = page + 1;
    setPage(next);

    await ApiCall(`/api/v1/complete-mustaqil/${activeId}`, "PUT", {
      pageCounter: next,
      pageCount: totalPages,
    });
  };

  const handlePrev = async () => {
    if (page <= 1 || !activeId) return;

    const prev = page - 1;
    setPage(prev);

    await ApiCall(`/api/v1/complete-mustaqil/${activeId}`, "PUT", {
      pageCounter: prev,
    });
  };

  /* ================= FINISH ================= */
  const handleFinish = async () => {
    if (!activeId) return;
    await ApiCall(`/api/v1/complete-mustaqil/finish/${activeId}`, "PUT");
    handleClose();
  };

  const handleClose = () => (onClose ? onClose() : navigate(-1));

  const isLastPage = page === totalPages;

  /* ================= RENDER ================= */
  return (
    <div className="pdf-modal-container bg-black fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex h-full w-full flex-col bg-white">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <button onClick={handleClose}>
            <X />
          </button>

          <div className="truncate font-semibold">{title || "Mavzu"}</div>

          <div className="flex items-center gap-2">
            <button onClick={() => setScale((s) => Math.max(s - 0.1, 0.6))}>
              <ZoomOut />
            </button>

            <span>{Math.round(scale * 100)}%</span>

            <button onClick={() => setScale((s) => Math.min(s + 0.1, 3))}>
              <ZoomIn />
            </button>

            <button onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            </button>

            {!started && (
              <button
                onClick={handleStart}
                className="flex items-center gap-1 rounded bg-blue-600 px-4 py-1 text-white"
              >
                <Play size={16} /> Boshlash
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-900">
          {loading && <div className="text-white">Yuklanmoqda...</div>}
          {err && <div className="text-red-500">{err}</div>}

          {pdfUrl && (
            <div
              className="
                mx-auto
                flex
                w-full
                justify-center
                px-2
                sm:px-4
                md:max-w-3xl
                lg:max-w-4xl
                xl:max-w-5xl
              "
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
              >
                <Page
                  pageNumber={page}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {started && totalPages > 0 && (
          <div className="flex items-center justify-center gap-4 border-t bg-white py-3">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              className="p-2 disabled:opacity-30"
            >
              <ChevronLeft size={28} />
            </button>

            {!isLastPage ? (
              <button onClick={handleNext} className="p-2">
                <ChevronRight size={28} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="rounded bg-green-600 px-6 py-2 font-bold text-white"
              >
                ✅ Yakunlash
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
