import { Component, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit, ElementRef } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { NavItem, NavItemType } from '../../md/md.module';
import { Subscription } from 'rxjs/Subscription';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
// import { NavbarComponent } from '../../shared/navbar/navbar.component';
import PerfectScrollbar from 'perfect-scrollbar';
import * as firebase from 'firebase/app';
import 'firebase/messaging'
import { AdminUsersService } from 'src/app/services/admin-users.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare const $: any;

@Component({
  selector: 'app-layout',
  templateUrl: './admin-layout.component.html'
})

export class AdminLayoutComponent implements OnInit, AfterViewInit {

  public navItems: NavItem[];
  private _router: Subscription;
  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];
  url: string;
  location: Location;
  service = new AdminUsersService()

  hasIncomingCall = false
  callData:any
  closeResult = ''

  @ViewChild('sidebar', { static: false }) sidebar: any;
  @ViewChild('incomingcall', { static: false }) private incomingCallContainer: ElementRef;
  // @ViewChild(NavbarComponent, {static: false}) navbar: NavbarComponent;
  constructor(private modalService: NgbModal, private router: Router, location: Location) {
    this.location = location;
  }

  open(content, type, modalDimension) {
    if (modalDimension === 'sm' && type === 'modal_mini') {
      this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    } else if (modalDimension === '' && type === 'Notification') {
      this.modalService.open(content, { windowClass: 'modal-danger', centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    } else {
      this.modalService.open(content, { centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    }
  }

  ngOnInit() {
    this.getIncomingCalls()
    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev.url;
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (event.url != this.lastPoppedUrl)
          this.yScrollStack.push(window.scrollY);
      } else if (event instanceof NavigationEnd) {
        if (event.url == this.lastPoppedUrl) {
          this.lastPoppedUrl = undefined;
          window.scrollTo(0, this.yScrollStack.pop());
        }
        else
          window.scrollTo(0, 0);
      }
    });
    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      elemMainPanel.scrollTop = 0;
      elemSidebar.scrollTop = 0;
    });
    const html = document.getElementsByTagName('html')[0];
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar);
      html.classList.add('perfect-scrollbar-on');
    }
    else {
      html.classList.add('perfect-scrollbar-off');
    }
    // this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
    //   this.navbar.sidebarClose();
    // });

    this.navItems = [
      { type: NavItemType.NavbarLeft, title: 'Dashboard', iconClass: 'fa fa-dashboard' },

      {
        type: NavItemType.NavbarRight,
        title: '',
        iconClass: 'fa fa-bell-o',
        numNotifications: 5,
        dropdownItems: [
          { title: 'Notification 1' },
          { title: 'Notification 2' },
          { title: 'Notification 3' },
          { title: 'Notification 4' },
          { title: 'Another Notification' }
        ]
      },
      {
        type: NavItemType.NavbarRight,
        title: '',
        iconClass: 'fa fa-list',

        dropdownItems: [
          { iconClass: 'pe-7s-mail', title: 'Messages' },
          { iconClass: 'pe-7s-help1', title: 'Help Center' },
          { iconClass: 'pe-7s-tools', title: 'Settings' },
          'separator',
          { iconClass: 'pe-7s-lock', title: 'Lock Screen' },
          { iconClass: 'pe-7s-close-circle', title: 'Log Out' }
        ]
      },
      { type: NavItemType.NavbarLeft, title: 'Search', iconClass: 'fa fa-search' },

      { type: NavItemType.NavbarLeft, title: 'Account' },
      {
        type: NavItemType.NavbarLeft,
        title: 'Dropdown',
        dropdownItems: [
          { title: 'Action' },
          { title: 'Another action' },
          { title: 'Something' },
          { title: 'Another action' },
          { title: 'Something' },
          'separator',
          { title: 'Separated link' },
        ]
      },
      { type: NavItemType.NavbarLeft, title: 'Log out' }
    ];
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
    this.startNotificationAccess()
  }

  public isMap() {
    if (this.location.prepareExternalUrl(this.location.path()) === '/maps/fullscreen') {
      return true;
    } else {
      return false;
    }
  }
  
  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar);
      ps.update();
    }
  }

  isMac(): boolean {
    let bool = false;
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
      bool = true;
    }
    return bool;
  }

  startNotificationAccess() {
    const email = localStorage.getItem('email');
    this.service.getUserData(email).then(p => {
      if (p == null) {
        this.service.getUserData(email).then(q => {
          this.requestMessagingPermissionAndGetToken(email);
        })
      } else {
        this.requestMessagingPermissionAndGetToken(email);
      }
    })
  }

  getIncomingCalls() {
    const sip = localStorage.getItem("SIPexten")
    firebase.firestore().collection('incoming-calls').where("assigned_to", '==', "none").where("params.SIPexten", "==", sip).orderBy("timestamp", 'desc').onSnapshot(query => {
      // console.log(query) incoming-calls
      if(query.size > 0) {
        const length = query.size
        this.callData = query.docs[0].data()
        this.hasIncomingCall = true
        this.open(this.incomingCallContainer, '', '')
        this.playAudio()
      }
    })
  }

  async performActionButtonClicked() {
    const email = localStorage.getItem("email")
    await firebase.firestore().collection("incoming-calls").doc(this.callData.id).update({"assigned_to": email})

    if(this.callData.hasAccount) {
        location.href = `/new-ticket?customer=${this.callData.customer_email}`
        return
    }
    location.href = `/new-ticket?create=new&number=234${this.callData.params.phone_number}`
}

  playAudio() {
    let audio = new Audio();
    audio.src = "assets/audio/13798_sms_good_msg_tone.mp3";
    audio.load();
    audio.play();
  }

  requestMessaging() {
    const messaging = firebase.messaging()
  }

  // getStartToken() {
  //   const messaging = firebase.messaging()
  //   messaging.getToken().then((currentToken) => {
  //     if (currentToken) {
  //       sendTokenToServer(currentToken);
  //     }
  //     else {
  //       // Show permission request.
  //       RequestPermission();
  //       setTokenSentToServer(false);
  //     }
  //   }).catch((err) => {
  //     setTokenSentToServer(false);
  //   });
  // }
  // RequestPermission() {
  //   const messaging = firebase.messaging()
  //   messaging.requestPermission()
  //     .then(permission => {

  //       if (permission === 'granted') {
  //         console.log("have Permission");
  //         //calls method again and to sent token to server
  //         getStartToken();
  //       }
  //       else { console.log("Permission Denied"); }
  //     })
  //     .catch(err => {

  //     })
  // }


  requestMessagingPermissionAndGetToken(email: string) {
    // const key = firebase.database().ref().push().key
    firebase.messaging().usePublicVapidKey("BPsDZQr2d7uTVo61hA6YRR1vvxwqB_hVsO1vbO14DH6dczeH4hJgHebN6egPv0zR5wDOdwYAal6XhwWSTyz7CbI")
    // Notification.requestPermission
    firebase.messaging().requestPermission().then(done => {
      firebase.messaging().getToken().then(userToken => {
        firebase.firestore().collection("users").doc(email).update({
          msgID: firebase.firestore.FieldValue.arrayUnion(userToken)
        })
      })
    })
    firebase.messaging().onTokenRefresh(userToken => {
      firebase.firestore().collection("users").doc(email).update({
        msgID: firebase.firestore.FieldValue.arrayUnion(userToken)
      })
    })
  }
}
