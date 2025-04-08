import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import usermanagement from './usermanagement.component';

const routes: Routes = [{ path: '', component: usermanagement }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export default class UsermanagementRoutingModule {}
