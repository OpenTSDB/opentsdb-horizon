import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {

    handlers: {[key: string]: DetachedRouteHandle} = {};

    constructor() {
        //console.log('custom reuse ctor');
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data.shouldReuse || false;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
        return future.data.shouldReuse || false;
    }

    retrieve(route: ActivatedRouteSnapshot) : DetachedRouteHandle {
        if (!route.routeConfig) return null;
        return this.handlers[route.routeConfig.path];
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        if (route.data.shouldReuse) {
            this.handlers[route.routeConfig.path] = handle;
        }
    }
}