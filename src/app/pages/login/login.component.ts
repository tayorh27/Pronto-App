import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/database'
import swal from 'sweetalert2';
import { AdminUsers } from "../../model/admin.users";
import { AdminUsersService } from "../../services/admin-users.service";
import { timer } from 'rxjs';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/services/global.service';

declare var $: any;

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;

    private adminUser: AdminUsers;
    private adminService = new AdminUsersService();

    login_pressed = false;
    forgot_pressed = false;

    config = new AppConfig()

    constructor(private element: ElementRef, private router: Router) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        var navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
        body.classList.remove('off-canvas-sidebar');
    }

    login() {
        const checkBox = (<HTMLInputElement>document.getElementById("userNew")).checked
        const email = (<HTMLInputElement>document.getElementById("mEmail")).value.toLowerCase();
        const password = (<HTMLInputElement>document.getElementById("mPassword")).value;

        if (email == '' || password == '') {
            this.displayMessage("All fields must be filled.", false)
            return
        }
        // if (email.search("@tac.ng") < 0) {
        //     this.displayMessage("Invalid email address", false)
        //     return
        // }
        
        this.login_pressed = true;

        if (checkBox) {
            firebase.auth().createUserWithEmailAndPassword(email, password).then(user => {
                //console.log(user)
                this.adminService.getUserData(email).then(ud => {
                    //console.log(ud)
                    if (ud == null) {
                        firebase.auth().signOut()
                        this.displayMessage('User does not exist.', false)
                        return
                    }
                    if (ud.blocked) {
                        firebase.auth().signOut()
                        this.displayMessage('Your account has been blocked. Please contact your Admin.', false)
                        return
                    }
                    this.config.logActivity(`${ud.name} logged in to admin`)
                    localStorage.setItem('logged', 'true');
                    localStorage.setItem('email', email);
                    localStorage.setItem('name', ud.name);
                    localStorage.setItem('dp', ud.image);
                    this.login_pressed = false;
                    this.router.navigate(['/dashboard'])
                    //location.reload(true)
                }).catch(err => {
                    firebase.auth().signOut()
                    this.displayMessage(`${err}`, false)
                })
            }).catch(err => {
                this.displayMessage(`${err}`, false)
            })
            return
        }

        firebase.auth().signInWithEmailAndPassword(email, password).then(user => {
            this.adminService.getUserData(email).then(ud => {
                if (ud == null) {
                    firebase.auth().signOut()
                    this.displayMessage('User does not exist.', false)
                    return
                }
                if (ud.blocked) {
                    firebase.auth().signOut()
                    this.displayMessage('Your account has been blocked. Please contact your Admin.', false)
                    return
                }
                this.config.logActivity(`${ud.name} logged in to admin`)
                localStorage.setItem('email', email);
                localStorage.setItem('name', ud.name);
                localStorage.setItem('dp', ud.image);
                this.login_pressed = false;

                this.router.navigate(['/dashboard'])
            }).catch(err => {
                firebase.auth().signOut()
                this.displayMessage(`${err}`, false)
            })

        }).catch(err => {
            this.displayMessage(`${err}`, false)
        })
    }

    forgotpassword() {
        const email = (<HTMLInputElement>document.getElementById("mEmail")).value.toLowerCase();
        if (email == '') {
            this.displayMessage("Please enter your email address.", false)
            return
        }
        // if (email.search("@tac.ng") < 0) {
        //     this.displayMessage("Invalid email address", false)
        //     return
        // }
        this.forgot_pressed = true;
        firebase.auth().sendPasswordResetEmail(email).then(user => {
            this.displayMessage("Password reset instructions sent successfully.", true)
        }).catch(err => {
            this.displayMessage(`${err}`, false)
        })
    }

    displayMessage(msg: string, success: boolean) {
        this.login_pressed = false;
        this.forgot_pressed = false;
        swal({
            title: msg,
            buttonsStyling: false,
            confirmButtonClass: (!success) ? "btn btn-danger" : "btn btn-success"
        }).catch(swal.noop)
    }
}
