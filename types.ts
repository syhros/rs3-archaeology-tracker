export interface Materials {
  [materialName: string]: number;
}

export interface ArtefactData {
  img_src: string;
  total_needed: number;
  collections: string[];
  other_uses: string[];
  dig_sites: string[];
  level: number;
  materials: Materials;
  xp: number;
  individual_chronotes: number;
}

export interface Artefact extends ArtefactData {
  name: string;
}

export interface CollectionData {
  collector: string;
  items: string[];
  collection_bonus_chronotes?: number;
}

export interface Collection extends CollectionData {
  name: string;
}

export type SortMethod = 'level' | 'name' | 'remaining';

export interface BankedCounts {
  [artefactName: string]: number;
}

export interface CheckedCollections {
  [collectionName: string]: boolean;
}
