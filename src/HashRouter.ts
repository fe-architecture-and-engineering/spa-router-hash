type KV<T> = {
  [key: string]: T;
};

type RouteInfo = {
  path: string;
  name?:string;
  action: Function;
  beforeEnter ? : Function;
  afterEnter ? : Function;
  beforeLeave ? : Function;
  beforeUpdate?:Function;
  afterUpdate?:Function;
};

type RouterOption = {
  routes: RouteInfo[];
  hashbang ? : boolean;
  beforeEach ? : Function;
  afterEach ? : Function;
};

const DEFAULT_OPTION: RouterOption = {
  hashbang: true,
  routes: []
};

function isEmpty(val:any):boolean {
  if (Object.prototype.toString.call(val) !== '[object Array]') {
    return true;
  }
  return val.length === 0;
}

function isFunction(val:any):boolean{
  return typeof val === 'function';
}

function formatPath(path:string):string{
  if(!/^\//.test(path)){
    path = `/${path}`;
  }
  return path;
}
/**
 * @class Route
 */
export class Route {
  static paramPattern = /\/\:\b(\w+)\b/g;
  private readonly _requiredParams:string[]=[];
  private readonly _validator:RegExp;
  private readonly _path:string;
  private readonly _action:Function|null=null;
  public readonly name:string;
  public readonly afterEnter:Function|null=null;
  public readonly beforeEnter:Function|null=null;
  public readonly afterUpdate:Function|null=null;
  public readonly beforeUpdate:Function|null=null;
  public readonly beforeLeave:Function|null=null;
  public readonly params:KV<string|undefined>={};
  public fullpath:string='';
  constructor(info:RouteInfo){
    const {
      path,
      name,
      action,
      beforeEnter,
      afterEnter,
      beforeUpdate,
      afterUpdate,
      beforeLeave
    } = info;
    this.name = name;
    // 修正路径
    this._path = formatPath(path);
    isFunction(action)&&(this._action=action.bind(this));
    isFunction(beforeEnter)&&(this.beforeEnter=beforeEnter.bind(this));
    isFunction(afterEnter)&&(this.afterEnter=afterEnter.bind(this));
    isFunction(beforeUpdate)&&(this.beforeUpdate=beforeUpdate.bind(this));
    isFunction(afterUpdate)&&(this.afterUpdate=afterUpdate.bind(this));
    isFunction(beforeLeave)&&(this.beforeLeave=beforeLeave.bind(this));

    let tmpPath =  this._path;
    let match = Route.paramPattern.exec(this._path);
    while(match){
      const param = match[1];
      this._requiredParams.push(param);
      this.params[param] = undefined;
      tmpPath = tmpPath.replace(`/:${param}`,'/(\\w+)');
      match = Route.paramPattern.exec(this._path);
    }
    Route.paramPattern.lastIndex = 0;
    this._validator = new RegExp(`^${tmpPath.replace(/\//g,'\\/')}$`);
  }
  /**
   * 匹配目标路径是否为当前路由
   */
  public match(fullpath:string):boolean{
    return this._validator.test(fullpath);
  }
  /**
   * 解析参数并执行action
   */
  public parse(fullpath:string){
    this.fullpath = fullpath;
    if(!isEmpty(this._requiredParams)){
      const match = this._validator.exec(fullpath);
      for(let i=0,len=this._requiredParams.length;i<len;i++){
        this.params[this._requiredParams[i]] = match[i+1];
      }
    }
    this._action();
  }
}
/**
 * @class Router
 */
export default class Router {
  private readonly _hashbang: boolean;
  private readonly _hashPrefix:string;
  private readonly _pathPattern:RegExp;
  private readonly _routes: KV<Route>={};
  private readonly _history:string[]=[];
  private readonly _beforeEach:Function|null=null;
  private readonly _afterEach:Function|null=null;
  private _current:Route|null=null;
  constructor(options: RouterOption) {
    if (!options || !options.routes || isEmpty(options.routes)) {
      this._onError('参数错误');
    }
    const opt = {
      ...DEFAULT_OPTION,
      ...options
    };
    this._hashbang = opt.hashbang;
    this._hashPrefix = this._hashbang?'#!':'#';
    this._pathPattern = new RegExp(`^${this._hashPrefix}(.+)`);
    isFunction(opt.beforeEach)&&(this._beforeEach=opt.beforeEach.bind(this));
    isFunction(opt.afterEach)&&(this._afterEach=opt.afterEach.bind(this));
    this._addRoutes(opt.routes);
    this._start();
  }
  private _addRoutes(infolist: RouteInfo[]) {
    for(const info of infolist){
      const name = info.name || '';
      if(this._routes[name]){
        this._onError('name不能重复');
      }
      if(!name){
        info.name = `${name}_${Math.random().toString(16)}`;
      }
      this._routes[info.name] = new Route(info);
    }
  }
  private _start(){
    const hash = window.location.hash;
    if(!hash){
      // 干净页面初始化hash
      window.location.hash = `${this._hashPrefix}/`;
    }
    window.addEventListener('hashchange', (ev:HashChangeEvent)=>{
      this._onHashChange(ev.newURL);
    },false);
    this._restore();
  }
  /**
   * 恢复路由状态，用于刷新页面
   */
  private _restore() {
    this._onHashChange(window.location.href);
  }
  private _onHashChange(url:string) {
    const path = this._getPath(url);
    const route = this._matchRoute(path);
    if(route){
      // 匹配成功新增历史
      this._history.push(path);
      route.parse(path);

      const isSameRoute = this._current&&this._current.name===route.name||false;
      // 同一个route触发afterUpdate，否则触发目标route的afterEnter
      isSameRoute?route.afterUpdate&&route.afterUpdate():route.afterEnter&&route.afterEnter(this._current);

      this._current = route;
      // 非同一个route间的跳转后触发全局_beforeEach
      !isSameRoute&&this._afterEach&&this._afterEach(route);
    }else{
      this._onError('无匹配路由，请检查路径');
    }
  }
  private _matchRoute(path:string):Route|null{
    for(const name in this._routes){
      const route = this._routes[name];
      if(route.match(path)){
        return route;
      }
    }
    return null;
  }
  private _getPath(url: string): string {
    const el = document.createElement('a');
    el.href = url;
    const hash = el.hash;
    const match = this._pathPattern.exec(hash);
    return match?match[1]:'';
  }
  private _onError(msg?:string){
    throw new Error(msg);
  }
  public go(path: string) {
    const targetHash = `${this._hashPrefix}${path}`;
    const target = this._matchRoute(path);
    if(!target){
      this._onError('无匹配路由，请检查路径');
      return;
    }
    const isSameRoute = this._current&&this._current.name===target.name||false;
    let allow = true;
    if(this._current){
      const {beforeUpdate,beforeLeave} = this._current;
      if(isSameRoute){
        const currentParams = {...this._current.params};
        target.parse(path);
        const targetParams = {...target.params};
        let needUpdate = false;
        for(const key in currentParams){
          // 参数值改变触发更新
          if(currentParams[key]!==targetParams[key]){
            needUpdate = true;
            break;
          }
        }
        needUpdate?beforeUpdate&&(allow=beforeUpdate()):(allow=false);
      }else{
        // 首先出发当前route beforeLeave
        beforeLeave&&(allow=beforeLeave(target));
      }
    }
    // 返回false则中断跳转
    if(!allow){
      return;
    }
    // 非同一个route间的跳转前依次触发全局_beforeEach和target beforeEnter
    if(!isSameRoute){
      this._beforeEach&&this._beforeEach(target,this._current);
      target.beforeEnter&&(allow=target.beforeEnter(target,this._current));
    }
    // target beforeEnter也可以中断跳转
    if(!allow){
      return;
    }
    window.location.hash = targetHash;
  }
  public back(){
    this._history.pop();
    window.history.back();
  }
}