import { useRef, useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CV_ACCEPTED_EXTENSIONS, CV_MAX_FILE_SIZE } from './scoreDefs';

const hasAcceptedExtension = (name: string) =>
  CV_ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

export const CvUploadStep = ({
  onSelected,
}: {
  onSelected: (file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (candidate: File): string | null => {
    if (!hasAcceptedExtension(candidate.name)) return 'Format non accepté. Choisis un fichier PDF ou DOCX.';
    if (candidate.size <= 0) return 'Le fichier semble vide.';
    if (candidate.size > CV_MAX_FILE_SIZE) return 'Fichier trop volumineux. La taille maximale est de 5 Mo.';
    return null;
  };

  const choose = (candidate: File | undefined) => {
    if (!candidate) return;
    const validationError = validate(candidate);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(candidate);
  };

  return (
    <section className="space-y-4" aria-labelledby="cv-upload-title">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Étape 1 · Analyse de ton CV</p>
        <h2 id="cv-upload-title" className="mt-1 font-heading text-2xl font-bold text-stone-900">
          Commence par ton CV
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-stone-600">
          Makoki vérifie d’abord sa structure, sa clarté et son impact. Tu cibleras ensuite un poste à partir d’une base solide.
        </p>
      </div>

      <div
        className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-7 text-center transition hover:border-emerald-500 hover:bg-emerald-50/20"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          choose(event.dataTransfer.files?.[0]);
        }}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-emerald-700" />
        <p className="mt-3 font-semibold text-stone-900">Dépose ton CV ici</p>
        <p className="mt-1 text-sm text-stone-500">PDF ou DOCX · 5 Mo maximum</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
          Choisir mon CV
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          aria-label="Choisir un CV au format PDF ou DOCX"
          onChange={(event) => choose(event.target.files?.[0])}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>
      ) : null}

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <span className="flex min-w-0 items-center gap-2 text-sm text-stone-800">
            <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
            <span className="truncate font-medium">{file.name}</span>
            <span className="shrink-0 text-stone-500">({Math.round(file.size / 1024)} Ko)</span>
          </span>
          <button
            type="button"
            aria-label="Retirer le fichier"
            className="rounded p-1 text-stone-500 hover:bg-white hover:text-stone-800"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-stone-500">
          Si tu continues vers la connexion, ce CV est conservé temporairement dans ce navigateur pour reprendre l’analyse sans le sélectionner à nouveau.
        </p>
        <Button
          className="shrink-0 bg-emerald-700 px-7 hover:bg-emerald-800"
          size="lg"
          disabled={!file}
          onClick={() => file && onSelected(file)}
        >
          Analyser mon CV
        </Button>
      </div>
    </section>
  );
};
