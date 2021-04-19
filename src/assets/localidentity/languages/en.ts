export const en = {

  /********** Global **********/
  'local-identity-name': 'Temporary Identity',
  'welcome': 'Welcome to',
  'my-first-did': 'My First Identity',
  'temp-did': 'temporary identity',

  /********** Prompts **********/
  'copied': 'Copied to clipboard!',

  /********** Buttons **********/
  'continue': 'Continue',
  'next': 'Next',

  /********** Screens **********/
  'deadend': {
    'titlebar-title': 'Forbidden',
    'oops': 'Ooops!',
    'intro': 'This application cannot be started manually. It must be started with specific intents only.',
    'debug-revoke': 'Debug: revoke hive auth',
    'debug-call': 'Debug: call vault API',
  },

  'identitysetup': {
    'titlebar-title': 'Identity Setup',
    'slide2-msg': 'This application uses decentralized identities (DIDs). With decentralized identities, you own your identity, your data.',
    'slide2-msg2': 'So it seems that you either don\'t know what this is yet, or you have never created your own identity? We are here to help, the following steps will automatically create and publish a brand new Elastos Identity and storage space for you.',
    'slide3-msg': 'In the future, if you want to better control or use this identity in other DID-powered applications, you may export it to a third party wallet application such as Elastos Essentials.',
    'create-did': 'Create Identity',
    'create-did-msg': 'Add a new identity to your device',
    'publish-did': 'Publish Identity',
    'publish-did-msg': 'Record identity to the public repository. This step takes between 10 and 15 minutes.',
    'config-storage': 'Configure Storage',
    'config-storage-msg': 'Setup a personal storage for your Identity\'s data.',
    'progress-msg': 'Please don\'t hesitate to leave at any time. You can return and resume your identity setup when you are ready.',
    'done-msg': 'All done, you now have a decentralized identity and storage space! When you better understand the advantages of DIDs later, you can export it and reuse it in other apps',
    'create-my-did': 'Create my Identity',
    'error-msg': 'Sorry, it seems like something unexpected happened. The problem has been reported to the team but in the meantime, would you like to restart the identity creation from the beginning?',
    'restart': 'Restart',
    'takes-long-time': '(this takes several minutes)',
  },

  'credaccess': {
    'titlebar-title': 'Profile Request',
    'profile-request': 'Profile Request',
    'intro': 'You are currently using a',
    'message': 'This application is requesting some of your profile information. As this is a temporary identity, default information is going to be returned for now. Later on, you can fully manage your identity using an app such as Elastos Essentials.',
  },

  'credaccessprompt': {
    'titlebar-title': 'Login',
    'login-msg': 'Select one of the following options',
    'temp-did': 'Temporary Identity',
    'please-choose': 'Please Choose',
    'your-did': 'Your Identity',
    'elastos-essentials': 'Elastos Essentials',
  },

  'exportidentity': {
    'titlebar-title': 'Export Identity',
    'did': 'Identity',
    'copy-did': 'Copy Identity',
    'copy-paperkey': 'Copy Paper Key',
    'paperkey': 'Paper Key',
    'show-paperkey': 'Show Paper Key',
    'hide-paperkey': 'Hide Paper Key',
    'paperkey-not-copied-msg': 'Safely store the words in your paper key in the right order. After that, you can copy and paste them in the import identity flow of your favorite identity apps (ex: Elastos Essentials).',
    'paperkey-copied-msg': 'Your paper key has been copied to your clipboard. Please save them safely. You can now open your third party identity app and import your identity using these words.'
  },

  'manageidentity': {
    'titlebar-title': 'Manage Identity',
    'did-management': 'Identity Management',
    'intro': 'You are currently using a',
    'intro2': 'bound only to this application. Besides, this identity has currently not been saved and cannot be recovered if you reinstall the application, nor can it be shared with other applications.',
    'intro3': 'We recommend you to export your temporary identity to an external identity app such as Elastos Essentials (it has to be installed on your device first).',
    'export-did': 'Export Identity',
    'edit-profile': 'Edit Profile',
  },

  'edit-profile': {
    'message': 'Providing your information is optional. You can skip this step and continue.',
    'enter-name': 'Enter Name',
    'enter-email': 'Enter Email'
  },

}
