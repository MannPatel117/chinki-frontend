import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CustomToast } from '../../custom-toast/toast';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  constructor(private fb: FormBuilder, private route: Router,private api: ApiService, private toastr: ToastrService) {
  
  }

  ngOnInit(){
    this.checkUserLoggedIn();
    this.setFormBuilder();
  }

  checkUserLoggedIn(){
    const token= localStorage.getItem('token');
    if(token){
      this.api.getAPI('/adminUser/user', []).subscribe((res:any) =>{
        if(res.statusCode == 200){
          this.route.navigateByUrl('/pos/billing-system')
        }
        else{
          this.route.navigateByUrl('/login')
        }
      }, (error) =>{
        this.route.navigateByUrl('/login')
      })
    }
    else{
      this.route.navigateByUrl('/login')
    }
  }

  // set formBuilder

  setFormBuilder(){
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  submit(){
    if(this.loginForm.invalid){
      this.toastr.show('error','Enter valid credentials',{ 
        toastComponent: CustomToast,
        toastClass: "ngx-toastr",
      })
    }
    else{
      this.loading = true;
      this.api.loginAdmin(this.loginForm.value).subscribe((res:any)=>{
        if(res){
          localStorage.setItem('location', res.data.location)
          localStorage.setItem('token', res.data.accessToken);
          this.api.setToken();
          this.loading = false;
          this.route.navigateByUrl('/pos/billing-system')
          this.toastr.show('success','Successfully Logged In',{ 
            toastComponent: CustomToast,
            toastClass: "ngx-toastr",
          })
        }
      }, (error)=>{
        this.loading = false;
        this.toastr.show('error','Invalid credentials',{ 
          toastComponent: CustomToast,
          toastClass: "ngx-toastr"
        })
      })
    }
  }
}
