// 'use cache'; // Enable for React 19 caching with Next.js canary + experimental.useCache: true

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function DeployToVercel() {
  // 'use cache'; // Enable for React 19 component-level caching

  return (
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
  );
}