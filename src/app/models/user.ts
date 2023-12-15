export interface User {
  username: string;
  email: string;
  uid: string;
  created_at: number;
}

export type NewUserDTO = Omit<User, 'id' | 'created_at'>;
