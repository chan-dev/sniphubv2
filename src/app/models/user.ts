export interface User {
  username: string;
  email: string;
  uid: string;
  created_at: number;
  photoUrl?: string;
}

export type NewUserDTO = Omit<User, 'id' | 'created_at'>;
