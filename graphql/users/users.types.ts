export interface UserArguments {
    email?: string;
    id?: string;    
    cursorById?: string;
    take?: number; 
    skip?: number; 
}

export interface TopMonitoringArguments {
    startingDate: string;
    endDate: string;
}

export interface TopMonitoringDescriptionAndCountryArguments {
    description: string,
    countryId: string,
    startingDate: string;
    endDate: string;
}