
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface RegisterFormProps {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function RegisterForm({
  email,
  password,
  loading,
  error,
  isSupabaseConfigured,
  handleEmailChange,
  handlePasswordChange,
  handleSubmit,
}: RegisterFormProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md bg-red-50 p-4"
        >
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
          {error.includes("existe déjà") && (
            <p className="mt-2 text-sm text-red-700">
              <Link
                to="/login"
                className="font-medium text-red-700 hover:text-red-600 underline"
              >
                Connectez-vous ici
              </Link>
            </p>
          )}
        </motion.div>
      )}

      <div className="rounded-md space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="vous@exemple.com"
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={handlePasswordChange}
              placeholder="Minimum 6 caractères"
              className="pl-10"
              minLength={6}
            />
          </div>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full relative"
          disabled={loading || !isSupabaseConfigured}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            "S'inscrire"
          )}
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Déjà inscrit ?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Connectez-vous ici
          </Link>
        </p>
        <p className="text-xs text-gray-500">
          En vous inscrivant, vous acceptez nos{" "}
          <a href="#" className="underline hover:text-gray-700">
            conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="underline hover:text-gray-700">
            politique de confidentialité
          </a>
        </p>
      </div>
    </form>
  );
}
