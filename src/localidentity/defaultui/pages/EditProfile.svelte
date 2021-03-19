<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { globalThemeService } from '../../../services/global.theme.service';
    import { globalStorageService } from '../../../services/global.storage.service';
    import { onMount } from 'svelte';
    import { navService } from '../nav.service';
    import type { EditProfileNavParams } from '../navparams';

    type Profile = {
        name: string;
        email: string;
    }

    let navParams: EditProfileNavParams;
    let name: string = "";
    let email: string = "";

    export class EditProfileComponent {
        async getProfileInfo() {
            const localProfile: Profile = await globalStorageService.getJSON('profile', {});
            console.log('Local profile', localProfile);

            name = localProfile.name || "";
            email = localProfile.email || "";
        }

        async toast(msg: string) {
            /* TODO const toast = await this.toastCtrl.create({
            mode: 'ios',
            color: 'primary',
            header: msg,
            duration: 3000,
            position: 'bottom'
            });
            toast.present();*/
        }

        goNext() {
            globalStorageService.setJSON(
                'profile',
                {
                    name: name ? name : 'Anonymous user',
                    email: email ? email : 'unknown@email.com'
                }
            );
            navParams.onCompletion(true);
        }
    }

    let component = new EditProfileComponent();

    onMount(async () => {
        console.log("Mouting EditIdentity component");
        navParams = navService.activeView.params as EditProfileNavParams;
		if(navParams.useExistingProfileInfo) {
            component.getProfileInfo();
        }
	});
</script>

<style lang="scss">
    .container {
        margin: 0;

        input {
            background: #f0f1ff;
            height: 50px;
            border-radius: 8px;
            border: none;
            font-size: 14px;
            width: 100%;
            padding: 0 0 0 12px;
            margin-bottom: 10px;
        }

        p {
            margin: 0;
            padding: 10px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        };
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
    }

    .dark-container {
        input {
            background: #464660;
            color: white;
        }
    }
</style>

<grid class="container" class:dark-container={globalThemeService.darkMode}>
    <input placeholder="{$_('edit-profile.enter-name')}" bind:value={name}/>
    <input placeholder="{$_('edit-profile.enter-email')}" type="email" bind:value={email}/>

    {#if navParams && navParams.useExistingProfileInfo}
    <p class="text-center">{$_('edit-profile.message')}</p>
    {/if}
</grid>

<footer class="no-border">
    <button on:click={()=>component.goNext()}>{$_('continue')}</button>
</footer>

