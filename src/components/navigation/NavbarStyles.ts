
/**
 * Styles centralisés pour la barre de navigation
 */
export const getNavbarStyles = (scrolled: boolean) => {
  return {
    navbar: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md py-2' : 'bg-transparent py-4'
    }`,
    container: 'container mx-auto px-4 flex items-center justify-between',
    mobileMenuButton: 'md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none'
  };
};
