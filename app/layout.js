import './globals.css'

export const metadata = {
  title: 'KhawarAI – Smart AI Chat',
  description: 'Multi-purpose AI chatbot powered by Groq AI. Built with Next.js & Supabase.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
