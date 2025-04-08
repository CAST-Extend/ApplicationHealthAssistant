import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import PromptComponent from './prompt.component';

const routes: Routes = [{ path: '', component: PromptComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export default class PromptRoutingModule {}
