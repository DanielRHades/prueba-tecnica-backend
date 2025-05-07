import { userResolvers } from '@/graphql/users/users.resolvers';
import { countryResolvers } from '@/graphql/countries/countries.resolvers';
import { roleResolvers } from '@/graphql/roles/roles.resolvers';
import { sessionResolvers } from '@/graphql/sessions/sessions.resolvers';
import { userMonitoringResolvers } from '@/graphql/userMonitorings/userMonitorings.resolvers';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...countryResolvers.Query,
    ...roleResolvers.Query,
    ...sessionResolvers.Query,
    ...userMonitoringResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation
  },
  User: userResolvers.User,
  Country: countryResolvers.Country,
  Role: roleResolvers.Role,
  Session: sessionResolvers.Session,
  UserMonitoring: userMonitoringResolvers.UserMonitoring
};
