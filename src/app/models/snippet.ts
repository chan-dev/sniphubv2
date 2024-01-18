export interface Snippet {
  id: number;
  title: string;
  content: string;
  language: string;
  created_at: number;
  user_id: string;
  list_id: number;
}

export type SaveSnippetDTO = Omit<Snippet, 'id' | 'created_at'>;
export type UpdateSnippetDTO = Partial<SaveSnippetDTO>;
