// 'use cache'; // Enable for React 19 caching with Next.js canary + experimental.useCache: true

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Technology {
  emoji: string;
  name: string;
  description: string;
}

export async function ModernTechnologies() {
  // 'use cache'; // Enable for React 19 component-level caching

  const technologies: Technology[] = [
    {
      emoji: "⚛️",
      name: "React 19",
      description: "Latest features"
    },
    {
      emoji: "▲",
      name: "Next.js 15",
      description: "App Router"
    },
    {
      emoji: "🎨",
      name: "Tailwind v4",
      description: "Modern styling"
    },
    {
      emoji: "🧩",
      name: "shadcn/ui",
      description: "Component library"
    }
  ];

  return (
    <section className="py-12 lg:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl lg:text-3xl text-center">Built With Modern Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {technologies.map((tech, index) => (
              <div key={index} className="space-y-2">
                <div className="text-2xl">{tech.emoji}</div>
                <div className="font-medium">{tech.name}</div>
                <div className="text-sm text-muted-foreground">{tech.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}