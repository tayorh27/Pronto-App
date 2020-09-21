import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/auth'
import { AppConfig } from "../../services/global.service";
import { AdminUsersService } from "../../services/admin-users.service";

@Component({
    selector: 'app-lock-cmp',
    templateUrl: './lock.component.html'
})

export class LockComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    name = ''
    image = ''
    email = localStorage.getItem('email')
    config = new AppConfig()
    adminService = new AdminUsersService()

    constructor(private router: Router){}

    ngOnInit() {
      if(this.email == null){
        this.router.navigate(['/pages/login'])
        return
      }

      this.name = localStorage.getItem('name')
      this.image = localStorage.getItem('dp')

      const body = document.getElementsByTagName('body')[0];
      body.classList.add('lock-page');
      body.classList.add('off-canvas-sidebar');
      const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('lock-page');
      body.classList.remove('off-canvas-sidebar');

    }

    unLockUser() {
      const password = (<HTMLInputElement>document.getElementById("mPassword")).value;

      if (password == '') {
          this.config.displayMessage("All fields must be filled.", false)
          return
      }

      firebase.auth().signInWithEmailAndPassword(this.email, password).then(user => {
        this.adminService.getUserData(this.email).then(ud => {
            if (ud == null) {
                firebase.auth().signOut()
                this.config.displayMessage('User does not exist.', false)
                return
            }
            if (ud.blocked) {
                this.config.displayMessage('Your account has been blocked. Please contact your Admin.', false)
                return
            }
            this.router.navigate(['/dashboard'])
        }).catch(err => {
            firebase.auth().signOut()
            this.config.displayMessage(`${err}`, false)
        })

    }).catch(err => {
        this.config.displayMessage(`${err}`, false)
    })
    }
}
