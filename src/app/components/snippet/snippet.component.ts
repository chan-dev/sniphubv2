import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

import { SnippetService } from '../../services/snippets.service';
import { Snippet } from '../../models/snippet';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-snippet',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './snippet.component.html',
  styles: ``,
})
export class SnippetComponent {
  private snippetService = inject(SnippetService);

  snippet$!: Observable<Snippet>;

  @Input() set snippetId(id: string) {
    if (!id) {
      return;
    }

    this.snippet$ = this.snippetService.getSnippet(id);
  }
}
