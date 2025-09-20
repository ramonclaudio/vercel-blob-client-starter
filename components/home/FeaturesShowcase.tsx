// 'use cache'; // Enable for React 19 caching with Next.js canary + experimental.useCache: true

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Settings, Zap, Shield, Globe } from "lucide-react";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

export async function FeaturesShowcase() {
  // 'use cache'; // Enable for React 19 component-level caching

  const features: Feature[] = [
    {
      icon: Upload,
      title: "Drag & Drop Upload",
      description: "Intuitive drag and drop interface with file picker fallback",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Progress Tracking",
      description: "Real-time upload progress with cancellation support",
      color: "text-yellow-500"
    },
    {
      icon: ImageIcon,
      title: "File Previews",
      description: "Preview images, videos, PDFs, and documents",
      color: "text-green-500"
    },
    {
      icon: Settings,
      title: "Advanced Options",
      description: "Custom file types, sizes, cache control, and more",
      color: "text-purple-500"
    },
    {
      icon: Shield,
      title: "Secure Uploads",
      description: "Token-based authentication with configurable restrictions",
      color: "text-red-500"
    },
    {
      icon: Globe,
      title: "Multi-format Support",
      description: "Images, videos, documents, and custom file types",
      color: "text-cyan-500"
    }
  ];

  return (
    <section className="pt-8 lg:pt-12 pb-12 lg:pb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">Features Showcase</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className={`size-6 ${feature.color}`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}