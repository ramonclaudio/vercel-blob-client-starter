import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, FileText, Settings, Zap, Shield, Globe, Images } from "lucide-react";

export default function Home() {
  const features = [
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

  const demos = [
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="pt-12 lg:pt-20 pb-8 lg:pb-12">
        <div className="text-center mb-8 lg:mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Upload className="size-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Vercel Blob Client Starter
            </h1>
          </div>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            The ultimate showcase of Vercel Blob client-side upload features. 
            Built with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/upload">
                <Upload className="size-5 mr-2" />
                Try Upload Demo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/gallery">
                <Images className="size-5 mr-2" />
                Browse Gallery
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <a href="https://vercel.com/docs/storage/vercel-blob" target="_blank" rel="noopener noreferrer">
                <FileText className="size-5 mr-2" />
                Documentation
              </a>
            </Button>
          </div>
        </div>

      </section>

      {/* Features Section */}
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

      {/* Demo Sections */}
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

      {/* Tech Stack */}
      <section className="py-12 lg:py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl text-center">Built With Modern Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl">⚛️</div>
                <div className="font-medium">React 19</div>
                <div className="text-sm text-muted-foreground">Latest features</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">▲</div>
                <div className="font-medium">Next.js 15</div>
                <div className="text-sm text-muted-foreground">App Router</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">🎨</div>
                <div className="font-medium">Tailwind v4</div>
                <div className="text-sm text-muted-foreground">Modern styling</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">🧩</div>
                <div className="font-medium">shadcn/ui</div>
                <div className="text-sm text-muted-foreground">Component library</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Deploy to Vercel */}
      <section className="py-12 lg:py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl text-center">Deploy to Vercel</CardTitle>
            <CardDescription className="text-center text-lg">
              Deploy your own instance with one click
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Ready to deploy? Click the button below to deploy this Vercel Blob starter to your own Vercel account. 
              You&apos;ll need to add your Vercel Blob token in the environment variables.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <a 
                href="https://vercel.com/new/clone?repository-url=https://github.com/RMNCLDYO/vercel-blob-client-starter&env=BLOB_READ_WRITE_TOKEN&envDescription=Your%20Vercel%20Blob%20read-write%20token&envLink=https://vercel.com/docs/storage/vercel-blob/quickstart"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span className="mr-2">▲</span>
                Deploy to Vercel
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
