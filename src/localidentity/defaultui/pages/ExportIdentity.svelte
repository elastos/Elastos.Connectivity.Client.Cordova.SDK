<script lang="ts">
import { onMount } from 'svelte';

    import { _ } from 'svelte-i18n';
    import { connectivity } from '../../..';
    import { globalThemeService } from '../../../services/global.theme.service';
import { identityService } from '../../services/identity.service';

    let mnemonicCopiedToClipboard = false;
    let didString: string = null;
    let mnemonicWords: string = null;
    let hideMnemonic = true;

    class ExportIdentityComponent {
        //private titleBarListener: (icon: TitleBarPlugin.TitleBarIcon) => void = null;

        /* TODO ionViewWillLeave() {
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, null);
            titleBarManager.removeOnItemClickedListener(this.titleBarListener);
            this.titleBarListener = null;
        }*/

        public showMnemonic() {
            hideMnemonic = !hideMnemonic;
        }

        public getButtonLabel() {
            if(hideMnemonic) {
                return 'exportidentity.show-mnemonic';
            } else {
                return 'exportidentity.hide-mnemonic';
            }
        }

        public async copyMnemonicToClipboard() {
            /* TODO await this.clipboard.copy(this.mnemonicWords);
            this.toast('copied');
            this.mnemonicCopiedToClipboard = true;*/
        }

        public async copyDIDStringToClipboard() {
            /* TODO await this.clipboard.copy(this.didString);
            this.toast('copied');*/
        }

        async toast(msg: string) {
            /* TODO const toast = await this.toastCtrl.create({
            mode: 'ios',
            color: 'primary',
            header: this.translate.instant(msg),
            duration: 3000,
            position: 'top'
            });
            toast.present();*/
        }
    }

    let component = new ExportIdentityComponent();

    onMount(async ()=>{
            /* TODO titleBarManager.setTitle(this.translate.instant('exportidentity.titlebar-title'));
            titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, {
            key: "back",
            iconPath: TitleBarPlugin.BuiltInIcon.BACK
            });

            this.titleBarListener = (icon: TitleBarPlugin.TitleBarIcon) => {
            if (icon.key == "back")
                this.navCtrl.back();
            };
            titleBarManager.addOnItemClickedListener(this.titleBarListener);*/

            // Get the DID string info
            let did = await identityService.getLocalDID();
            didString = did.getDIDString();

            // Get the DID mnemonic info
            mnemonicWords = await identityService.getDIDMnemonic();
    });
</script>

<style lang="scss">
    .container {
        height: 100%;
        padding: 10px 20px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        row {
            padding: 0 0 20px;

            col {
                h1 {
                    font-size: 17px;
                    font-weight: 600;
                    margin: 0 0 0 5px;
                    text-align: left;

                }

                h3 {
                    margin: 5px 0 10px;;
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                    word-wrap: wrap;

                    border-radius: 17px;
                    padding: 20px;
                    box-shadow: 0 3px 15px 0 #ededf0;
                    background-color: #ffffff;
                }
                #mnemonic {
                    line-height: 1.75;
                }
            }
        }
    }

    .dark-container {
        .row {
            col {
                h3 {
                    box-shadow: 0 3px 15px 0 #151626;
                    background-color: #2b2c49;
                }
            }
        }
    }

    footer {
        p {
            padding: 0px 20px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
        };
    }
</style>

<content class="text-center">
    <grid class="container" class:dark-container={globalThemeService.darkMode}>
      <row>
        <div class="col" size="12">
          <h1>{$_('exportidentity.did')}</h1>
          <h3>{didString}</h3>
          <button on:click={()=>component.copyDIDStringToClipboard()}>{$_('exportidentity.copy-did')}</button>
        </div>
      </row>
      <row>
        <div class="col" size="12">
          <h1>{$_('exportidentity.mnemonic')}</h1>
          {#if !hideMnemonic}
          <h3 id="mnemonic">{mnemonicWords}</h3>
          {:else}
          <h3 id="mnemonic">************************************</h3>
          {/if}

          <button on:click={()=>component.showMnemonic()}>{$_(component.getButtonLabel())}</button>
        </div>
      </row>
    </grid>
</content>

<footer class="no-border">
    {#if !mnemonicCopiedToClipboard}
    <p>{$_('exportidentity.mnemonic-not-copied-msg')}</p>
    <button on:click={()=>component.copyMnemonicToClipboard()}>{$_('exportidentity.copy-mnemonic')}</button>
    {:else}
    <p>{$_('exportidentity.mnemonic-copied-msg')}</p>
    {/if}
</footer>