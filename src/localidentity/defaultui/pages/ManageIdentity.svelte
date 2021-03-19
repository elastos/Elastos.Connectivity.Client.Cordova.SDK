<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { navService } from '../nav.service';
    import type { EditProfileNavParams, ExportIdentityNavParams } from '../navparams';
    import { ViewType } from '../viewtype';

    class ManageIdentityComponent {
        /* TODO ionViewDidEnter() {
            titleBarManager.setTitle(this.translate.instant('manageidentity.titlebar-title'));
            titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
        }*/

        public exportIdentity() {
            navService.navigateTo(ViewType.ExportIdentity, {
                onCompletion: () => {
                    navService.navigateTo(ViewType.ManageIdentity);
                }
            } as ExportIdentityNavParams);
        }

        async editProfile() {
            navService.navigateTo(ViewType.EditProfile, {
                useExistingProfileInfo: true,
                onCompletion: () => {
                    navService.navigateTo(ViewType.ManageIdentity);
                }
            } as EditProfileNavParams);
        }
    }

    let component = new ManageIdentityComponent();

</script>

<style lang="scss">
.container {
    height: 100%;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
        width: 100px;
        height: 100px;
        animation: imgAnimate;
        animation-duration: 1000ms;
        animation-fill-mode: forwards;
        padding-bottom: 20px;

        @keyframes imgAnimate {
            0% { width: 0px; height: 0px; }
            100% { width: 100px; height: 100px; }
        }
    }

    p {
        font-size: 14px;
        font-weight: 500;
    }
}

footer {
    button {
        height: 50px;
        width: 100%;
        background: linear-gradient(to bottom, #732dcf, #640fd4);
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
    }

    .first-btn {
        margin-bottom: 5px;
    }
}

</style>

<content class="ion-text-center">
    <grid class="container">
        <img src="assets/localidentity/icons/did.svg" alt="">
        <p>
        {$_('manageidentity.intro')} <b>{$_('temp-did')}</b>, {$_('manageidentity.intro2')}
        </p>
        <p>{$_('manageidentity.intro3')}</p>
    </grid>
</content>

<footer class="ion-no-border">
    <button class="first-btn" on:click={()=>component.editProfile()}>{$_('manageidentity.edit-profile')}</button>
    <button on:click={()=>component.exportIdentity()}>{$_('manageidentity.export-did')}</button>
</footer>
