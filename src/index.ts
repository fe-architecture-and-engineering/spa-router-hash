import Router, { Route } from './HashRouter';

const $btn_home = document.getElementById('home');
const $btn_back = document.getElementById('back');
const $btn_u_joe = document.getElementById('u-joe');
const $btn_u_sunny = document.getElementById('u-sunny');
const $view_body = document.getElementById('router-view__body');
const $view_path = document.getElementById('router-view__path');

$btn_home.addEventListener('click',ev=>{
  router.go('/');
},false);

$btn_back.addEventListener('click',ev=>{
  router.back();
},false);

$btn_u_joe.addEventListener('click',ev=>{
  router.go('/user/joe/male');
},false);

$btn_u_sunny.addEventListener('click',ev=>{
  router.go('/user/sunny/female');
},false);

function updateViewPath(path:string){
  $view_path.innerHTML = path;
}

function updateViewBody(content:string){
  $view_body.innerHTML = content;
}

const router = new Router({
  routes: [{
    path: '/',
    name: 'home',
    action(){
      updateViewPath(this.name);
      updateViewBody('首页');
    },
    beforeEnter(to:Route,from:Route):boolean{
      console.log(`called:${to.name}-beforeEnter/from:${from&&from.name||''}`);
      return true;
    },
    afterEnter(from:Route){
      console.log(`called:${this.name}-afterEnter/from:${from&&from.name||''}`);
    },
    beforeLeave(to:Route):boolean{
      console.log(`called:${this.name}-beforeLeave/to:${to.name}`);
      return true;
    }
  },{
    path: 'user/:name/:sex',
    name: 'ucenter',
    action(){
      updateViewPath(this.name);
      updateViewBody(`你好，${this.params.name}${this.params.sex==='female'?'女士':'先生'}`);
    },
    beforeEnter(to:Route,from:Route):boolean{
      console.log(`called:${to.name}-beforeEnter/from:${from&&from.name||''}`);
      return true;
    },
    afterEnter(from:Route){
      console.log(`called:${this.name}-afterEnter/from:${from&&from.name||''}\n`);
    },
    beforeLeave(to:Route):boolean{
      console.log(`called:${this.name}-beforeLeave/to:${to.name}`);
      return true;
    },
    beforeUpdate():boolean{
      console.log(`called:${this.name}-beforeUpdate`);
      return true;
    },
    afterUpdate(){
      console.log(`called:${this.name}-afterUpdate`);
    }
  }],
  beforeEach(to:Route,from:Route):boolean{
    console.log(`called:global-beforeEach/from:${from.name}-to:${to.name}`);
    return true;
  },
  afterEach(current:Route){
    console.log(`called:global-afterEach/current route:${current.name}`);
  }
});