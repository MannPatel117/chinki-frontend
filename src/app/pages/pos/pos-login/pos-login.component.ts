import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pos-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './pos-login.component.html',
  styleUrl: './pos-login.component.scss'
})
export class PosLoginComponent {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private route: Router) {
  
  }

  ngOnInit(){
    this.setFormBuilder();
  }

  // set formBuilder

  setFormBuilder(){
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  submit(){
    console.log(this.loginForm.value)
  }
}
