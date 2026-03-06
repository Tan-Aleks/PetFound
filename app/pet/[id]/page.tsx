import PetDetailsClient from './PetDetailsClient'

export default async function PetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PetDetailsClient id={id} />
}
