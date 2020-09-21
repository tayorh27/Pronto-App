import { Component, OnInit } from '@angular/core';
import { AdminUsersService } from "../services/admin-users.service";
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig } from "../services/global.service";
import swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import 'firebase/firestore'


@Component({
    selector: 'app-user-cmp',
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit{

    username = ''
    email = localStorage.getItem('email')
    position = ''
    role = ''
    dp = ''
    levels = ''
    disabled = true

    service = new AdminUsersService()
    config = new AppConfig()

    constructor(private _Activatedroute:ActivatedRoute, private router:Router){}

    
    ngOnInit(){
        this.service.getUserData(this.email).then(p => {
            if (p == null) {
                this.service.getUserData(this.email).then(q => {
                    this.username = q.name;
                    this.dp = q.image;
                    this.role = q.role;
                    this.levels = q.access_levels;
                    this.position = q.position;
                })
            } else {
                this.username = p.name;
                this.dp = p.image;
                this.role = p.role;
                this.levels = p.access_levels;
                this.position = p.position;
            }
        })
        this._Activatedroute.params.subscribe(p => {
            this.disabled = p['edit']
        })
    }

    updateProfile() {
        if(!this.disabled){

        }
    }

    logout() {
        swal({
            title: 'Logout Alert',
            text: 'Are you sure about logging out?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log me out!',
            cancelButtonText: 'No, keep me',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.auth().signOut();
                localStorage.clear();
                this.router.navigate(['/pages/login'])
            } else {
                swal({
                    title: 'Cancelled',
                    text: 'Logout not successful',
                    type: 'error',
                    confirmButtonClass: "btn btn-info",
                    buttonsStyling: false
                }).catch(swal.noop)
            }
        })
    }

}
