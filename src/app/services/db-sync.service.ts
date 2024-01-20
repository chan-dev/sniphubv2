import { Injectable, OnDestroy } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { db } from '../db';
import { SnippetsStore } from './snippets.store';
import { Snippet } from '../models/snippet';
import { List } from '../models/list';

@Injectable({ providedIn: 'root' })
export class DbSyncService implements OnDestroy {
  private listener?: RealtimeChannel;

  ngOnDestroy(): void {
    this.listener?.unsubscribe();
  }

  listen(snippetStore: SnippetsStore) {
    this.listener = db
      .channel('db-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          const { new: newData, old, table, eventType } = payload;

          if (table === 'lists') {
            switch (eventType) {
              case 'INSERT':
                snippetStore.addList(newData as List);
                break;
              case 'UPDATE':
                snippetStore.updateList(newData as List);
                break;
              case 'DELETE':
                const deletedListId = old['id'];

                snippetStore.removeList(deletedListId);
                break;
            }
          } else if (table === 'snippets') {
            switch (eventType) {
              case 'INSERT':
                snippetStore.addSnippet(newData as Snippet);
                break;
              case 'UPDATE':
                snippetStore.updateActiveSnippet(newData as Snippet);
                break;
              case 'DELETE':
                const deletedSnippetId = old['id'];
                snippetStore.deleteSnippet(deletedSnippetId);
                break;
            }
          }
        },
      )
      .subscribe();
  }

  unlisten() {
    this.listener?.unsubscribe();
  }
}
