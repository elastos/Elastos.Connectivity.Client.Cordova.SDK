export type EditProfileNavParams = {
    useExistingProfileInfo: boolean; // Whether to fetch a previously saved profile info from local storage or not when entering the page.
    onCompletion: (profileFilled: boolean)=>void; // Callback called when profile editing is completed.
}

export type IdentitySetupNavParams = {
    onIdentityCreationCompleted: ()=>void; // Callback called when identity creaiton is fully completed
}