import { CanActivate, ActivatedRoute } from "@angular/router";
import { AdminUsersService } from "./services/admin-users.service";
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { RoleUsers } from "./model/role.users";

export class RouteGuard implements CanActivate {

    // /constructor(private router:ActivatedRoute){}

    service = new AdminUsersService();

    async canActivate() {
        const email = localStorage.getItem('email')
        if (email == null) {
            return false
        } else {
            const p = await this.service.getUserData(email)
            //console.log(`from route = ${p.access_levels}`)
            const r = await firebase.firestore().collection('roles').where('name', '==', p.role).get()
            const role = <RoleUsers>r.docs[0].data()//p.access_levels.toLowerCase()
            const levels = role.access_levels
            const current_menu = window.location.href.toLowerCase().split("/")[3]

            if (p.role == 'Administrator') {
                return true
            } else {
                //console.log(`from route allow = ${this.service.isAllowedAccess(levels, current_menu)}`)
                return this.service.isAllowedAccess(levels, current_menu)
            }
        }
    }
}//['technician,customer,users]

export class LoginRouteGuard implements CanActivate {

    canActivate() {
        const email = localStorage.getItem('email')
        const logged = localStorage.getItem('logged')

        if (email == null && logged == null) {
            return true
        } else {
            return logged == 'false'
        }
    }
}