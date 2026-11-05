import { GalleryDetail } from "@/components/admin/GalleryDetail";

export default async function AdminGalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GalleryDetail albumId={id} />;
}
