import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CollapsibleList } from '../../models/list';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterLink],
  templateUrl: './list.component.html',
  styles: ``,
})
export class ListComponent {
  @Input() list!: CollapsibleList;
  @Input() activeSnippetId?: string;
}
