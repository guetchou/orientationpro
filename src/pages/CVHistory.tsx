import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface CVHistoryItem {
  id: number;
  file_name: string;
  upload_date: string;
  ats_score: number;
  feedback?: string;
  processing_status: string;
}

export default function CVHistoryPage() {
  const [history, setHistory] = useState<CVHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le token utilisateur
    const userToken = localStorage.getItem('userToken');
    fetch('/api/cv/history', {
      headers: {
        Authorization: userToken ? `Bearer ${userToken}` : ''
      }
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error(res.status === 401
            ? 'Votre session a expiré. Veuillez vous reconnecter.'
            : 'Impossible de charger votre historique de CV.');
        }
        return res.json();
      })
      .then(data => {
        setHistory(data.history || []);
      })
      .catch(fetchError => {
        setError(fetchError instanceof Error ? fetchError.message : 'Une erreur est survenue.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Historique de mes analyses de CV</h1>
      {loading ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : error ? (
        <div role="alert" className="text-center text-red-700">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500">Aucune analyse de CV trouvée.</div>
      ) : (
        <div className="grid gap-6 max-w-3xl mx-auto">
          {history.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold">{item.file_name}</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(item.upload_date).toLocaleString()}</span>
                </div>
                <span className="text-blue-700 font-bold">Score ATS : {item.ats_score} / 100</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Feedback :</span> <span className="text-gray-700">{item.feedback}</span>
              </div>
              <div className="text-sm text-gray-500">
                Statut : {item.processing_status}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={async () => {
                  const userToken = localStorage.getItem('userToken');
                  const res = await fetch(`/api/cv/report/${item.id}/pdf`, {
                    headers: { Authorization: userToken ? `Bearer ${userToken}` : '' }
                  });
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `rapport-cv-${item.id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                }}
              >
                Télécharger le rapport PDF
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
