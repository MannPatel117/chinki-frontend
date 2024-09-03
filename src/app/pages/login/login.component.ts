import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { CustomToast } from '../../custom-toast/toast';
import { SharedService } from '../../services/shared/shared.service';
import { StoreBillService } from '../../services/store-bill/store-bill.service';

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
  constructor(private fb: FormBuilder,
               private route: Router,
               private api: ApiService, 
               private toastr: ToastrService, 
               private shared: SharedService,
              private storeBill: StoreBillService) {
  
  }

  ngOnInit(){
    this.checkUserLoggedIn();
    this.setFormBuilder();
  }

  async checkUserLoggedIn(){
    const session = await this.shared.checkUserLoggedIn();
    if(session){
      let role = localStorage.getItem('role');
      if(role == 'factory'){
        this.route.navigateByUrl('/pos/inventory-system')
      } else {
        this.route.navigateByUrl('/pos/billing-system')
      }
      
    } else{

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
      this.api.loginAPI('/admin/user', this.loginForm.value).subscribe((res:any)=>{
        if(res){
          localStorage.setItem('location', res.data.location);
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('role',res.data.role)
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
      });
    }
  }
}
