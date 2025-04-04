export const typeDefs = `#graphql
  scalar DateTime

  enum Enum_RoleName {
    Admin
    Manager
    User
  }

  type Country {
    id: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    users: [User!]!
  }

  type Role {
    id: String!
    name: Enum_RoleName!
    createdAt: DateTime!
    users: [User!]!
  }

  type Session {
    id: String!
    sessionToken: String!
    userId: String!
    expiresAt: DateTime!
    createdAt: DateTime!
    user: User!
  }

  type User {
    id: String!
    email: String!
    emailVerified: DateTime
    termsAndConditionsAccepted: DateTime
    name: String
    image: String
    position: String
    createdAt: DateTime!
    updatedAt: DateTime!
    roleId: String
    role: Role
    sessions: [Session!]!
    countries: [Country!]!
    userMonitorings: [UserMonitoring!]!
  }

  type UserMonitoring {
    id: String!
    usage: Int!
    description: String!
    userId: String!
    createdAt: DateTime!
    user: User!
  }

  type Query {
    countries: [Country!]!
    roles: [Role!]!
    sessions: [Session!]!
    users: [User!]!
    userByEmail(email: String!): User!
    userById(id: String!): User!
    userMonitorings: [UserMonitoring!]!
    userMonitoringsByEmailAndDate(email: String!, startingDate: String!, endDate: String!): [UserMonitoring!]!
    topThreeUsersByMonitoring(startingDate: String!, endDate: String!): [User!]!
    topThreeUsersByMonitoringDescriptionAndCountry(
      description: String!, countryId: String!, startingDate: String!, endDate: String!): [User!]!
  }

`;
