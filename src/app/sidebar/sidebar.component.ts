import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { AdminUsersService } from "../services/admin-users.service";
import { AdminUsers } from "../model/admin.users";
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/auth'
import { AppConfig } from '../services/global.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

declare const $: any;

//Metadata
export interface RouteInfo {
    path: string;
    title?: string;
    display_title?: string;
    type: string;
    icontype: string;
    access?: boolean;
    collapse?: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title?: string;
    display_title?: string;
    ab: string;
    type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [{
    path: '/dashboard',
    title: 'Dashboard',
    display_title: 'Dashboard',
    type: 'link',
    icontype: 'dashboard',
    access: true
},
{
    path: '/new-ticket',
    title: 'New Ticket',
    display_title: 'New Ticket',
    type: 'link',
    icontype: 'create_new_folder',
    access: false
},
{
    path: '/crm',
    title: 'CRM',
    display_title: 'CRM',
    type: 'link',
    icontype: 'create_new_folder',
    access: false
},
{
    path: '/customer',
    title: 'Customer',
    display_title: 'Pronto Customer',
    type: 'link',
    icontype: 'people',
    access: false
},
{
    path: '/category',
    title: 'Category',
    display_title: 'Skill-Sets',
    type: 'link',
    icontype: 'link',
    access: false
},
{
    path: '/technician',
    title: 'Technician',
    display_title: 'Pronto Technician',
    type: 'link',
    icontype: 'handyman',
    access: false
},
{
    path: '/jobs',
    title: 'Jobs',
    display_title: 'Jobs',
    type: 'link',
    icontype: 'work',
    access: false
},
{
    path: '/app-settings',
    title: 'App Settings',
    display_title: 'App Settings',
    type: 'sub',
    icontype: 'settings',
    access: false,
    collapse: 'appsettings',
    children: [
        { path: 'status', title: 'Status', display_title: 'Status', ab: 'S' },
    ]
},
{
    path: '/logs',
    title: 'Logs',
    display_title: 'Logs',
    type: 'link',
    icontype: 'apps',
    access: false
},
{
    path: '/assigned-jobs',
    title: 'Assigned Jobs',
    display_title: 'Assigned Jobs',
    type: 'link',
    icontype: 'work',
    access: false
},
    {
        path: '/components',
        display_title: 'Components',
        type: 'sub',
        icontype: 'apps',
        access: false,
        collapse: 'components',
        children: [
            { path: 'buttons', display_title: 'Buttons', ab: 'B' },
            { path: 'grid', display_title: 'Grid System', ab: 'GS' },
            { path: 'panels', display_title: 'Panels', ab: 'P' },
            { path: 'sweet-alert', display_title: 'Sweet Alert', ab: 'SA' },
            { path: 'notifications', display_title: 'Notifications', ab: 'N' },
            { path: 'icons', display_title: 'Icons', ab: 'I' },
            { path: 'typography', display_title: 'Typography', ab: 'T' }
        ]
    }, 
    {
        path: '/forms',
        display_title: 'Forms',
        type: 'sub',
        icontype: 'content_paste',
        collapse: 'forms',
        access: false,
        children: [
            { path: 'regular', display_title: 'Regular Forms', ab: 'RF' },
            { path: 'extended', display_title: 'Extended Forms', ab: 'EF' },
            { path: 'validation', display_title: 'Validation Forms', ab: 'VF' },
            { path: 'wizard', display_title: 'Wizard', ab: 'W' }
        ]
    }, 
    {
        path: '/tables',
        display_title: 'Tables',
        type: 'sub',
        icontype: 'grid_on',
        collapse: 'tables',
        children: [
            { path: 'regular', display_title: 'Regular Tables', ab: 'RT' },
            { path: 'extended', display_title: 'Extended Tables', ab: 'ET' },
            { path: 'datatables.net', display_title: 'Datatables.net', ab: 'DT' }
        ],
        access: false
    }, {
        path: '/maps',
        display_title: 'Maps',
        type: 'sub',
        icontype: 'place',
        collapse: 'maps',
        children: [
            { path: 'google', display_title: 'Google Maps', ab: 'GM' },
            { path: 'fullscreen', display_title: 'Full Screen Map', ab: 'FSM' },
            { path: 'vector', display_title: 'Vector Map', ab: 'VM' }
        ],
        access: false
    }, 
    {
        path: '/widgets',
        display_title: 'Widgets',
        type: 'link',
        icontype: 'widgets'

    },
     {
        path: '/charts',
        display_title: 'Charts',
        type: 'link',
        icontype: 'timeline',
        access: false

    }, {
        path: '/calendar',
        title: 'Calendar',
        type: 'link',
        icontype: 'date_range',
        access: false
    }, {
        path: '/pages',
        title: 'Pages',
        type: 'sub',
        icontype: 'image',
        collapse: 'pages',
        children: [
            { path: 'pricing', title: 'Pricing', ab: 'P' },
            { path: 'timeline', title: 'Timeline Page', ab: 'TP' },
            { path: 'login', title: 'Login Page', ab: 'LP' },
            { path: 'register', title: 'Register Page', ab: 'RP' },
            { path: 'lock', title: 'Lock Screen Page', ab: 'LSP' },
            { path: 'user', title: 'User Page', ab: 'UP' }
        ],
        access: false
    }
];

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {

    user: AdminUsers
    name: string = 'Username';
    image: string = './assets/img/default-avatar.png';
    role: string = 'user';
    access_level = '';
    service = new AdminUsersService();

    stock_alerts: string[] = []
    config = new AppConfig()

    public menuItems: any[] = [];
    ps: any;

    constructor(private router: Router) {
        this.getProfile();
    }

    getProfile() {
        const email = localStorage.getItem('email');
        this.service.getUserData(email).then(async p => {
            this.user = p
            if (p == null) {
                this.service.getUserData(email).then(async q => {
                    this.user = q
                    this.name = q.name;
                    this.image = q.image;
                    this.role = q.role;
                    if (q.role == 'Administrator') {
                        this.access_level = q.access_levels;
                    } else {
                        const getRole = await this.getAccessLevelsUsingRoles(q.role)
                        const vars = getRole.docs[0].data()
                        this.access_level = vars['access_levels']
                    }
                    this.displayNav();
                })
            } else {
                this.name = p.name;
                this.image = p.image;
                this.role = p.role;
                if (p.role == 'Administrator') {
                    this.access_level = p.access_levels;
                } else {
                    const getRole = await this.getAccessLevelsUsingRoles(p.role)
                    const vars = getRole.docs[0].data()
                    this.access_level = vars['access_levels']
                }
                this.displayNav();
            }
        })
    }

    async getAccessLevelsUsingRoles(role: string) {
        return await firebase.firestore().collection('roles').where('name', '==', role).get()
    }

    displayNav() {
        ROUTES.forEach(menuItem => {
            if (menuItem.title == 'Dashboard') {
                this.menuItems.push(menuItem);
            } else {
                if (this.role == 'Administrator') {
                    menuItem.access = true;
                    this.menuItems.push(menuItem);
                } else {
                    //console.log(`Access to ${menuItem.title} is ${this.service.isAllowedAccess(this.access_level, menuItem.title)}`)
                    menuItem.access = this.service.isAllowedAccess(this.access_level.toLowerCase(), menuItem.title.replace(' ','-').toLowerCase());
                    this.menuItems.push(menuItem);
                }
            }
        })
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


    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

    ngOnInit() {
        // this.menuItems = ROUTES.filter(menuItem => menuItem);
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            this.ps = new PerfectScrollbar(elemSidebar);
        }
    }
    updatePS(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            this.ps.update();
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

    gotoLink(menu_path, child_path) {
        // this.router.navigate([`${menu_path}/${child_path}`])
        if (this.role == 'Administrator') {
            this.router.navigate([`${menu_path}/${child_path}`])
        } else {
            location.href = `/${menu_path}/${child_path}`
        }
    }

    gotoSingleLink(menu_path:string) {
        // this.router.navigate([`${menu_path}`])
        //this.user.user_type == 'admin'
        if (this.role == 'Administrator') {
            this.router.navigate([`${menu_path}`])
        } else {
            location.href = `${menu_path}`
        }
    }
}
