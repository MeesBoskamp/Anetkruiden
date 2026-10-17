import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anetkruiden.nl" },
      { name: "description", content: "Anetkruiden.nl" },
      { property: "og:title", content: "Anetkruiden.nl" },
      { property: "og:description", content: "Anetkruiden.nl" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-3xl font-semibold text-foreground">Anetkruiden.nl</h1>
    </main>
  );
}
