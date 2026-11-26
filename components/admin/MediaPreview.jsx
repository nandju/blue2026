"use client";
import { parseVideoUrl } from "@/lib/uploadLimits";

/** Aperçu d'un média (image, vidéo fichier ou YouTube/Vimeo, PDF). */
export default function MediaPreview({ type, url, alt = "", className = "", onImageLoad, compact = false }) {
  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-[#f7faff] text-gray-300 text-3xl ${className}`}>
        {type === "video" ? "🎬" : type === "pdf" ? "📄" : "🖼️"}
      </div>
    );
  }

  if (type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={alt} onLoad={onImageLoad} className={`object-cover bg-[#f7faff] ${className}`} loading="lazy" />
    );
  }

  if (type === "video") {
    const external = parseVideoUrl(url);
    if (external) {
      return compact ? (
        <div className={`flex flex-col items-center justify-center bg-[#062E52] text-white text-xs gap-1 ${className}`}>
          <span className="text-2xl">▶</span>
          {external.provider === "youtube" ? "YouTube" : "Vimeo"}
        </div>
      ) : (
        <iframe src={external.embedUrl} title="Aperçu de la vidéo" className={`bg-black ${className}`} allowFullScreen
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      );
    }
    return <video src={url} className={`bg-black object-contain ${className}`} controls={!compact} muted={compact} preload="metadata" playsInline />;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`flex flex-col items-center justify-center bg-[#f7faff] text-[#0D6EBB] text-xs gap-1 hover:bg-[rgba(13,110,187,0.08)] ${className}`}>
      <span className="text-3xl">📄</span>
      <span className="truncate max-w-full px-2">{decodeURIComponent(url.split("/").pop() || "Document PDF")}</span>
    </a>
  );
}
