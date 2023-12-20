import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './login.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);

  private router = inject(Router);

  async login() {
    try {
      await this.authService.login();

      this.router.navigate(['/home']);
    } catch (error) {
      console.log('error', { error });
    }
  }

  async register() {
    try {
      await this.authService.register();

      this.router.navigate(['/home']);
    } catch (error) {
      console.log('error', { error });
    }
  }
}
