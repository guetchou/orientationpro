
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://10.10.0.5:7474/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { email });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Password reset failed');
      }
      
      setSent(true);
      toast.success("Lien de réinitialisation envoyé à votre email");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'envoi du lien de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button 
            variant="ghost" 
            className="w-fit p-0 mb-2" 
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Button>
          <CardTitle className="text-2xl">Réinitialiser votre mot de passe</CardTitle>
          <CardDescription>
            {!sent 
              ? "Entrez votre email pour recevoir un lien de réinitialisation"
              : "Vérifiez votre boîte de réception pour le lien de réinitialisation"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">
                Un email a été envoyé à <strong>{email}</strong> avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEmail("");
                  setSent(false);
                }}
              >
                Essayer avec une autre adresse
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
