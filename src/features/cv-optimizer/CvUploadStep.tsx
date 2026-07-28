import { useRef, useState } from 'react';
import { FileText, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CV_ACCEPTED_EXTENSIONS, CV_MAX_FILE_SIZE } from './scoreDefs';

const hasAcceptedExtension = (name: string) =>
  CV_ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

// Etape 1 : selection du fichier avec validation cote client (le serveur
// reste l'autorite finale sur le type et la taille).
export const CvUploadStep = ({
  onSelected,
}: {
  onSelected: (file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (candidate: File): string | null => {
    if (!hasAcceptedExtension(candidate.name)) {
      return 'Format non accepté. Utilisez un fichier PDF ou DOCX.';
    }
    if (candidate.size <= 0) {
      return 'Le fichier semble vide.';
    }
    if (candidate.size > CV_MAX_FILE_SIZE) {
      return 'Fichier trop volumineux. La taille maximale est de 5 Mo.';
    }
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
    <div className="mx-auto max-w-xl space-y-4">
      <div
        className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center transition hover:border-emerald-400"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          choose(event.dataTransfer.files?.[0]);
        }}
      >
        <UploadCloud className="mx-auto mb-3 h-10 w-10 text-emerald-700" />
        <p className="font-medium text-stone-900">Déposez votre CV ici, ou</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          Choisir un fichier
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          onChange={(event) => choose(event.target.files?.[0])}
        />
        <p className="mt-3 text-xs text-stone-500">PDF ou DOCX · 5 Mo maximum</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3">
          <span className="flex min-w-0 items-center gap-2 text-sm text-stone-800">
            <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-stone-400">({Math.round(file.size / 1024)} Ko)</span>
          </span>
          <button
            type="button"
            aria-label="Retirer le fichier"
            className="rounded p-1 text-stone-400 hover:text-stone-700"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <p className="flex items-start gap-2 text-xs text-stone-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        Votre fichier est analysé par le moteur ATS MAKOKI côté serveur, puis supprimé. Seul le résultat structuré est conservé
        dans votre historique. Le texte brut du CV n’est pas stocké.
      </p>

      <Button
        className="w-full bg-emerald-700 hover:bg-emerald-800"
        disabled={!file}
        onClick={() => file && onSelected(file)}
      >
        Continuer
      </Button>
    </div>
  );
};
