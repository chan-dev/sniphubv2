type EmbeddedSnippet = {
  id: string;
  title: string;
  created_at: number;
};

export interface List {
  id: string;
  name: string;
  created_at: number;
  user_id: string;

  snippets?: EmbeddedSnippet[];
}

export type NewListDTO = Omit<List, 'id' | 'created_at' | 'snippets'>;
export type EditListDTO = Pick<List, 'id' | 'name'>;
