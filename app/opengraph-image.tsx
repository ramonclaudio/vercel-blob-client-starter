import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export const alt = 'Vercel Blob Client Starter Kit'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: 'white',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
              fontSize: 40,
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            V
          </div>
          <div style={{ fontSize: 72, fontWeight: 'bold' }}>
            Vercel Blob
          </div>
        </div>

        <div
          style={{
            fontSize: 48,
            color: '#888888',
            marginBottom: 32,
          }}
        >
          Client Starter Kit
        </div>

        <div
          style={{
            fontSize: 24,
            color: '#cccccc',
            textAlign: 'center',
            marginBottom: 40,
            maxWidth: 800,
          }}
        >
          Complete client-side upload solution with Next.js 15 and React 19
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#333333',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 18,
            }}
          >
            Next.js 15
          </div>
          <div
            style={{
              backgroundColor: '#333333',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 18,
            }}
          >
            React 19
          </div>
          <div
            style={{
              backgroundColor: '#333333',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 18,
            }}
          >
            TypeScript
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}