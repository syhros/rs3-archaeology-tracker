
export interface Materials {
  [materialName: string]: number;
}

export interface ArtefactData {
  img_src: string;
  total_needed: number;
  collections: string[];
  other_uses: string[];
  dig_sites?: string[];
  excavation_hotspot?: string[];
  excavation_site?: string[];
  dig_site?: string[];
  level: number;
  materials: Materials;
  xp: number;
  individual_chronotes: number;
  other_uses_total: number;
}

export interface Artefact extends ArtefactData {
  name: string;
}

export interface CollectionData {
  collector: string;
  items: string[];
  collection_bonus_chronotes?: number;
  recurring_reward?: string;
}

export interface Collection extends CollectionData {
  name: string;
}

export type SortMethod = 'level' | 'name' | 'remaining' | 'damaged';
export type ExcavationSortMethod = 'excavation_hotspot' | 'excavation_site' | 'dig_site';

export interface UserArtefactCounts {
  [artefactName: string]: {
    damaged: number;
    repaired: number;
  };
}

export interface CheckedCollections {
  [collectionName: string]: boolean;
}
