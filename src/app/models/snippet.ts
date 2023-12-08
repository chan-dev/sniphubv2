export interface Snippet {
  id: string;
  title: string;
  content: string;
  language: string;
  created_at: number;
  user_id: string;
  list_id: string;
}

export interface EmbeddedSnippetUnderList {
  title: string;
  created_at: number;
}

export type SaveSnippetDTO = Omit<Snippet, 'id' | 'created_at'>;
export type UpdateSnippetDTO = Partial<SaveSnippetDTO>;
