import { Component, inject } from '@angular/core';
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
})
export class LoginComponent {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);

  private router = inject(Router);

  async login() {
    try {
      const userCredential = await this.authService.login();
      await this.usersService.createNewUser({
        username: userCredential.user.displayName || '',
        email: userCredential.user.email || '',
        uid: userCredential.user.uid,
      });
      this.router.navigate(['/home']);
    } catch (error) {
      console.log('error', { error });
    }
  }
}
