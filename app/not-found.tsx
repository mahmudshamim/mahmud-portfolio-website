export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f3ef',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <h1 style={{ fontFamily: 'sans-serif', fontSize: 80, color: '#e2701f', margin: 0 }}>404</h1>
      <p style={{ fontFamily: 'sans-serif', fontSize: 18, color: 'rgba(22,21,15,0.5)' }}>Page not found</p>
      <a href="/" style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#e2701f' }}>← Go home</a>
    </div>
  )
}
