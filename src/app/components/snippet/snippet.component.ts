import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { NgIconComponent } from '@ng-icons/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { Snippet } from '../../models/snippet';
import { SnippetService } from '../../services/snippets.service';
import { TrackUnsavedService } from '../../services/track-unsaved.service';
import { EditorOptions } from '../../types/editor';

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule, NgIconComponent],
  templateUrl: './snippet.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .code-editor-container {
      height: calc(100vh - 40px);
    }

    .code-editor {
      .editor-container {
        height: 100% !important;
      }
    }
  `,
  providers: [],
})
export class SnippetComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private snippetService = inject(SnippetService);
  private trackUnsavedService = inject(TrackUnsavedService);
  private snippetSubject = new BehaviorSubject<string | null>(null);

  private readonly defaultSnippet = {
    id: '',
    title: 'Untitled',
    content: '',
    language: '',
  } as Snippet;

  snippet = this.defaultSnippet;

  editorContent = this.snippet.content;
  editorTitle = this.snippet.title;
  editorLanguage = this.snippet.language;

  editorOptions: EditorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    readOnly: true,
    contextmenu: false,
  };

  languages: any[] = [];

  shouldEdit = false;

  @Input() set snippetId(id: string) {
    if (!id) {
      return;
    }

    console.log('snippetId', id);
    this.snippetSubject.next(id);
  }

  ngOnInit(): void {
    this.snippetSubject
      .pipe(
        switchMap((id) => {
          console.log('snippet id', id);
          if (!id) {
            return of(this.defaultSnippet);
          }
          return this.snippetService.getSnippet(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((snippet) => {
        console.log('snippet', snippet);

        if (!snippet) {
          return;
        }

        this.snippet = snippet;
        this.editorContent = this.snippet.content;
        this.editorTitle = this.snippet.title;
        this.editorLanguage = this.snippet.language;

        this.setEditorOptions({ language: this.snippet.language });
      });
  }

  onEditorInit(_editor: any) {
    // TODO: add a service for local storage
    const languages = localStorage.getItem('languages');
    if (languages) {
      this.languages = JSON.parse(languages);
    } else {
      this.languages = window.monaco.languages.getLanguages();
      localStorage.setItem('languages', JSON.stringify(this.languages));
    }
  }

  selectLanguage(id: string) {
    this.setEditorOptions({ language: id });
    this.editSnippet(this.snippet.id);
  }

  updateEditorReadonly(readOnly: boolean) {
    this.setEditorOptions({ readOnly });
  }

  editSnippet(snippetId: string) {
    if (snippetId && !this.shouldEdit) {
      this.makeEditable();
    }
  }

  saveSnippet(snippetId: string) {
    if (snippetId) {
      this.shouldEdit = false;
      this.updateEditorReadonly(true);
    }
  }

  updateTitle(event: Event) {
    const target = event.target as HTMLElement;
    this.editorTitle = target.textContent || '';
  }

  cancelUpdate() {
    const question =
      'You have unsaved changes. Are you sure you want to leave?';

    // TODO: replace with modal
    // Modal should be reused on the `unsavedChangesGuard` route guard
    if (window.confirm(question)) {
      this.resetToDefaults();
    }
  }

  private resetToDefaults() {
    this.shouldEdit = false;
    this.updateEditorReadonly(true);
    this.editorContent = this.snippet.content;
    this.editorTitle = this.snippet.title;
    this.editorLanguage = this.snippet.language;
  }

  trackUnsavedChanges(content: string) {
    this.trackUnsavedService.trackChange(content, this.snippet.content);
  }

  private setEditorOptions({
    language,
    theme,
    readOnly,
    contextmenu,
  }: Partial<EditorOptions>) {
    this.editorOptions = {
      language: language ?? this.editorOptions.language,
      theme: theme ?? this.editorOptions.theme,
      readOnly: readOnly ?? this.editorOptions.readOnly,
      contextmenu: contextmenu ?? this.editorOptions.contextmenu,
    };
  }

  private makeEditable() {
    this.shouldEdit = true;
    this.updateEditorReadonly(false);
  }
}
