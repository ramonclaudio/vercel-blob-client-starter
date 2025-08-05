# Vercel Blob Client-Side Starter

Complete client-side Vercel Blob starter with Next.js 15 & React 19. Features: drag & drop uploads, progress tracking, multipart support, advanced configuration, file gallery, copy/delete operations, and 100% SDK compliance. Built with TypeScript, Tailwind CSS v4, and shadcn/ui components.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RMNCLDYO/vercel-blob-client-starter&env=BLOB_READ_WRITE_TOKEN&envDescription=Vercel%20Blob%20storage%20token&envLink=https://vercel.com/docs/storage/vercel-blob)

## ✨ Features

- **SDK Compliant** - Parity with official Vercel Blob documentation
- **Drag & Drop Upload** - Elegant upload interface with progress tracking
- **Multipart Support** - Automatic chunking for large files (>100MB)
- **Advanced Configuration** - Complete control over all upload options
- **File Gallery** - Preview, copy, delete, and manage all your blobs
- **Responsive Design** - Works perfectly on all screen sizes
- **Modern UI** - Built with shadcn/ui and Tailwind CSS v4
- **Cancel Uploads** - Full abort signal support for all operations
- **Real-time Progress** - Live upload progress with detailed feedback
- **Type Safe** - Full TypeScript support with strict configuration

## 🛠 Tech Stack

- **Next.js 15** with App Router
- **React 19** with latest features  
- **TypeScript** with strict configuration
- **Tailwind CSS v4** with custom theming
- **shadcn/ui** for all UI components
- **@vercel/blob** for blob storage operations
- **Sonner** for toast notifications

## 🚀 Quick Start

### Deploy to Vercel

Deploy this template in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RMNCLDYO/vercel-blob-client-starter&env=BLOB_READ_WRITE_TOKEN&envDescription=Vercel%20Blob%20storage%20token&envLink=https://vercel.com/docs/storage/vercel-blob)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/RMNCLDYO/vercel-blob-client-starter.git my-blob-app
   cd my-blob-app
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Vercel Blob token to `.env.local`:
   ```env
   BLOB_READ_WRITE_TOKEN=your_blob_token_here
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📖 What You'll Learn

This starter demonstrates **every client-side Vercel Blob feature** with complete SDK compliance:

### Core Upload Features
- ✅ **Client-side uploads** using `upload()` from `@vercel/blob/client`
- ✅ **Progress tracking** with real-time `onUploadProgress` callbacks
- ✅ **Upload cancellation** using `AbortSignal` for user control
- ✅ **Multipart uploads** for large files with automatic chunking
- ✅ **File validation** (type, size, content restrictions)
- ✅ **Bulk upload support** with individual file error handling

### Advanced Configuration
- ✅ **Folder organization** via pathname prefixes (`uploads/images/file.jpg`)
- ✅ **Cache control settings** with custom max-age values
- ✅ **Random suffix control** for unique file naming
- ✅ **File overwrite permissions** with `allowOverwrite` option
- ✅ **Custom JSON metadata** payload support
- ✅ **Content type override** for specific MIME types

### File Management Operations
- ✅ **File duplication** using `copy()` from `@vercel/blob`
- ✅ **Blob metadata retrieval** using `head()` from `@vercel/blob`
- ✅ **Blob listing with pagination** using `list()` from `@vercel/blob`
- ✅ **Blob deletion** using `del()` from `@vercel/blob`
- ✅ **Comprehensive error handling** with `BlobAccessError` detection

## 🏗 Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts        # Client upload token generation
│   │   ├── copy/route.ts          # Blob copy operations
│   │   ├── delete/route.ts        # Blob deletion
│   │   ├── metadata/route.ts      # Blob metadata retrieval
│   │   └── list/route.ts          # Blob listing with pagination
│   ├── upload/page.tsx            # Main upload interface
│   ├── gallery/page.tsx           # File gallery with all operations
│   └── layout.tsx                 # Root layout with Toaster
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── upload/
│   │   ├── UploadZone.tsx         # Drag & drop component
│   │   └── AdvancedConfig.tsx     # Configuration panel
│   └── gallery/
│       └── FileGallery.tsx        # File management interface
├── hooks/
│   ├── useClientUpload.ts         # Upload logic with progress
│   ├── useDeleteBlob.ts           # Blob deletion with abort
│   ├── useCopyBlob.ts             # Blob duplication
│   ├── useBlobMetadata.ts         # Metadata retrieval
│   └── useListBlobs.ts            # Blob listing with pagination
└── lib/
    └── utils.ts                   # Utility functions
```

## 🎯 Key Implementation Highlights

### Two-Tab Interface
- **Standard Upload**: Simple drag & drop with sensible defaults
- **Advanced Configuration**: Complete control over all SDK parameters

### Enterprise-Grade Features
- **Professional UI/UX** with modern drag & drop interface
- **Comprehensive Error Handling** with user-friendly messages
- **State Management** using custom React hooks
- **Real-time Updates** with toast notifications
- **Responsive Design** that works on all devices

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

Get your token from the [Vercel Storage Dashboard](https://vercel.com/dashboard/stores).

## 📚 Learn More

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Client-Side Uploads Guide](https://vercel.com/docs/storage/vercel-blob/client-uploads)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request [here](https://github.com/RMNCLDYO/vercel-blob-client-starter/pulls).

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.