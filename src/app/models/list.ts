export interface List {
  id: string;
  name: string;
  created_at: number;
  uid: string;
  snippets: Record<
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
