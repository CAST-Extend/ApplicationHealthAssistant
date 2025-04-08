import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';

import ButtonComponent from './components/button/button.component';

@NgModule({
    declarations: [ButtonComponent],
    imports: [MatTableModule, MatStepperModule, MatIconModule],
    exports: [ButtonComponent],
})
export default class SharedModule {}
