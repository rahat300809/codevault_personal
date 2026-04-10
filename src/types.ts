export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string;
  tags: string[];
  folderId: string;
  createdAt: number;
  updatedAt: number;
}

export type NewSnippet = Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>;

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export type NewFolder = Omit<Folder, 'id' | 'createdAt'>;
