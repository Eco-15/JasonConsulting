import { ClientSidebar } from '@/components/client/client-sidebar'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto bg-white p-8">
        {children}
      </main>
    </div>
  )
}
