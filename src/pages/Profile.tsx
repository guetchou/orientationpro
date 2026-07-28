import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileForm {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  education_level: string;
  current_job: string;
  bio: string;
}

const emptyProfile: ProfileForm = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  education_level: '',
  current_job: '',
  bio: '',
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const user = authData.user;
        if (!user?.email) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('email, first_name, last_name, phone, education_level, current_job, bio')
          .eq('email', user.email)
          .maybeSingle();
        if (error) throw error;

        setProfile({
          email: user.email,
          first_name: data?.first_name ?? '',
          last_name: data?.last_name ?? '',
          phone: data?.phone ?? '',
          education_level: data?.education_level ?? '',
          current_job: data?.current_job ?? '',
          bio: data?.bio ?? '',
        });
      } catch (error) {
        console.error('Unable to load profile', error);
        toast.error('Impossible de charger votre profil.');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user?.id || !user.email) throw new Error('Utilisateur non connecté');

      const { error } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email,
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null,
          phone: profile.phone || null,
          education_level: profile.education_level || null,
          current_job: profile.current_job || null,
          bio: profile.bio || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      );
      if (error) throw error;
      toast.success('Profil enregistré.');
    } catch (error) {
      console.error('Unable to save profile', error);
      toast.error("Impossible d'enregistrer votre profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Mon profil</CardTitle>
            <CardDescription>Ces informations personnalisent vos résultats et recommandations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="first_name">Prénom</Label><Input id="first_name" value={profile.first_name} onChange={(e) => updateField('first_name', e.target.value)} /></div>
              <div><Label htmlFor="last_name">Nom</Label><Input id="last_name" value={profile.last_name} onChange={(e) => updateField('last_name', e.target.value)} /></div>
            </div>
            <div><Label htmlFor="email">E-mail</Label><Input id="email" value={profile.email} disabled /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="phone">Téléphone</Label><Input id="phone" value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} /></div>
              <div><Label htmlFor="education">Niveau d'études</Label><Input id="education" value={profile.education_level} onChange={(e) => updateField('education_level', e.target.value)} /></div>
            </div>
            <div><Label htmlFor="job">Activité actuelle</Label><Input id="job" value={profile.current_job} onChange={(e) => updateField('current_job', e.target.value)} /></div>
            <div><Label htmlFor="bio">Présentation</Label><Textarea id="bio" rows={5} value={profile.bio} onChange={(e) => updateField('bio', e.target.value)} /></div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
