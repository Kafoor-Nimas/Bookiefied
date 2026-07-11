"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/nextjs";

// ─── Validation Schema ────────────────────────────────────────────────────────
const formSchema = z.object({
  pdf: z
    .instanceof(File, { message: "Please upload a PDF file." })
    .refine((f) => f.type === "application/pdf", "File must be a PDF.")
    .refine((f) => f.size <= 50 * 1024 * 1024, "File must be under 50MB."),
  coverImage: z.instanceof(File).optional(),
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author name is required."),
  voice: z.string().min(1, "Please select a voice."),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Voice Data ───────────────────────────────────────────────────────────────
const voices = {
  male: [
    {
      id: "dave",
      name: "Dave",
      desc: "Young male, British-Essex, casual & conversational",
    },
    {
      id: "daniel",
      name: "Daniel",
      desc: "Middle-aged male, British, authoritative but warm",
    },
    { id: "chris", name: "Chris", desc: "Male, casual & easy-going" },
  ],
  female: [
    {
      id: "rachel",
      name: "Rachel",
      desc: "Young female, American, calm & clear",
    },
    {
      id: "sarah",
      name: "Sarah",
      desc: "Young female, American, soft & approachable",
    },
  ],
};

// ─── Loading Overlay ──────────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
    <div
      className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
      style={{ borderColor: "#663820", borderTopColor: "transparent" }}
    />
    <p className="text-sm font-medium" style={{ color: "#663820" }}>
      Processing your book…
    </p>
  </div>
);

// ─── Dropzone Component ───────────────────────────────────────────────────────
type DropzoneProps = {
  accept: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  file: File | undefined;
  onChange: (file: File | undefined) => void;
  error?: string;
};

const Dropzone = ({
  accept,
  icon,
  label,
  hint,
  file,
  onChange,
  error,
}: DropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange(dropped);
  };

  return (
    <div>
      <div
        className={`upload-dropzone ${dragging ? "border-[#663820]" : ""} ${error ? "border-red-400" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0])}
        />

        {file ? (
          <div
            className="flex items-center gap-3 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#663820"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-sm text-[#3d2e1e] font-medium flex-1 truncate">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs text-[#9a7c5f] hover:text-red-500 transition-colors ml-auto shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            {icon}
            <span className="text-sm text-[#5a4535]">{label}</span>
            <span className="text-xs text-[#9a7c5f]">{hint}</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9a7c5f"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ImageIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9a7c5f"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted,setIsMounted] = useState(false);
  const {userId}=useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", author: "", voice: "rachel" },
  });

  const onSubmit = async (values: BookUploadFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting:", values);
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

      <div className="new-book-wrapper">
        <p className="text-xs text-[#9a7c5f] mb-6">
          5 of 10 books used{" "}
          <span className="underline cursor-pointer hover:text-[#663820]">
            (Upgrade)
          </span>
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* PDF Upload */}
          <Controller
            control={form.control}
            name="pdf"
            render={({ field, fieldState }) => (
              <div>
                <label className="form-label">Book PDF File</label>
                <Dropzone
                  accept="application/pdf"
                  icon={<UploadIcon />}
                  label="Click to upload PDF"
                  hint="PDF file (max 50MB)"
                  file={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          {/* Cover Image Upload */}
          <Controller
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <div>
                <label className="form-label">Cover Image (Optional)</label>
                <Dropzone
                  accept="image/*"
                  icon={<ImageIcon />}
                  label="Click to upload cover image"
                  hint="Leave empty to auto-generate from PDF"
                  file={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          {/* Title */}
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <div>
                <label className="form-label">Title</label>
                <input
                  {...field}
                  className="form-input"
                  placeholder="ex: Rich Dad Poor Dad"
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Author */}
          <Controller
            control={form.control}
            name="author"
            render={({ field, fieldState }) => (
              <div>
                <label className="form-label">Author Name</label>
                <input
                  {...field}
                  className="form-input"
                  placeholder="ex: Robert Kiyosaki"
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Voice Selector */}
          <Controller
            control={form.control}
            name="voice"
            render={({ field, fieldState }) => (
              <div>
                <label className="form-label">Choose Assistant Voice</label>
                <div className="space-y-4">
                  {/* Male Voices */}
                  <div>
                    <p className="text-xs text-[#9a7c5f] mb-2">Male Voices</p>
                    <div className="grid grid-cols-3 gap-3">
                      {voices.male.map((v) => (
                        <label
                          key={v.id}
                          className={`voice-selector-option ${field.value === v.id ? "voice-selector-option-selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="voice"
                            value={v.id}
                            checked={field.value === v.id}
                            onChange={() => field.onChange(v.id)}
                            className="mt-0.5 shrink-0 accent-[#663820]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#1a1208]">
                              {v.name}
                            </p>
                            <p className="text-xs text-[#9a7c5f] leading-snug mt-0.5">
                              {v.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Female Voices */}
                  <div>
                    <p className="text-xs text-[#9a7c5f] mb-2">Female Voices</p>
                    <div className="grid grid-cols-2 gap-3">
                      {voices.female.map((v) => (
                        <label
                          key={v.id}
                          className={`voice-selector-option ${field.value === v.id ? "voice-selector-option-selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="voice"
                            value={v.id}
                            checked={field.value === v.id}
                            onChange={() => field.onChange(v.id)}
                            className="mt-0.5 shrink-0 accent-[#663820]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#1a1208]">
                              {v.name}
                            </p>
                            <p className="text-xs text-[#9a7c5f] leading-snug mt-0.5">
                              {v.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Submit */}
          <button type="submit" className="form-btn" disabled={isSubmitting}>
            {isSubmitting ? "Processing…" : "Begin Synthesis"}
          </button>
        </form>
      </div>
    </>
  );
}
