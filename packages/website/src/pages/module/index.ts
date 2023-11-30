import { Provider, Injectable } from '@opensumi/di';
import { BrowserModule } from '@opensumi/ide-core-browser';
import { AppContribution } from './app.contribution';
import { LogoContribution } from './logo.contribution';

@Injectable()
export class RemaxModule extends BrowserModule {
  providers: Provider[] = [AppContribution, LogoContribution];
}
