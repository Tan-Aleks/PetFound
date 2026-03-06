import ChatPageClient from './ChatPageClient'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ petId: string }>
}) {
  const { petId } = await params
  return <ChatPageClient petId={petId} />
}
