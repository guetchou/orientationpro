import { useRef, useState } from 'react';
import { FileText, Info, ShieldCheck, UploadCloud, X } from 'lucide-react';
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
    if (!hasAcceptedExtension(candidate.name)) {
      return 'Format non accepté. Choisis un fichier PDF ou DOCX.';
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
    <section className="mx-auto max-w-xl space-y-4" aria-labelledby="cv-upload-title">
      <div>
        <p className="text-sm font-medium text-emerald-700">Étape 1 sur 3</p>
        <h2 id="cv-upload-title" className="mt-1 text-xl font-semibold text-stone-900">
          Ajoute ton CV
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Choisis la version que tu souhaites vérifier. Tu pourras ensuite préciser le poste que tu vises.
        </p>
      </div>

      <div
        className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center transition hover:border-emerald-400"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          choose(event.dataTransfer.files?.[0]);
        }}
      >
        <UploadCloud className="mx-auto mb-3 h-10 w-10 text-emerald-700" />
        <p className="font-medium text-stone-900">Dépose ton CV ici</p>
        <p className="mt-1 text-sm text-stone-500">ou sélectionne-le depuis ton appareil</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
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
        <p className="mt-3 text-xs text-stone-500">PDF ou DOCX · 5 Mo maximum</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
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

      <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-xs text-stone-600">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          Ton fichier est transmis au serveur uniquement pour réaliser l’analyse. Ton historique affiche le résultat structuré de cette analyse.
        </p>
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
          Le fichier sélectionné reste dans cette session. Si tu actualises la page avant l’analyse, tu devras le choisir de nouveau.
        </p>
      </div>

      <Button
        className="w-full bg-emerald-700 hover:bg-emerald-800"
        size="lg"
        disabled={!file}
        onClick={() => file && onSelected(file)}
      >
        Ajouter le poste visé
      </Button>
    </section>
  );
};
