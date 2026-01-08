
import React from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface TestCompleteNotificationProps {
  testName: string;
  onClick?: () => void;
}

export const TestCompleteNotification = ({ testName, onClick }: TestCompleteNotificationProps) => {
  const notify = () => {
    toast.success(`Test ${testName} terminé avec succès!`, {
      description: "Les résultats sont disponibles dans votre tableau de bord.",
      action: {
        label: "Voir",
        onClick: onClick || (() => {}),
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 mb-6"
    >
      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
      <div className="flex-1">
        <h4 className="font-medium text-green-800 dark:text-green-300">Test complété!</h4>
        <p className="text-sm text-green-700 dark:text-green-400">
          Votre test {testName} a été complété avec succès.
        </p>
      </div>
      <button
        onClick={notify}
        className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
      >
        Afficher la notification
      </button>
    </motion.div>
  );
};

export default TestCompleteNotification;
