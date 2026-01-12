import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "@/styles/landing.css"; // NEW

export const metadata = {
  title: "TogetherTask - Task Management for Couples",
  description:
    "The perfect task management app designed for couples. Share tasks, sync schedules, and stay organized together with AI assistance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
