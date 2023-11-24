export interface Group {
  id: string;
  created_at: number;
  name: string;
  user_id: string;
  lists: Record<
    string,
    {
      created_at: number;
      name: string;
    }
  >;
}

export interface CollapsibleGroup extends Group {
  open: boolean;
}
