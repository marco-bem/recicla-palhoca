export interface Material {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface MaterialsRepository {
  listActive(): Promise<Material[]>;
}
