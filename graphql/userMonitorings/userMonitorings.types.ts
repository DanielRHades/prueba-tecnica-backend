export interface UserMonitoringArguments {
    email?: string;
    startingDate: string;
    endDate: string;
    cursorById?: string;
    take?: number; 
    skip?: number; 
}