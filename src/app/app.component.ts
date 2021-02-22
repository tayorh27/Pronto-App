import { environment } from './../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/analytics'
import 'firebase/auth'
import { AdminUsers } from './model/admin.users';

@Component({
  selector: 'app-my-app',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  private _router: Subscription;
  isLoggedIn: boolean = false;
  email: string = '';
  isLogout = true

  constructor(private router: Router) {
  }

  checkLoggedInAccess() {
    this.email = localStorage.getItem('email');
    if (this.email == null) {
      this.email = '';
    }
    firebase.auth().onAuthStateChanged(userData => {
      if (userData) {
        this.isLoggedIn = true;
        localStorage.setItem('logged', 'true');
      } else {
        localStorage.setItem('logged', 'false');
        if (this.isLogout) {
          this.logUserOut(true)
        } else {
          this.logUserOut(false)
        }
      }
    });
  }

  checkblockeduser() {
    this.email = localStorage.getItem('email');
    if (this.email == null) {
      return
    }
    firebase.firestore().collection('users').doc(this.email).onSnapshot(user => {
      const m = <AdminUsers>user.data()
      if (m != null) {
        const blocked: boolean = m.blocked
        if (blocked) {
          this.logUserOut(true)
        }
      }
    })
  }

  logUserOut(clearAll: boolean) {
    if (clearAll) {
      this.isLoggedIn = false;
      firebase.auth().signOut();
      localStorage.clear();
      this.router.navigate(['/pages/login'])
    } else {
      this.isLoggedIn = false;
      firebase.auth().signOut();
      this.router.navigate(['/pages/lock'])
    }
  }

  worker:Worker

  ngOnInit() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      console.log('33hmmmmm')
      this.worker = new Worker('background-services.js')//, { type: 'module' }
      this.worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
    } else {
      console.log('hmmmmm')
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      const body = document.getElementsByTagName('body')[0];
      const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
      if (body.classList.contains('modal-open')) {
        body.classList.remove('modal-open');
        modalBackdrop.remove();
      }

    });

    firebase.initializeApp(environment.firebaseConfig)
    firebase.analytics()

    this.checkLoggedInAccess()
    this.checkblockeduser()
    // setTimeout(()=>{
    //   console.log(this.worker)
    //   this.worker.postMessage('hello');
    // },5000)
  }

}