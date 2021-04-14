import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { NamespaceComponent } from './containers/namespace/namespace.component';

const routes: Routes = [
    {
        path: 'list',
        component: NamespaceComponent,
        data: {
            namespaceList: true
        }
    },
    {
        path: ':nsalias',
        component: NamespaceComponent
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
    },
    { path: '**', component: NamespaceComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NamespaceRoutingModule { }
