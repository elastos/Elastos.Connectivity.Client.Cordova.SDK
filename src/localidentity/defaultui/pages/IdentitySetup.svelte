<ion-content class="ion-text-center">
    {#if !wasTemporaryIdentityCreationStarted()}
        <ion-slides id="slider" pager="true">
            <ion-slide>
                <img src="assets/icons/did.svg" alt=""/>
                <h1>{$_("welcome")}</h1>
                <h2>{$_("my-first-did")}</h2>
            </ion-slide>
            <ion-slide>
                <lottie-player
                    src="assets/animations/fingerprint.json"
                    background="transparent"
                    speed="1"
                    style="width: 150px; height: 150px;"
                    autoplay
                    loop
                />
                <p>{$_("identitysetup.slide2-msg")}</p>
                <p>{$_("identitysetup.slide2-msg2")}</p>
            </ion-slide>
            <ion-slide>
                <lottie-player
                    src="assets/animations/device.json"
                    background="transparent"
                    speed="1"
                    style="width: 300px; height: 300px;"
                    autoplay
                    loop
                />
                <p style="position: relative; top: -75px;">
                    {$_("identitysetup.slide3-msg")}
                </p>
            </ion-slide>
        </ion-slides>
    {:else}
        <ion-grid>
            <ion-row class="steps-row">
                <ion-col size="12">
                    <ion-label>
                        <h1>{$_("identitysetup.create-did")}</h1>
                        <h2>{$_("identitysetup.create-did-msg")}</h2>
                    </ion-label>
                    {#if isLocalDIDcreated()}
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
                    {#if isDIDOnChain()}
                    <ion-icon
                        class="done"
                        name="checkmark-circle-outline"
                    />
                    {:else}
                        {#if !isDIDBeingPublished()}
                        <ion-icon
                            class="pending"
                            name="timer-outline"
                        />
                        {:else}
                            {#if !isDIDOnChain()}
                            <ion-spinner/>
                            {/if}
                        {/if}
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
                    {#if isHiveVaultReady()}
                    <ion-icon
                        class="done"
                        name="checkmark-circle-outline"
                    />
                    {:else}
                        {#if !isHiveBeingConfigured()}
                        <ion-icon
                            class="pending"
                            name="timer-outline"
                        />
                        {:else}
                        <ion-spinner/>
                        {/if}
                    {/if}
                </ion-col>
            </ion-row>

            {#if !isEverythingReady()}
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
        </ion-grid>
    {/if}
</ion-content>

<ion-footer class="ion-no-border">
    {#if !wasTemporaryIdentityCreationStarted()}
        <div>
            {#if !showSpinner && slideIndex < 2}
                <button on:click={slideNext}>
                    {$_("next")}
                </button>
            {/if}
            {#if !showSpinner && slideIndex >= 2}
                <ion-button on:click={editProfile}>
                    {$_("identitysetup.create-my-did")}
                </ion-button>
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
            <button on:click={restartProcessFromScratch}>
                {$_("identitysetup.restart")}
            </button>
        </div>
    {/if}
    {#if wasTemporaryIdentityCreationStarted() && !suggestRestartingFromScratch}
        <div>
            {#if !isEverythingReady()}
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
            <button on:click={continueToOriginalLocation}>
                {$_("continue")}
            </button>
            {/if}
        </div>
    {/if}
</ion-footer>

<script lang="ts">
    import { _ } from 'svelte-i18n';

    import { DIDPublicationStatus } from '../../model/didpublicationstatus.model';
    import { HiveCreationStatus } from '../../model/hivecreationstatus.model';
    import type { PersistentInfo } from '../../model/persistentinfo.model';
    import moment from 'moment';

    let showSpinner = false;

    let slideIndex = 0;
    let suggestRestartingFromScratch = false;
    let hiveIsBeingConfigured = false;

    // On init
    // TODO titleBarManager.setTitle(this.translate.instant('identitysetup.titlebar-title'));
    // TODO titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);

    if (!this.isEverythingReady() && this.wasTemporaryIdentityCreationStarted()) {
      // Basic Identityh configuration is not complete. So we are going to resume at the step we were earlier.
      this.resumeIdentitySetupFlow();
    }

    function slideNext() {
        // TODO this.slider.slideNext();
    }
/*
    async getActiveSlide() {
        this.slideIndex = await this.slider.getActiveIndex();
    }
    */

    async function newDID() {
        await this.resumeIdentitySetupFlow();
    }

  async function editProfile() {
    /* TODO const modal = await this.modalCtrl.create({
      component: EditProfileComponent,
      componentProps: {
        from: Page.IDENTITYSETUP
      },
      cssClass: 'fullscreen'
    });
    modal.onDidDismiss().then((params) => {
      if(params.data) {
        if(params.data.profileFilled) {
          this.showSpinner = true;
          this.newDID();
        }
      }
    });
    await modal.present()*/
  }

  /**
   * Continues the identity creation process where it was stopped.
   */
    async function resumeIdentitySetupFlow() {
    await new Promise<void>((resolve)=>{
      setTimeout(async ()=>{
        try {
          // Local DID creation
          if (!this.isLocalDIDcreated()) {
            this.progress = 0.01;
            await this.identityService.createLocalIdentity();
          }

          if (!this.isDIDOnChain() && !this.isDIDBeingPublished()) {
            this.progress = 0.01;
            let interval = setInterval(() => {
              if(this.progress >= 0.90) {
                clearInterval(interval);
              } else {
                this.progress += 0.01;
                this.storage.set('progressDate', new Date());
                this.storage.set('progress', this.progress);
              }
            }, 10000);
            await this.identityService.publishIdentity();
          }

          if (!this.isDIDOnChain() && this.isDIDBeingPublished()) {
            const progressDate = await this.storage.get('progressDate');
            const progress = await this.storage.get('progress');
            let newProgress: number = null;

            // If progress was previously initiated before starting app
            if(progressDate && progress) {
              console.log('Last progress time', moment(progressDate).format('LT'));
              console.log('Left off at progress', progress);

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
              newProgress = additionalProgress + progress;
            }

            if(newProgress && newProgress <= 0.9) {
              this.progress = newProgress
            } else if(this.progress >= 0.9) {
              this.progress = 0.9;
            } else {
              this.progress = 0.01;
            }

            console.log('Progress', this.progress);
            let interval = setInterval(() => {
              if(this.progress >= 0.90) {
                clearInterval(interval);
              } else {
                this.progress += 0.01;
                this.storage.set('progressDate', new Date());
                this.storage.set('progress', this.progress);
              }
            }, 10000);
            await this.repeatinglyCheckAssistPublicationStatus();
          }

          if (!this.isHiveVaultReady()) {
            this.progress = 0.90;
            let interval = setInterval(() => {
              if(this.progress >= 0.99) {
                clearInterval(interval);
              } else {
                this.progress += 0.01;
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
          this.zone.run(()=>this.suggestRestartingFromScratch = true);
          resolve();
        }
      }, 1000);
    });
    }

  function wasTemporaryIdentityCreationStarted(): boolean {
    return this.isLocalDIDcreated();
  }

  function isLocalDIDcreated(): boolean {
    let persistenceInfo = this.persistence.getPersistentInfo();
    return persistenceInfo.did.didString != null;
  }

  function isDIDBeingPublished(): boolean {
    let persistenceInfo = this.persistence.getPersistentInfo();
    return persistenceInfo.did.publicationStatus == DIDPublicationStatus.AWAITING_PUBLICATION_CONFIRMATION;
  }

  function isDIDOnChain(): boolean {
    let persistenceInfo = this.persistence.getPersistentInfo();
    return persistenceInfo.did.publicationStatus == DIDPublicationStatus.PUBLISHED_AND_CONFIRMED;
  }

  function isHiveVaultReady(): boolean {
    let persistenceInfo = this.persistence.getPersistentInfo();
    return persistenceInfo.hive.creationStatus == HiveCreationStatus.VAULT_CREATED_AND_VERIFIED;
  }

  function isHiveBeingConfigured(): boolean {
    return this.hiveIsBeingConfigured;
  }

  function isEverythingReady(): boolean {
    return this.isHiveVaultReady();
  }

async function prepareHiveVault() {
    this.hiveIsBeingConfigured = true;
    try {
      await this.hiveService.prepareHiveVault();
    }
    catch (e) {
      throw e;
    } finally {
      this.hiveIsBeingConfigured = false;
    }
  }

  /**
   * Checks assist publication status in a loop until we know the transaction is successful or failing.
   */
async function repeatinglyCheckAssistPublicationStatus(): Promise<void> {
    let persistenceInfo: PersistentInfo = null;
    let firstAttempt = true;

    do {
      if (!firstAttempt) {
        console.log("Waiting a few seconds before checking again");
        await this.dappService.sleep(15000); // Wait 15s before trying again
      }

      await this.identityService.checkPublicationStatusAndUpdate();

      // Check the new status
      persistenceInfo = this.persistence.getPersistentInfo();

      firstAttempt = false;
    }
    while (persistenceInfo.did.publicationStatus == DIDPublicationStatus.AWAITING_PUBLICATION_CONFIRMATION);
  }

  /**
   * This identity setup screen is normally reached because an intent such as credaccess was received,
   * but no identity exists yet. After the identity is fully created, we can then continue to where we should have
   * been at first, if the identity existed.
   */
function continueToOriginalLocation() {
    // NOTE: For now, we always consider we are coming from a "credaccess" intent request. To be improved later.
    this.navCtrl.navigateRoot("credaccess");
  }

  /**
   * Clears all context and restarts identity creation from 0.
   */
async function restartProcessFromScratch() {
    this.suggestRestartingFromScratch = false;
    await this.identityService.resetOnGoingProcess();
    this.resumeIdentitySetupFlow();
  }

  function getProgress() {
    let percent = this.progress * 100;
    return percent.toFixed(0);
  }
</script>



<!--
    <ion-content class="ion-text-center">
    <ion-slides *ngIf="!wasTemporaryIdentityCreationStarted()" #slider pager="true" (ionSlideWillChange)="getActiveSlide()">
      <ion-slide>
        <img [src]="!theme.darkMode ? 'assets/icons/did.svg' : 'assets/icons/darkmode/did.svg'">
        <h1>{{ 'welcome' | translate }}</h1>
        <h2>{{ 'my-first-did' | translate }}</h2>
      </ion-slide>
      <ion-slide>
       <lottie-player src="assets/animations/fingerprint.json" background="transparent" speed="1" style="width: 150px; height: 150px;" autoplay loop></lottie-player>
        <p>{{ 'identitysetup.slide2-msg' | translate }}</p>
        <p>{{ 'identitysetup.slide2-msg2' | translate }}</p>
      </ion-slide>
      <ion-slide>
        <lottie-player src="assets/animations/device.json" background="transparent" speed="1" style="width: 300px; height: 300px;" autoplay loop></lottie-player>
        <p style="position: relative; top: -75px;">{{ 'identitysetup.slide3-msg' | translate }}</p>
      </ion-slide>
    </ion-slides>

    <ion-grid *ngIf="wasTemporaryIdentityCreationStarted()" [class.dark-process-container]="theme.darkMode">
      <ion-row class="steps-row">
        <ion-col size="12">
          <ion-label>
            <h1>{{ 'identitysetup.create-did' | translate }}</h1>
            <h2>{{ 'identitysetup.create-did-msg' | translate }}</h2>
          </ion-label>
          <ion-icon *ngIf="isLocalDIDcreated()" class="done" name="checkmark-circle-outline"></ion-icon>
          <ion-spinner *ngIf="!isLocalDIDcreated()"></ion-spinner>
        </ion-col>
      </ion-row>
      <ion-icon name="arrow-down-circle-outline"></ion-icon>
      <ion-row class="steps-row">
        <ion-col size="12">
          <ion-label>
            <h1>{{ 'identitysetup.publish-did' | translate }}</h1>
            <h2>{{ 'identitysetup.publish-did-msg' | translate }}</h2>
          </ion-label>
          <ion-icon *ngIf="isDIDOnChain()" class="done" name="checkmark-circle-outline"></ion-icon>
          <ion-icon *ngIf="!isDIDOnChain() && !isDIDBeingPublished()" class="pending" name="timer-outline"></ion-icon>
          <ion-spinner *ngIf="!isDIDOnChain() && isDIDBeingPublished()"></ion-spinner>
        </ion-col>
      </ion-row>
      <ion-icon name="arrow-down-circle-outline"></ion-icon>
      <ion-row class="steps-row">
        <ion-col size="12">
          <ion-label>
            <h1>{{ 'identitysetup.config-storage' | translate }}</h1>
            <h2>{{ 'identitysetup.config-storage-msg' | translate }}</h2>
          </ion-label>
          <ion-icon *ngIf="isHiveVaultReady()" class="done" name="checkmark-circle-outline"></ion-icon>
          <ion-icon *ngIf="!isHiveVaultReady() && !isHiveBeingConfigured()" class="pending" name="timer-outline"></ion-icon>
          <ion-spinner *ngIf="!isHiveVaultReady() && isHiveBeingConfigured()"></ion-spinner>
        </ion-col>
      </ion-row>

      <div *ngIf="!isEverythingReady()" class="progress-msg">
        <p>{{ 'identitysetup.progress-msg' | translate }}</p>
      </div>

      <div *ngIf="isEverythingReady()" class="done-msg">
        <lottie-player src="assets/animations/checkmark.json" background="transparent" speed="1" style="width: 150px; height: 150px;" autoplay loop></lottie-player>
        <p>{{ 'identitysetup.done-msg' | translate }}</p>
      </div>

    </ion-grid>
  </ion-content>

  <ion-footer class="ion-no-border">
    <div *ngIf="!wasTemporaryIdentityCreationStarted()">
      <ion-button *ngIf="!showSpinner && slideIndex < 2" (click)="slideNext()">
        {{ 'next' | translate }}
      </ion-button>
      <ion-button *ngIf="!showSpinner && slideIndex >= 2" (click)="editProfile()">
        {{ 'identitysetup.create-my-did' | translate }}
      </ion-button>
      <ion-button disabled *ngIf="showSpinner">
        <ion-spinner></ion-spinner>
      </ion-button>
    </div>
    <div *ngIf="suggestRestartingFromScratch">
      <p>{{ 'identitysetup.error-msg' | translate }}</p>
      <ion-button (click)="restartProcessFromScratch()">
        {{ 'identitysetup.restart' | translate }}
      </ion-button>
    </div>
    <div *ngIf="wasTemporaryIdentityCreationStarted() && !suggestRestartingFromScratch">
      <div *ngIf="!isEverythingReady()">
        <p><strong>{{ getProgress() }}</strong><span>% {{ 'identitysetup.takes-long-time' | translate }}</span></p>
        <ion-progress-bar mode="ios" type="determinate" [value]="progress"></ion-progress-bar>
      </div>
      <ion-button *ngIf="isEverythingReady()" (click)="continueToOriginalLocation()">
        {{ 'continue' | translate }}
      </ion-button>
    </div>
  </ion-footer>
-->
