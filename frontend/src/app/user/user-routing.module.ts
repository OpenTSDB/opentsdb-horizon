import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// containers
import { UserComponent } from './containers/user/user.component';


const routes: Routes = [
    {
        path: 'list',
        component: UserComponent,
        data: {
            userList: true
        }
    },
    {
        path: ':useralias',
        component: UserComponent
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
    },
    { path: '**', component: UserComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
