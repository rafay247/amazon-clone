"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  width = "max-w-md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // No close() in cleanup: it fires the dialog's close event, which would call onClose
    // during React's dev double-mount and instantly shut the modal. Unmounting removes it anyway.
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-32px)] ${width} overflow-hidden rounded-lg p-0 shadow-2xl backdrop:bg-black/60`}
    >
      <div className="flex items-center justify-between border-b border-line bg-[#f0f2f2] px-5 py-3.5">
        <h2 className="font-bold">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-black/5">
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
