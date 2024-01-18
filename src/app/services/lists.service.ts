import { Injectable } from '@angular/core';

import { db } from '../db';
import { EditListDTO, NewListDTO } from '../models/list';

@Injectable({ providedIn: 'root' })
export class ListsService {
  getLists(userId: string) {
    return db
      .from('lists')
      .select('*, snippets(id, title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
  }

  createList(newList: NewListDTO) {
    return db.from('lists').insert(newList);
  }

  editList({ name, id }: EditListDTO) {
    return db
      .from('lists')
      .update({
        name,
      })
      .eq('id', id);
  }

  deleteList(id: number) {
    return db.from('lists').delete().eq('id', id);
  }
}
