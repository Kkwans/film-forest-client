import VarietyDetailClient from './VarietyDetailClient';
import { getDetailMetadata } from '@/lib/metadata';

// ISR: 综艺详情页每小时重新验证
export const revalidate = 3600;

async function fetchVariety(id: number) {
  try {
    const res = await fetch(`http://localhost:8080/api/varieties/${id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const d = data?.data;
    if (!d || !d.id) return null;
    return { id: d.id, title: d.title, year: d.year, storyline: d.storyline || '' };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await fetchVariety(Number(id));
  return getDetailMetadata('variety', item);
}

export default function VarietyDetailPage() {
  return <VarietyDetailClient />;
}
