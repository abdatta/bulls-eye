import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MomentModule } from 'ngx-moment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbIconModule,
  NbMenuModule,
  NbTabsetModule,
  NbTreeGridModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbToastrModule,
  NbWindowModule,
  NbContextMenuModule,
  NbCardModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { NgxLocalStorageModule } from 'ngx-localstorage';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { JobWindowComponent } from './components/job-window/job-window.component';

const config: SocketIoConfig = { url: '/', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    ProgressBarComponent,
    PaginatorComponent,
    JobWindowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SocketIoModule.forRoot(config),
    MomentModule,
    NbThemeModule.forRoot({ name: 'corporate' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbSidebarModule.forRoot(),
    NbButtonModule,
    NbMenuModule.forRoot(),
    NbTabsetModule,
    NbTreeGridModule,
    NbContextMenuModule,
    NbWindowModule.forRoot(),
    NbTooltipModule,
    NbSpinnerModule,
    NbToastrModule.forRoot(),
    NbIconModule,
    NbCardModule,
    NgxLocalStorageModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
