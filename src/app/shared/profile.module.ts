import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from '../components/main/container/user-profile/user-profile.component';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        UserProfileComponent
    ],
    imports: [
        SharedModule
    ],
    exports: [
        CommonModule,
        UserProfileComponent
    ]
})
export class ProfileModule { }