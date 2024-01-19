import { Injectable, OnDestroy } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { db } from '../db';
import { SnippetsStore } from './snippets.store';
import { Snippet } from '../models/snippet';

@Injectable({ providedIn: 'root' })
export class DbSyncService implements OnDestroy {
  private listener?: RealtimeChannel;

  ngOnDestroy(): void {
    this.listener?.unsubscribe();
  }

  listen(snippetStore: SnippetsStore) {
    this.listener = db
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          const { new: newData, old, table, eventType } = payload;
          console.log('payload', payload);
          if (table === 'lists') {
            switch (eventType) {
              case 'INSERT':
                break;
              case 'UPDATE':
                break;
              case 'DELETE':
                break;
            }
          } else if (table === 'snippets') {
            switch (eventType) {
              case 'INSERT':
                console.log(`insert`, newData);
                snippetStore.addSnippet(newData as Snippet);
                break;
              case 'UPDATE':
                console.log(`update`, {
                  old,
                  newData,
                });
                snippetStore.updateActiveSnippet(newData as Snippet);
                break;
              case 'DELETE':
                console.log(`deleted snippet`, {
                  old,
                  newData,
                });
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
