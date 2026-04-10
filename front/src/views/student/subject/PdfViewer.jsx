/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";

// worker для pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ fileUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: lessonId } = useParams();

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [zoom, setZoom] = useState(window.innerWidth < 1024 ? 3 : 1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef(null);

  // получаем curriculumSubjectId из state
  const curriculumSubjectId = location.state?.curriculumSubjectId;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsFinished(false);
    setHasError(false);
  };

  const onDocumentLoadError = (err) => {
    console.error("❌ PDF yuklashda xatolik:", err);
    setHasError(true);
  };

  const nextPage = () =>
    setPageNumber((prev) => {
      const newPage = prev < numPages ? prev + 1 : prev;
      if (newPage === numPages) setIsFinished(true);
      return newPage;
    });

  const prevPage = () => setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));

  // следим за шириной контейнера
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // ресайз экрана
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setZoom(mobile ? 3 : 1);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleZoom = () => {
    if (!isMobile) return;
    setZoom((prev) => {
      if (prev === 3) return 2;
      if (prev === 2) return 1.5;
      return 3;
    });
  };

  // ✅ Просто navigate назад к списку тем
  const handleFinish = () => {
    if (curriculumSubjectId) {
      navigate(`/student/media-lessons/${curriculumSubjectId}`, {
        replace: true,
      });
    } else {
      navigate("/student/subject", { replace: true });
    }
  };

  if (!fileUrl) {
    return (
      <div className="p-6 text-center text-red-600">❌ Fayl mavjud emas</div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Faylni ochib bo‘lmadi
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div
        ref={containerRef}
        className="w-full max-w-full overflow-x-auto overflow-y-auto rounded border bg-gray-50"
        style={{ height: isMobile ? "80vh" : "auto" }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
        >
          <div
            onClick={toggleZoom}
            className={isMobile ? "inline-block cursor-zoom-in" : ""}
          >
            <Page
              pageNumber={pageNumber}
              width={
                containerWidth
                  ? containerWidth * (isMobile ? zoom : 1)
                  : undefined
              }
            />
          </div>
        </Document>
      </div>

      {numPages && (
        <>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
            >
              ◀ Oldingi
            </button>

            <p>
              Sahifa {pageNumber} / {numPages}
            </p>

            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
            >
              Keyingi ▶
            </button>
          </div>

          {isFinished && (
            <button
              onClick={handleFinish}
              className="mt-6 rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
            >
              ✅ Yakunlash
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PdfViewer;
