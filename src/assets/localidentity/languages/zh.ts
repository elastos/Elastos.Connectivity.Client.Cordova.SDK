export const zh = {

  /********** Global **********/
  'local-identity-name': 'Temporary Identity',
  'welcome': '欢迎来到',
  'my-first-did': '我的第一个身份',
  'temp-did': '临时身份',

  /********** Prompts **********/
  'copied': '已复制到剪贴板！',

  /********** Buttons **********/
  'continue': '继续',
  'next': '下一个',

  /********** Screens **********/
  'deadend': {
    'titlebar-title': '禁止',
    'oops': '哎呀！',
    'intro': '无法手动启动此应用程序， 它只能以特定的意图开始。',
    'debug-revoke': '调试：撤销 Hive 身份验证',
    'debug-call': '调试：调用 vault API',
  },

  'identitysetup': {
    'titlebar-title': '身份设置',
    'slide2-msg': '此应用程序使用去中心身份（DID）。 使用去中心身份，您拥有自己的身份和数据。',
    'slide2-msg2': '因此，您似乎还不知道这是什么，或者您从未创建自己的身份？ 我们在这里为您提供帮助，以下步骤将自动为您创建和发布全新的Elastos身份和存储空间。',
    'slide3-msg': '将来，如果您想更好地控制或在其他支持DID的应用程序中使用此身份，可以将其导出到第三方钱包应用程序，例如Elastos Essentials。',
    'create-did': '创建身份',
    'create-did-msg': '向您的设备添加新身份',
    'publish-did': '发布身份',
    'publish-did-msg': '将身份记录到公开仓库上。 此过程将花费几分钟。',
    'config-storage': '配置存储空间',
    'config-storage-msg': '为您的身份数据设置个人存储。',
    'progress-msg': '请勿犹豫，可随时离开。准备好后，可以返回并恢复身份设置。',
    'done-msg': '完成所有操作后，您现在拥有了去中心身份和存储空间！当您以后更好地了解DID的优势时，可以将其导出并在其他应用中重用',
    'create-my-did': '创建我的身份',
    'error-msg': '抱歉，似乎发生了意外情况。 该问题已报告给团队，但与此同时，您是否想从头开始重新创建身份？',
    'restart': '重新开始',
    'takes-long-time': '（这需要几分钟）',
  },

  'credaccess': {
    'titlebar-title': '个人资料请求',
    'profile-request': '个人资料请求',
    'intro': '您目前正在使用',
    'message': '该应用程序正在请求您的一些个人资料信息。 由于这是一个临时身份，因此暂时将返回默认信息。 稍后，您可以使用Elastos Essentials等应用程序来完全管理您的身份。',
  },

  'credaccessprompt': {
    'titlebar-title': '登录',
    'login-msg': '从下列选项中选择一个',
    'temp-did': '临时身份',
    'please-choose': '请选择',
    'your-did': '您的身份',
    'elastos-essentials': 'Elastos Essentials',
  },

  'exportidentity': {
    'titlebar-title': '导入身份',
    'did': '身份',
    'copy-did': '复制身份',
    'copy-paperkey': 'Copy Paper Key',
    'paperkey': 'Paper Key',
    'show-paperkey': 'Show Paper Key',
    'hide-paperkey': 'Hide Paper Key',
    'paperkey-not-copied-msg': 'Safely store the words in your paper key in the right order. After that, you can copy and paste them in the import identity flow of your favorite identity apps (ex: Elastos Essentials).',
    'paperkey-copied-msg': 'Your paper key has been copied to your clipboard. Please save them safely. You can now open your third party identity app and import your identity using these words.'
  },

  'manageidentity': {
    'titlebar-title': '管理身份',
    'did-management': '身份管理',
    'intro': '您目前正在使用',
    'intro2': '仅绑定到此应用程序。 此外，该身份当前尚未保存，如果您重新安装该应用程序，则该身份无法恢复，也无法与其他应用程序共享。',
    'intro3': '我们建议您将临时身份导出到外部身份钱包，例如Elastos Essentials（必须先将其安装在设备上）。',
    'export-did': '导出身份',
    'edit-profile': '编辑档案',
  },

  'edit-profile': {
    'message': '提供您的信息是可选的。 您可以跳过此步骤并继续。',
    'enter-name': '输入名称',
    'enter-email': '输入邮箱'
  },

};
