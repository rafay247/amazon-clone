"use client";
import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-2 md:flex-col" aria-label="Product images">
          {images.map((src, k) => (
            <li key={src}>
              <button
                onMouseEnter={() => setI(k)}
                onFocus={() => setI(k)}
                onClick={() => setI(k)}
                aria-label={`Image ${k + 1}`}
                aria-current={k === i}
                className={`flex size-12 items-center justify-center overflow-hidden rounded-md border bg-white p-0.5 ${k === i ? "border-link shadow-[0_0_3px_2px_rgba(228,121,17,.5)]" : "border-[#a2a6ac]"}`}
              >
                <Image src={src} alt="" width={44} height={44} className="max-h-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => setZoom(true)}
        className="flex aspect-square flex-1 cursor-zoom-in items-center justify-center md:max-h-[520px]"
        aria-label="View full image"
      >
        <Image src={images[i]} alt={title} width={520} height={520} preload className="max-h-full w-auto object-contain" />
      </button>
      {zoom && (
        <Modal title={title} onClose={() => setZoom(false)} width="max-w-4xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <Image src={images[i]} alt={title} width={700} height={700} className="max-h-[70vh] flex-1 object-contain" />
            <div className="flex flex-wrap gap-2 md:w-40 md:flex-col">
              {images.map((src, k) => (
                <button
                  key={src}
                  onClick={() => setI(k)}
                  className={`size-16 rounded border p-1 ${k === i ? "border-orange" : "border-line"}`}
                  aria-label={`Image ${k + 1}`}
                >
                  <Image src={src} alt="" width={60} height={60} className="max-h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
