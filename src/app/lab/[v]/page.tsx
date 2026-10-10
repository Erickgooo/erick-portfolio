// THROWAWAY: the same lab page with the direction in the path, so the link
// works without a query string.
import { DIRECTIONS, LabPage, labMetadata } from "@/components/lab/LabPage";

export const metadata = labMetadata;

export function generateStaticParams() {
  return DIRECTIONS.map((item) => ({ v: item.id }));
}

export default async function LabDirection({ params }: { params: Promise<{ v: string }> }) {
  const { v } = await params;
  return <LabPage v={v} />;
}
