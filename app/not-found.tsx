export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050508',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <h1 style={{ fontFamily: 'sans-serif', fontSize: 80, color: '#4f8ef7', margin: 0 }}>404</h1>
      <p style={{ fontFamily: 'sans-serif', fontSize: 18, color: 'rgba(226,226,240,0.5)' }}>Page not found</p>
      <a href="/" style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#4f8ef7' }}>← Go home</a>
    </div>
  )
}
