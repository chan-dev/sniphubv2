import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { NgIconComponent } from '@ng-icons/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { SnippetService } from '../../services/snippets.service';
import { Snippet } from '../../models/snippet';

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
  private snippetSubject = new BehaviorSubject<string | null>(null);

  private readonly defaultSnippet = {
    id: '',
    title: 'Untitled',
    content: '',
    language: 'javascript',
  } as Snippet;

  snippet = this.defaultSnippet;

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    readOnly: true,
    contextmenu: false,
  };

  languages: any[] = [];

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
          console.log('id', id);
          if (!id) {
            return of(this.defaultSnippet);
          }
          return this.snippetService.getSnippet(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((snippet) => {
        console.log('snippet', snippet);
        this.snippet = snippet;
        this.setLanguage(this.snippet.language);
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

  setLanguage(langId: string) {
    this.editorOptions = {
      ...this.editorOptions,
      language: langId,
    };
  }
}
