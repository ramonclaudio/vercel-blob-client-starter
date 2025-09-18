import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 600,
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
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              backgroundColor: 'white',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
              fontSize: 36,
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            V
          </div>
          <div style={{ fontSize: 64, fontWeight: 'bold' }}>
            Vercel Blob
          </div>
        </div>

        <div
          style={{
            fontSize: 42,
            color: '#888888',
            marginBottom: 28,
          }}
        >
          Client Starter Kit
        </div>

        <div
          style={{
            fontSize: 22,
            color: '#cccccc',
            textAlign: 'center',
            marginBottom: 36,
            maxWidth: 700,
          }}
        >
          Complete client-side upload solution with Next.js 15 and React 19
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
          }}
        >
          <div
            style={{
              backgroundColor: '#333333',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 16,
            }}
          >
            Next.js 15
          </div>
          <div
            style={{
              backgroundColor: '#333333',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 16,
            }}
          >
            React 19
          </div>
          <div
            style={{
              backgroundColor: '#333333',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 16,
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