import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './login.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authServicev2 = inject(AuthService);

  private router = inject(Router);

  async login() {
    try {
      const { error } = await this.authServicev2.login();

      if (error) {
        throw error;
      }

      this.router.navigate(['/home']);
    } catch (error) {
      console.log('error', { error });
    }
  }

  async register() {
    try {
      const { error } = await this.authServicev2.login();
      if (error) {
        throw error;
      }

      this.router.navigate(['/home']);
    } catch (error) {
      console.log('error', { error });
    }
  }
}
