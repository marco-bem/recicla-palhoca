import type { Colors } from '@/constants/theme';

type MaterialCategory = keyof typeof Colors.light.category;

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function materialCategory(name: string, slug: string): MaterialCategory | undefined {
  const value = normalizeSearch(`${name} ${slug}`);

  if (/papel|papelao|paper/.test(value)) return 'paper';
  if (/plastic/.test(value)) return 'plastic';
  if (/vidro|glass/.test(value)) return 'glass';
  if (/metal|aluminio|aco|ferro/.test(value)) return 'metal';
  if (/lamp|eletron|pilha|bateria/.test(value)) return 'electronics';
  if (/organ|oleo/.test(value)) return 'organic';

  return undefined;
}
