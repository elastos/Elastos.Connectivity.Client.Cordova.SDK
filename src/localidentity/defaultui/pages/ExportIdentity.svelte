<script lang="ts">
    import { onMount } from 'svelte';
    import CopyToClipboard from "svelte-copy-to-clipboard";
    import { _ } from 'svelte-i18n';
    import { connectivity } from '../../..';
    import { globalThemeService } from '../../../services/global.theme.service';
    import { identityService } from '../../services/identity.service';

    let paperkeyCopiedToClipboard = false;
    let didString: string = null;
    let paperkeyWords: string = null;
    let hidePaperkey = true;

    const handleDidStringSuccessfulCopy = () => {
        console.log('Did string copy successful');
    }

    const handleDidStringFailedCopy = () => {
        console.log('Did string copy failed');
    }

    const handlePaperkeySuccessfulCopy = () => {
        this.paperkeyCopiedToClipboard = true;
        console.log('Paperkey copy successful');
    }

    const handlePaperkeyFailedCopy = () => {
        console.log('Paperkey copy failed');
    }

    class ExportIdentityComponent {
        //private titleBarListener: (icon: TitleBarPlugin.TitleBarIcon) => void = null;

        /* TODO ionViewWillLeave() {
            titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, null);
            titleBarManager.removeOnItemClickedListener(this.titleBarListener);
            this.titleBarListener = null;
        }*/

        public showPaperkey() {
            hidePaperkey = !hidePaperkey;
        }

        public getButtonLabel() {
            if(hidePaperkey) {
                return 'exportidentity.show-paperkey';
            } else {
                return 'exportidentity.hide-paperkey';
            }
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
        paperkeyWords = await identityService.getDIDMnemonic();
    });
</script>

<style lang="scss">
    :root {
        :focus {
            outline: none;
        }
    }

    button {
        height: 50px;
        width: 100%;
        background: linear-gradient(to bottom, #732dcf, #640fd4);
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
    }

    .container {
        height: 100%;
        width: 100%;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        row {
            padding: 0 0 20px;
            width: 100%;
        }

        h4 {
            font-size: 17px;
            font-weight: 600;
            margin: 0 0 0 5px;
            text-align: left;
        }

        h6 {
            margin: 5px 0 10px;
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

    footer {
        border: none;
        padding: 0 20px 20px;

        p {
            margin: 0;
            padding: 0 10px 10px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        };
    }

    .dark-mode {
        background: #191a2f;
        color: #ffffff;

        h6 {
            box-shadow: 0 3px 15px 0 #151626;
            background-color: #2b2c49;
            color: #ffffff;
        }
    }
</style>

<div class="container" class:dark-mode={globalThemeService.darkMode}>
    <row>
        <div class="col" size="12">
            <h4>{$_('exportidentity.did')}</h4>
            <h6>{didString}</h6>
            <CopyToClipboard text={didString} on:copy={handleDidStringSuccessfulCopy} on:fail={handleDidStringFailedCopy} let:onCopy>
                <button on:click={onCopy}>{$_('exportidentity.copy-did')}</button>
            </CopyToClipboard>
        </div>
    </row>
    <row>
        <div class="col" size="12">
            <h4>{$_('exportidentity.paperkey')}</h4>
            {#if !hidePaperkey}
                <h6 id="mnemonic">{paperkeyWords}</h6>
            {:else}
                <h6 id="mnemonic">************************************</h6>
            {/if}
            <button on:click={()=>component.showPaperkey()}>{$_(component.getButtonLabel())}</button>
        </div>
    </row>
</div>

<footer class:dark-mode={globalThemeService.darkMode}>
    {#if !paperkeyCopiedToClipboard}
    <p>{$_('exportidentity.paperkey-not-copied-msg')}</p>
    <CopyToClipboard text={paperkeyWords} on:copy={handlePaperkeySuccessfulCopy} on:fail={handlePaperkeyFailedCopy} let:onCopy>
        <button on:click={onCopy}>{$_('exportidentity.copy-paperkey')}</button>
    </CopyToClipboard>
    {:else}
    <p>{$_('exportidentity.paperkey-copied-msg')}</p>
    {/if}
</footer>
