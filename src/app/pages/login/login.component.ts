import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private route: Router,private api: ApiService) {
  
  }

  ngOnInit(){
    this.checkUserLoggedIn();
    this.setFormBuilder();
  }

  checkUserLoggedIn(){
    this.api.getAdminUser().subscribe((res:any) =>{
      if(res){
        this.route.navigateByUrl('/pos/billing-system')
      }
    }, (error) =>{
    })
  }

  // set formBuilder

  setFormBuilder(){
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  submit(){
    this.api.loginAdmin(this.loginForm.value).subscribe((res:any)=>{
      localStorage.setItem('location', res.data.location)
      localStorage.setItem('token', res.data.accessToken);
      this.api.setToken();
      this.route.navigateByUrl('/pos/billing-system')
    })
  }
}
