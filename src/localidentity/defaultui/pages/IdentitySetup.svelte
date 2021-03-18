<script lang="ts">
    import moment from 'moment';
    import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
    import { Swiper, SwiperSlide } from 'swiper/svelte';
    import SwiperCore, { Navigation, Pagination, Scrollbar } from 'swiper/core';
    import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';

    // https://swiperjs.com/svelte

    import { DIDPublicationStatus } from '../../model/didpublicationstatus.model';
    import { HiveCreationStatus } from '../../model/hivecreationstatus.model';
    import type { PersistentInfo } from '../../model/persistentinfo.model';
    import { identityService } from '../../services/identity.service';
    import { storageService } from '../../services/storage.service';
    import { hiveService } from '../../services/hive.service';
    import { persistenceService } from '../../services/persistence.service';
    import { globalStorageService } from '../../../services/global.storage.service';
    import { navService } from '../nav.service';
    import { ViewType } from '../viewtype';
    import type { EditProfileNavParams } from '../navparams';

    // https://swiperjs.com/swiper-api#custom-build
    SwiperCore.use([Navigation, Pagination, Scrollbar]);

    const swiperOptions = {
        /*pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },*/
    };

    // NOTE: Bindings used in html code must be defined at the component root, not in the typescript class
    // otherwise changes are not detected dynamically by svelte.
    let swiper: Swiper;
    let activeSlideIndex = 0;
    let showSpinner = false;
    let suggestRestartingFromScratch = false;
    let hiveIsBeingConfigured = false;
    let progress = 0;

    class IdentitySetupComponent {
        // On init
        // TODO titleBarManager.setTitle(this.translate.instant('identitysetup.titlebar-title'));
        // TODO titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);

        slideNext() {
            swiper().slideNext();
        }

        onSwiped(data) {
            activeSlideIndex = swiper().activeIndex;
            console.log("on swiped", data, activeSlideIndex)
        }

        async newDID() {
            await this.resumeIdentitySetupFlow();
        }

        async editProfile() {
            navService.navigateTo(ViewType.EditProfile, {
                useExistingProfileInfo: false,
                onCompletion: (profileFilled) => {
                    if (profileFilled) {
                        showSpinner = true;
                        this.newDID();
                    }
                }
            } as EditProfileNavParams);
        }

        /**
         * Continues the identity creation process where it was stopped.
         */
        async resumeIdentitySetupFlow() {
            console.log("Resuming identity setup flow");

            await new Promise<void>((resolve)=>{
                setTimeout(async ()=>{
                    try {
                        // Local DID creation
                        if (!this.isLocalDIDcreated()) {
                            progress = 0.01;
                            await identityService.createLocalIdentity();
                        }

                        if (!this.isDIDOnChain() && !this.isDIDBeingPublished()) {
                            progress = 0.01;
                            let interval = setInterval(() => {
                            if(progress >= 0.90) {
                                clearInterval(interval);
                            } else {
                                progress += 0.01;
                                globalStorageService.set('progressDate', new Date());
                                globalStorageService.set('progress', progress);
                            }
                            }, 10000);
                            await identityService.publishIdentity();
                        }

                        if (!this.isDIDOnChain() && this.isDIDBeingPublished()) {
                            const progressDate = await globalStorageService.get('progressDate', null);
                            const storageProgress = parseFloat(await globalStorageService.get('progress', null));
                            let newProgress: number = null;

                            // If progress was previously initiated before starting app
                            if(progressDate && storageProgress) {
                            console.log('Last progress time', moment(progressDate).format('LT'));
                            console.log('Left off at progress', storageProgress);

                            // Get saved date
                            const before = moment(progressDate);
                            const now = moment(new Date());
                            // Find duration in seconds between saved date and now
                            const duration = moment.duration(now.diff(before));
                            const durationInSeconds = duration.asSeconds();
                            console.log('Progress in between in seconds', durationInSeconds);
                            // Divide duration in a way progress can handle. ex: 10 seconds / 1000 = 0.01 which is 1%
                            const additionalProgress = durationInSeconds / 1000;
                            console.log('Progress while user was absent', additionalProgress);
                            // Add new progress to saved progress
                            newProgress = additionalProgress + storageProgress;
                            }

                            if(newProgress && newProgress <= 0.9) {
                                progress = newProgress
                            } else if(progress >= 0.9) {
                                progress = 0.9;
                            } else {
                                progress = 0.01;
                            }

                            console.log('Progress', progress);
                            let interval = setInterval(() => {
                            if(progress >= 0.90) {
                                clearInterval(interval);
                            } else {
                                progress += 0.01;
                                globalStorageService.set('progressDate', new Date());
                                globalStorageService.set('progress', progress);
                            }
                            }, 10000);
                            await this.repeatinglyCheckAssistPublicationStatus();
                        }

                        if (!this.isHiveVaultReady()) {
                            progress = 0.90;
                            let interval = setInterval(() => {
                            if(progress >= 0.99) {
                                clearInterval(interval);
                            } else {
                                progress += 0.01;
                            }
                            }, 10000);
                            await this.prepareHiveVault();
                        }
                    }
                    catch (e) {
                        // Catch all unhandled exceptions. When this happens, we:
                        // TODO 1) send a silent sentry report to be able to understand what's going on remotely
                        // 2) suggest user to restart the process fresh, as something is broken.
                        console.warn("Handled global exception:", e);
                        suggestRestartingFromScratch = true;
                        resolve();
                    }
                }, 1000);
            });
        }

        wasTemporaryIdentityCreationStarted(): boolean {
            return this.isLocalDIDcreated();
        }

        isLocalDIDcreated(): boolean {
            let persistenceInfo = persistenceService.getPersistentInfo();
            return persistenceInfo.did.didString != null;
        }

        isDIDBeingPublished(): boolean {
            let persistenceInfo = persistenceService.getPersistentInfo();
            return persistenceInfo.did.publicationStatus == DIDPublicationStatus.AWAITING_PUBLICATION_CONFIRMATION;
        }

        isDIDOnChain(): boolean {
            let persistenceInfo = persistenceService.getPersistentInfo();
            return persistenceInfo.did.publicationStatus == DIDPublicationStatus.PUBLISHED_AND_CONFIRMED;
        }

        isHiveVaultReady(): boolean {
            let persistenceInfo = persistenceService.getPersistentInfo();
            return persistenceInfo.hive.creationStatus == HiveCreationStatus.VAULT_CREATED_AND_VERIFIED;
        }

        isHiveBeingConfigured(): boolean {
            return hiveIsBeingConfigured;
        }

        isEverythingReady(): boolean {
            return this.isHiveVaultReady();
        }

        async prepareHiveVault() {
            hiveIsBeingConfigured = true;
            try {
                await hiveService.prepareHiveVault();
            }
            catch (e) {
                throw e;
            } finally {
                hiveIsBeingConfigured = false;
            }
        }

        private sleep(ms: number): Promise<void> {
            return new Promise((resolve)=>{
                setTimeout(() => {
                    resolve();
                }, ms);
            })
        }

        /**
         * Checks assist publication status in a loop until we know the transaction is successful or failing.
         */
        async repeatinglyCheckAssistPublicationStatus(): Promise<void> {
            let persistenceInfo: PersistentInfo = null;
            let firstAttempt = true;

            do {
                if (!firstAttempt) {
                    console.log("Waiting a few seconds before checking again");
                    await this.sleep(15000); // Wait 15s before trying again
                }

                await identityService.checkPublicationStatusAndUpdate();

                // Check the new status
                persistenceInfo = persistenceService.getPersistentInfo();

                firstAttempt = false;
            }
            while (persistenceInfo.did.publicationStatus == DIDPublicationStatus.AWAITING_PUBLICATION_CONFIRMATION);
        }

        /**
         * This identity setup screen is normally reached because an intent such as credaccess was received,
         * but no identity exists yet. After the identity is fully created, we can then continue to where we should have
         * been at first, if the identity existed.
         */
        continueToOriginalLocation() {
            // NOTE: For now, we always consider we are coming from a "credaccess" intent request. To be improved later.
            // TODO this.navCtrl.navigateRoot("credaccess");
        }

        /**
         * Clears all context and restarts identity creation from 0.
         */
        async restartProcessFromScratch() {
            suggestRestartingFromScratch = false;
            await identityService.resetOnGoingProcess();
            this.resumeIdentitySetupFlow();
        }

        getProgress() {
            let percent = progress * 100;
            return percent.toFixed(0);
        }
    }

    let component = new IdentitySetupComponent();

    function getProgress() {
        // TODO: SHOULD BE IN THE COMPONENT, JUST CHECKING WHY SVELTE DOESN'T DETECTED
        // CHANGES IN THE COMPONENT CLASS
        return component.getProgress();
    }

    onMount(async () => {
        console.log("Mouting IdentitySetup component");
		if (!component.isEverythingReady() && component.wasTemporaryIdentityCreationStarted()) {
            // Basic Identity configuration is not complete. So we are going to resume at the step we were earlier.
            component.resumeIdentitySetupFlow();
        }
	});
</script>

<style type="text/scss">
    :global(.swiper-slide) {
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


        @keyframes imgAnimate {
            0% { width: 0px; height: 0px; }
            100% { width: 100px; height: 100px; }
        }
        }

        h1 {
        font-size: 17px;
        font-weight: 600;
        margin-bottom: 5px;
        }

        h2 {
        font-size: 25px;
        font-weight: 700;
        letter-spacing: -0.43px;
        margin: 0;
        }

        p {
        font-size: 14px;
        font-weight: 500;
        }
    }

    content {
        img {
            width: 100px;
            height: 100px;
            animation: imgAnimate;
            animation-duration: 1000ms;
            animation-fill-mode: forwards;


            @keyframes imgAnimate {
            0% { width: 0px; height: 0px; }
            100% { width: 100px; height: 100px; }
            }
        }

        h1 {
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        h2 {
            font-size: 25px;
            font-weight: 700;
            letter-spacing: -0.43px;
            margin: 0;
        }

        p {
            font-size: 14px;
            font-weight: 500;
        }

        grid {
            height: 100%;
            padding: 10px 20px;

            ion-icon, ion-spinner {
            width: 25px;
            height: 25px;
            color: #732dcf;
            }

            .steps-row {
            border-radius: 17px;
            padding: 10px;
            margin-bottom: 7.5px;
            box-shadow: 0 3px 15px 0 #ededf0;
            background-color: #ffffff;

            ion-col {
                display: flex;
                justify-content: space-between;
                align-items: center;

                ion-label {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                width: 85%;

                h1, h2 {
                    margin: 0;
                }

                h1 {
                    font-size: 17px;
                    font-weight: 600;
                    text-align: left;
                }

                h2 {
                    font-size: 13px;
                    font-weight: 500;
                    padding: 5px 0 0;
                    text-align: left;
                    word-wrap: break-word;
                }
                }

                .done {
                color: #10dc60;
                }

                .pending {
                color: #ffce00;
                }
            }
            }

            .done-msg {
                margin-top: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;

                p {
                    padding: 0px 20px;
                    font-size: 12px;
                    font-weight: 600;
                };
            }

            .progress-msg {
                p {
                    margin: 0;
                    padding: 17.5px;
                    font-size: 12px;
                    font-weight: 600;
                };
            }
        }
    }

    footer {
        p {
            padding: 0px 20px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;

            span {
                font-size: 12px;
            }
        };

        button {
            padding:20px;
            background: #a9c5eb;
        }
    }
</style>

<content class="text-center">
    {#if !component.wasTemporaryIdentityCreationStarted()}
    <Swiper bind:swiper={swiper} {swiperOptions} spaceBetween={50} slidesPerView={1}
    pagination={{ clickable: true }} on:slideChange={component.onSwiped} on:swiper={(e) => console.log(e.detail[0])}>
            <SwiperSlide>
                <img src="assets/localidentity/icons/did.svg" alt="" />
                <h1>{$_("welcome")}</h1>
                <h2>{$_("my-first-did")}</h2>
            </SwiperSlide>
            <SwiperSlide>
                <LottiePlayer
                    src="assets/localidentity/animations/fingerprint.json"
                    background="transparent"
                    speed="1"
                    style="width: 150px; height: 150px;"
                    autoplay="{true}"
                    loop="{true}"
                />
                <p>{$_("identitysetup.slide2-msg")}</p>
                <p>{$_("identitysetup.slide2-msg2")}</p>
            </SwiperSlide>
            <SwiperSlide>
                <LottiePlayer
                    src="assets/localidentity/animations/device.json"
                    background="transparent"
                    speed="1"
                    style="width: 300px; height: 300px;"
                    autoplay="{true}"
                    loop="{true}"
                />
                <p>
                    {$_("identitysetup.slide3-msg")}
                </p>
            </SwiperSlide>

            <div class="swiper-pagination" slot="pagination"></div>
            <div class="swiper-button-next" slot="button-next"></div>
            <div class="swiper-button-prev" slot="button-prev"></div>
        </Swiper>
    {:else}
        <grid>
            <ion-row class="steps-row">
                <ion-col size="12">
                    <ion-label>
                        <h1>{$_("identitysetup.create-did")}</h1>
                        <h2>{$_("identitysetup.create-did-msg")}</h2>
                    </ion-label>
                    {#if component.isLocalDIDcreated()}
                        <ion-icon
                            class="done"
                            name="checkmark-circle-outline"
                        />
                    {:else}
                        <ion-spinner />
                    {/if}
                </ion-col>
            </ion-row>
            <ion-icon name="arrow-down-circle-outline" />
            <ion-row class="steps-row">
                <ion-col size="12">
                    <ion-label>
                        <h1>{$_("identitysetup.publish-did")}</h1>
                        <h2>{$_("identitysetup.publish-did-msg")}</h2>
                    </ion-label>
                    {#if component.isDIDOnChain()}
                        <ion-icon
                            class="done"
                            name="checkmark-circle-outline"
                        />
                    {:else if !component.isDIDBeingPublished()}
                        <ion-icon class="pending" name="timer-outline" />
                    {:else if !component.isDIDOnChain()}
                        <ion-spinner />
                    {/if}
                </ion-col>
            </ion-row>
            <ion-icon name="arrow-down-circle-outline" />
            <ion-row class="steps-row">
                <ion-col size="12">
                    <ion-label>
                        <h1>{$_("identitysetup.config-storage")}</h1>
                        <h2>{$_("identitysetup.config-storage-msg")}</h2>
                    </ion-label>
                    {#if component.isHiveVaultReady()}
                        <ion-icon
                            class="done"
                            name="checkmark-circle-outline"
                        />
                    {:else if !component.isHiveBeingConfigured()}
                        <ion-icon class="pending" name="timer-outline" />
                    {:else}
                        <ion-spinner />
                    {/if}
                </ion-col>
            </ion-row>

            {#if !component.isEverythingReady()}
                <div class="progress-msg">
                    <p>{$_("identitysetup.progress-msg")}</p>
                </div>
            {:else}
                <div class="done-msg">
                    <lottie-player
                        src="assets/animations/checkmark.json"
                        background="transparent"
                        speed="1"
                        style="width: 150px; height: 150px;"
                        autoplay
                        loop
                    />
                    <p>{$_("identitysetup.done-msg")}</p>
                </div>
            {/if}
        </grid>
    {/if}
</content>

<footer class="no-border">
    {#if !component.wasTemporaryIdentityCreationStarted()}
        <div>
            {#if !showSpinner && activeSlideIndex < 2}
                <button on:click={()=>component.slideNext()}>
                    {$_("next")}
                </button>
            {/if}
            {#if !showSpinner && activeSlideIndex >= 2}
                <button on:click={()=>component.editProfile()}>
                    {$_("identitysetup.create-my-did")}
                </button>
            {/if}
            {#if showSpinner}
                <button disabled>
                    <ion-spinner />
                </button>
            {/if}
        </div>
    {/if}

    {#if suggestRestartingFromScratch}
        <div>
            <p>{$_("identitysetup.error-msg")}</p>
            <button on:click={()=>component.restartProcessFromScratch()}>
                {$_("identitysetup.restart")}
            </button>
        </div>
    {/if}
    {#if component.wasTemporaryIdentityCreationStarted() && !suggestRestartingFromScratch}
        <div>
            {#if !component.isEverythingReady()}
                <div>
                    <p>
                        <strong>{getProgress()}</strong><span
                            >% {$_("identitysetup.takes-long-time")}</span
                        >
                    </p>
                    <ion-progress-bar
                        mode="ios"
                        type="determinate"
                        value="progress"
                    />
                </div>
            {:else}
                <button on:click={()=>component.continueToOriginalLocation()}>
                    {$_("continue")}
                </button>
            {/if}
        </div>
    {/if}
</footer>