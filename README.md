# Hash路由demo

### 运行
```bash
git clone git@github.com:fe-architecture-and-engineering/spa-router-hash.git
cd spa-router-hash
npm install
npm run dev
```

### 示例
```javascript
const router = new Router({
  routes: [{
    // 静态路由
    path: '/',
    name: 'home',
    // 跳转回调
    action(){},
    // 进入当前路由之前执行，阻塞式
    beforeEnter(to:Route,from:Route):boolean{},
    // action之后执行
    afterEnter(from:Route){},
    // 离开当前路由之前执行，阻塞式
    beforeLeave(to:Route):boolean{}
  },{
    // 动态路由
    path: 'user/:name/:sex',
    name: 'ucenter',
    action(){},
    beforeEnter(to:Route,from:Route):boolean{},
    afterEnter(from:Route){},
    beforeLeave(to:Route):boolean{}
    beforeUpdate():boolean{},
    afterUpdate(){}
  }],
  // 在各路由beforeEnter之前执行，阻塞式
  beforeEach(to:Route,from:Route):boolean{},
  // 在各路由afterEnter之后执行
  afterEach(current:Route){}
});
```