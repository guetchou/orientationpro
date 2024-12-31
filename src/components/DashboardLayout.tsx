import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "./DashboardNav";
import { toast } from "sonner";

export const DashboardLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r">
          <div className="p-4 border-b">
            <h1 className="font-heading text-xl font-bold text-primary">
              Orientation Pro Congo
            </h1>
          </div>
          <DashboardNav />
        </aside>
        <main className="flex-1">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};