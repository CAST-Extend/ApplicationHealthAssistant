import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GitGuard } from '../../git-callback/git.guard';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export default class LoginComponent {
    loginForm: FormGroup;

    // LOGO = require('./login/Fluid_background_2019_3-1-34.jpg');

    /**
     *
     * @param fb
     * @param authService
     */
    constructor(
        private fb: FormBuilder,
        private authService: GitGuard
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
        });
    }

    /**
     *
     */
    onSubmit() {
        this.authService.login();
    }
}
