import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-default-snippet-view',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './default-snippet-view.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultSnippetViewComponent {}
