type SocialProviderIconProps = {
  provider: 'google' | 'meta';
};

export const SocialProviderIcon = ({ provider }: SocialProviderIconProps) => {
  if (provider === 'google') {
    return (
      <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.615Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.715H.957v2.332A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.281-1.707V4.961H.957A9 9 0 0 0 0 9c0 1.452.347 2.827.957 4.039l3.006-2.332Z" />
        <path fill="#EA4335" d="M9 3.578c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.891 11.426 0 9 0A9 9 0 0 0 .957 4.961l3.006 2.332C4.672 5.163 6.656 3.578 9 3.578Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M16.671 15.469 17.203 12h-3.328V9.75c0-.949.465-1.875 1.956-1.875h1.513V4.922s-1.373-.234-2.686-.234c-2.741 0-4.533 1.661-4.533 4.668V12H7.078v3.469h3.047v8.384a12.2 12.2 0 0 0 3.75 0v-8.384h2.796Z" />
    </svg>
  );
};
