// 'use cache'; // Enable for React 19 caching with Next.js canary + experimental.useCache: true

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Demo {
  title: string;
  description: string;
  badge: string;
}

export async function DemoModes() {
  // 'use cache'; // Enable for React 19 component-level caching

  const demos: Demo[] = [
    {
      title: "Standard Upload",
      description: "Simple drag & drop with sensible defaults for all file types",
      badge: "Easy"
    },
    {
      title: "Advanced Configuration",
      description: "Full control over all upload options and settings",
      badge: "Pro"
    }
  ];

  return (
    <section className="py-12 lg:py-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">Two Simple Modes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {demos.map((demo, index) => (
          <Link href="/upload" key={index}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{demo.title}</CardTitle>
                  <Badge variant="secondary">{demo.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{demo.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}