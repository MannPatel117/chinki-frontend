import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { SuccessToast } from '../../toast/success-toast/toast';
import { ErrorToast } from '../../toast/error-toast/toast';
import { StoreBillService } from '../../services/store-bill/store-bill.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    private route: Router,
    private api: ApiService,
    private toastr: ToastrService,
    private storeBill: StoreBillService
  ) {}

  ngOnInit() {
    this.setFormBuilder();
    this.storeBill.setEmpty();
  }

  // set formBuilder

  setFormBuilder() {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.toastr.show('error', 'Enter Valid Credentials', {
        toastComponent: ErrorToast,
        toastClass: 'ngx-toastr',
      });
      return;
    }
    this.loading = true;
    this.api.loginAPI('/adminUser/login', this.loginForm.value).subscribe(
      (res: any) => {
        if (res.success == true) {
          localStorage.setItem(
            'location',
            JSON.stringify(res.data.user.inventory)
          );
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.user.role);
          localStorage.setItem('firstName', res.data.user.firstName);
          localStorage.setItem('lastName', res.data.user.lastName);
          this.api.setToken();
          this.loading = false;
          this.route.navigateByUrl('/pos/main');
          this.toastr.show('success', 'Login Successful', {
            toastComponent: SuccessToast,
            toastClass: 'ngx-toastr',
          });
        }
      },
      (error: any) => {
        this.loading = false;
        this.toastr.show('error', 'Invalid Credentials', {
          toastComponent: ErrorToast,
          toastClass: 'ngx-toastr',
        });
      }
    );
  }
}
