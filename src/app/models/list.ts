export interface List {
  id: string;
  name: string;
  created_at: number;
  uid: string;
  snippets?: Record<
    string,
    {
      created_at: number;
      title: string;
    }
  >;
}

export interface CollapsibleList extends List {
  open: boolean;
}

export type NewListDTO = Omit<List, 'id' | 'created_at' | 'snippets'>;
export type EditListDTO = Pick<List, 'id' | 'name'>;
