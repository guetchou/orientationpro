import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasMultipleAuthSpaces, spacesForRoles } from '@/lib/authDestination';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PROMPT_KEY = 'makoki:space-selector-shown';

type RoleSpaceSwitcherProps = {
  autoPrompt?: boolean;
  className?: string;
  showTrigger?: boolean;
};

export const RoleSpaceSwitcher = ({
  autoPrompt = false,
  className,
  showTrigger = true,
}: RoleSpaceSwitcherProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const spaces = useMemo(() => spacesForRoles(roles), [roles]);
  const multipleSpaces = hasMultipleAuthSpaces(roles);

  useEffect(() => {
    if (!autoPrompt || !multipleSpaces || sessionStorage.getItem(PROMPT_KEY)) return;
    sessionStorage.setItem(PROMPT_KEY, 'true');
    setOpen(true);
  }, [autoPrompt, multipleSpaces]);

  if (!multipleSpaces) return null;

  const selectSpace = (destination: string) => {
    setOpen(false);
    navigate(destination);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" className={className || 'w-full justify-start'}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Changer d’espace
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Continuer dans quel espace ?</DialogTitle>
          <DialogDescription>
            Seuls les espaces correspondant aux rôles attribués à ton compte sont proposés.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 pt-2">
          {spaces.map((space) => (
            <Button
              key={`${space.role}:${space.destination}`}
              type="button"
              variant="outline"
              className="h-auto justify-start px-4 py-3 text-left"
              onClick={() => selectSpace(space.destination)}
            >
              <span>
                <span className="block font-semibold">{space.label}</span>
                <span className="block text-xs font-normal text-slate-500">{space.destination}</span>
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
