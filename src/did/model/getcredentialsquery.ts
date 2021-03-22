
export type UICustomization = {
    primaryColorLightMode: string,
    primaryColorDarkMode: string
}

export type GetCredentialsQuery = {
    claims: any,
    sub?: string,
    didMustBePublished?: boolean,
    customization?: UICustomization
}