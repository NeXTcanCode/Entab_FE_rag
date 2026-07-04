const GitHubIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.09.68-.22.68-.48v-1.68c-2.79.62-3.38-1.37-3.38-1.37-.46-1.2-1.12-1.52-1.12-1.52-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.89c.85 0 1.71.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.56 1.42.21 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.69.96.69 1.94v2.87c0 .26.18.58.69.48A10.3 10.3 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
  </svg>
);

const profiles = [
  { label: "Aleena Gibi", href: "https://github.com/aleenagibi" },
  { label: "NeXTcanCode", href: "https://github.com/NeXTcanCode" },
];

export default function GitHubLinks() {
  return (
    <div className="github-links" aria-label="GitHub profiles">
      {profiles.map((profile) => (
        <a
          key={profile.href}
          href={profile.href}
          target="_blank"
          rel="noreferrer"
          title={`${profile.label} on GitHub`}
        >
          <GitHubIcon />
          <span>{profile.label}</span>
        </a>
      ))}
    </div>
  );
}
