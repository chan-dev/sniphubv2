import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { map, shareReplay } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { List, NewListDTO } from '../../models/list';
import { ListsService } from '../../services/lists.service';
import { SnippetComponent } from '../../components/snippet/snippet.component';
import { ListComponent } from '../../components/list/list.component';
import { ListGroupComponent } from '../../components/list-group/list-group.component';
import { DropdownMenuDirective } from '../../directives/dropdown-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styles: [],
  viewProviders: [
    provideIcons({
      ionAdd,
      ionCopyOutline,
      ionChevronForward,
      ionChevronDown,
    }),
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    MonacoEditorModule,
    MatMenuModule,
    NgIconComponent,
    SnippetComponent,
    RouterLink,
    ListGroupComponent,
    ModalComponent,
    ListComponent,
    DropdownMenuDirective,
  ],
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private listsService = inject(ListsService);

  lists: List[] = [];

  activeSnippetId$ = this.route.queryParamMap.pipe(
    map((params) => params.get('snippetId')),
    shareReplay(1),
  );

  ngOnInit() {
    const userId = 'YNcQBgiyZ5ANasIrvH5p';

    return this.listsService.getLists(userId).subscribe((lists) => {
      this.lists = lists;
    });
  }

  logout() {
    // TODO: implement later once we have the auth service
    this.router.navigate(['/login']);
  }

  openListModal() {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: true,
      data: {
        listName: '',
      },
    });

    dialogRef.afterClosed().subscribe((listName) => {
      console.log('The dialog was closed', { listName });

      // call save list service to create new list
      const newList: NewListDTO = {
        name: listName,
        uid: 'YNcQBgiyZ5ANasIrvH5p',
      };

      this.listsService.createList(newList).subscribe({
        next: (data) => {
          console.log('List created', {
            data: data,
          });
        },
        // FIXME: error is not being caught from firstore addDoc
        error: (err) => {
          console.error(`Caught error: ${err}`);
        },
      });
    });
  }
}
