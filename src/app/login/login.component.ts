import { Component, OnInit } from '@angular/core';
import { AbstractControl,FormBuilder,FormGroup,FormsModule,ReactiveFormsModule,Validators} from '@angular/forms';
import Validation from '../utils/validation';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports:[FormsModule,
  ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  constructor(private formBuilder: FormBuilder, private router: Router){}
  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        username: [
          '',
          [
            Validators.required,
   
          ]
        ],
        password: [
          '',
          [
            Validators.required,
          ]
        ],
      },
      {
        validators: [Validation.match('password', 'confirmPassword')]
      }
    );
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    // Perform your authentication logic here
    // For now, let's assume authentication is successful and redirect to home
    this.router.navigate(['/home']);
    console.log(JSON.stringify(this.form.value, null, 2));
  }

  // Function to check if the credentials are invalid
  hasInvalidCredentials(): boolean {
    return this.submitted && !this.form.valid;
  }

}
