(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{hU7q:function(e,t,n){"use strict";n.r(t),n.d(t,"UserModule",(function(){return g}));var i=n("tyNb"),o=n("ofXK"),b=n("3Pt+"),a=n("P9ut"),r=n("4WDQ"),c=n("PSD3"),l=n.n(c),d=n("Wcq6"),s=(n("5x/H"),n("fXoL"));function u(e,t){if(1&e&&(s.Vb(0,"div",28),s.Vb(1,"a",29),s.Qb(2,"img",30),s.Ub(),s.Ub()),2&e){var n=s.jc();s.Cb(2),s.qc("src",n.dp,s.Dc)}}function p(e,t){if(1&e&&(s.Vb(0,"div",31),s.Vb(1,"div",32),s.Qb(2,"img",33),s.Ub(),s.Qb(3,"div",34),s.Vb(4,"div"),s.Vb(5,"span",35),s.Vb(6,"span",36),s.Mc(7,"Add Photo"),s.Ub(),s.Vb(8,"span",37),s.Mc(9,"Change"),s.Ub(),s.Qb(10,"input",38),s.Ub(),s.Qb(11,"br"),s.Vb(12,"a",39),s.Qb(13,"i",40),s.Mc(14," Remove"),s.Ub(),s.Ub(),s.Ub()),2&e){var n=s.jc();s.Cb(2),s.qc("src",n.dp,s.Dc)}}var f=[{path:"",children:[{path:"pages/user/:edit",component:function(){function e(e,t){this._Activatedroute=e,this.router=t,this.username="",this.email=localStorage.getItem("email"),this.position="",this.role="",this.dp="",this.levels="",this.disabled=!0,this.service=new a.a,this.config=new r.a}return e.prototype.ngOnInit=function(){var e=this;this.service.getUserData(this.email).then((function(t){null==t?e.service.getUserData(e.email).then((function(t){e.username=t.name,e.dp=t.image,e.role=t.role,e.levels=t.access_levels,e.position=t.user_position})):(e.username=t.name,e.dp=t.image,e.role=t.role,e.levels=t.access_levels,e.position=t.user_position)})),this._Activatedroute.params.subscribe((function(t){e.disabled=t.edit}))},e.prototype.updateProfile=function(){},e.prototype.logout=function(){var e=this;l()({title:"Logout Alert",text:"Are you sure about logging out?",type:"warning",showCancelButton:!0,confirmButtonText:"Yes, log me out!",cancelButtonText:"No, keep me",confirmButtonClass:"btn btn-success",cancelButtonClass:"btn btn-danger",buttonsStyling:!1}).then((function(t){t.value?(d.auth().signOut(),localStorage.clear(),e.router.navigate(["/pages/login"])):l()({title:"Cancelled",text:"Logout not successful",type:"error",confirmButtonClass:"btn btn-info",buttonsStyling:!1}).catch(l.a.noop)}))},e.\u0275fac=function(t){return new(t||e)(s.Pb(i.a),s.Pb(i.d))},e.\u0275cmp=s.Jb({type:e,selectors:[["app-user-cmp"]],decls:58,vars:11,consts:[[1,"main-content"],[1,"container-fluid"],[1,"row"],[1,"col-md-8"],[1,"card"],[1,"card-header","card-header-icon","card-header-rose"],[1,"card-icon"],[1,"material-icons"],[1,"card-title"],[1,"card-body"],[1,"col-md-6"],[1,"form-group"],[1,"bmd-label-floating"],["type","text","name","username",1,"form-control",3,"ngModel","disabled","ngModelChange"],["type","email","name","email","disabled","",1,"form-control",3,"ngModel","ngModelChange"],["type","text","name","position",1,"form-control",3,"ngModel","disabled","ngModelChange"],["type","text","name","role","disabled","",1,"form-control",3,"ngModel","ngModelChange"],[1,"col-md-12"],["rows","5","name","levels","disabled","",1,"form-control",3,"ngModel","ngModelChange"],["mat-raised-button","","type","submit",1,"btn","btn-rose","pull-right",3,"click"],[1,"clearfix"],[1,"col-md-4"],[1,"card","card-profile"],["class","card-avatar",4,"ngIf"],["class","fileinput fileinput-new text-center","data-provides","fileinput",4,"ngIf"],[1,"card-category","text-gray"],[1,"card-description"],["href","javascript:void(0)",1,"btn","btn-danger","btn-round",3,"click"],[1,"card-avatar"],["href","javascript:void(0)"],[1,"img",3,"src"],["data-provides","fileinput",1,"fileinput","fileinput-new","text-center"],[1,"fileinput-new","thumbnail","img-circle"],["alt","...",3,"src"],[1,"fileinput-preview","fileinput-exists","thumbnail","img-circle"],[1,"btn","btn-round","btn-rose","btn-file"],[1,"fileinput-new"],[1,"fileinput-exists"],["type","file","name","..."],["href","javascript:void(0)","data-dismiss","fileinput",1,"btn","btn-danger","btn-round","fileinput-exists"],[1,"fa","fa-times"]],template:function(e,t){1&e&&(s.Vb(0,"div",0),s.Vb(1,"div",1),s.Vb(2,"div",2),s.Vb(3,"div",3),s.Vb(4,"div",4),s.Vb(5,"div",5),s.Vb(6,"div",6),s.Vb(7,"i",7),s.Mc(8,"perm_identity"),s.Ub(),s.Ub(),s.Vb(9,"h4",8),s.Mc(10,"Profile "),s.Ub(),s.Ub(),s.Vb(11,"div",9),s.Vb(12,"form"),s.Vb(13,"div",2),s.Vb(14,"div",10),s.Vb(15,"div",11),s.Vb(16,"label",12),s.Mc(17,"Username"),s.Ub(),s.Vb(18,"input",13),s.fc("ngModelChange",(function(e){return t.username=e})),s.Ub(),s.Ub(),s.Ub(),s.Vb(19,"div",10),s.Vb(20,"div",11),s.Vb(21,"label",12),s.Mc(22,"Email address"),s.Ub(),s.Vb(23,"input",14),s.fc("ngModelChange",(function(e){return t.email=e})),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Vb(24,"div",2),s.Vb(25,"div",10),s.Vb(26,"div",11),s.Vb(27,"label",12),s.Mc(28,"Position"),s.Ub(),s.Vb(29,"input",15),s.fc("ngModelChange",(function(e){return t.position=e})),s.Ub(),s.Ub(),s.Ub(),s.Vb(30,"div",10),s.Vb(31,"div",11),s.Vb(32,"label",12),s.Mc(33,"Role"),s.Ub(),s.Vb(34,"input",16),s.fc("ngModelChange",(function(e){return t.role=e})),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Vb(35,"div",2),s.Vb(36,"div",17),s.Vb(37,"div",11),s.Vb(38,"label"),s.Mc(39,"Access Levels"),s.Ub(),s.Vb(40,"div",11),s.Vb(41,"textarea",18),s.fc("ngModelChange",(function(e){return t.levels=e})),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Vb(42,"button",19),s.fc("click",(function(){return t.updateProfile()})),s.Mc(43,"Update Profile"),s.Ub(),s.Qb(44,"div",20),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Vb(45,"div",21),s.Vb(46,"div",22),s.Kc(47,u,3,1,"div",23),s.Kc(48,p,15,1,"div",24),s.Vb(49,"div",9),s.Vb(50,"h6",25),s.Mc(51),s.Ub(),s.Vb(52,"h4",8),s.Mc(53),s.Ub(),s.Vb(54,"p",26),s.Mc(55," Pronto App "),s.Ub(),s.Vb(56,"a",27),s.fc("click",(function(){return t.logout()})),s.Mc(57,"Logout"),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Ub(),s.Ub()),2&e&&(s.Cb(18),s.pc("ngModel",t.username)("disabled",t.disabled),s.Cb(5),s.pc("ngModel",t.email),s.Cb(6),s.pc("ngModel",t.position)("disabled",t.disabled),s.Cb(5),s.pc("ngModel",t.role),s.Cb(7),s.pc("ngModel",t.levels),s.Cb(6),s.pc("ngIf",t.disabled),s.Cb(1),s.pc("ngIf",!t.disabled),s.Cb(3),s.Nc(t.position),s.Cb(2),s.Nc(t.username))},directives:[b.A,b.r,b.s,b.e,b.q,b.t,o.m],encapsulation:2}),e}()}]}],g=function(){function e(){}return e.\u0275mod=s.Nb({type:e}),e.\u0275inj=s.Mb({factory:function(t){return new(t||e)},imports:[[o.c,i.g.forChild(f),b.l]]}),e}()}}]);