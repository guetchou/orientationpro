
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentTheme}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {currentTheme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => {
            setTheme('light');
            setIsOpen(false);
          }}
          className="cursor-pointer flex gap-2 items-center"
        >
          <Sun className="h-4 w-4" />
          <span>Clair</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme('dark');
            setIsOpen(false);
          }}
          className="cursor-pointer flex gap-2 items-center"
        >
          <Moon className="h-4 w-4" />
          <span>Sombre</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme('system');
            setIsOpen(false);
          }}
          className="cursor-pointer flex gap-2 items-center"
        >
          <span className="h-4 w-4 relative">
            <Sun className="h-4 w-4 absolute transition-opacity" style={{ opacity: theme === 'system' ? 0.5 : 0 }} />
            <Moon className="h-4 w-4 absolute transition-opacity" style={{ opacity: theme === 'system' ? 0.5 : 0 }} />
          </span>
          <span>Système</span>
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
