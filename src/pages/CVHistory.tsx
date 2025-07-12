import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export default function CVHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le token utilisateur
    const userToken = localStorage.getItem('userToken');
    fetch('/api/cv/history', {
      headers: {
        Authorization: userToken ? `Bearer ${userToken}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Historique de mes analyses de CV</h1>
      {loading ? (
        <div className="text-center text-gray-500">Chargement...</div>
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
              <details>
                <summary className="cursor-pointer font-semibold text-blue-600">Voir le texte extrait</summary>
                <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs max-h-48 overflow-auto whitespace-pre-wrap">{item.extracted_text}</pre>
              </details>
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