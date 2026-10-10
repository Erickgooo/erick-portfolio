// THROWAWAY: a comparison page for Erick to pick a direction for the Home.
// Lives only on the lab/apple-directions branch and its Vercel Preview; it is
// not meant to be merged. Also reachable as /lab/a, /lab/b and /lab/c.
import { LabPage, labMetadata } from "@/components/lab/LabPage";

export const metadata = labMetadata;

export default async function Lab({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; clean?: string }>;
}) {
  const { v, clean } = await searchParams;
  return <LabPage v={v} clean={Boolean(clean)} />;
}
