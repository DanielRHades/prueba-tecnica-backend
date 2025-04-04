import { userResolvers } from './users/users.resolvers';
import { countryResolvers } from './countries/countries.resolvers';
import { roleResolvers } from './roles/roles.resolvers';
import { sessionResolvers } from './sessions/sessions.resolvers';
import { userMonitoringResolvers } from './userMonitorings/userMonitorings.resolvers';

export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...countryResolvers.Query,
        ...roleResolvers.Query,
        ...sessionResolvers.Query,
        ...userMonitoringResolvers.Query,
    },
    User: userResolvers.User,
    Country: countryResolvers.Country,
    Role: roleResolvers.Role,
    Session: sessionResolvers.Session,
    UserMonitoring: userMonitoringResolvers.UserMonitoring

};