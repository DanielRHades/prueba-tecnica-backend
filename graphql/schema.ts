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
    countries(cursorById: String, take: Int, skip: Int): [Country!]!
    roles(cursorById: String, take: Int, skip: Int): [Role!]!
    sessions(cursorById: String, take: Int, skip: Int): [Session!]!
    users(cursorById: String, take: Int, skip: Int): [User!]!
    userByEmail(email: String!): User!
    userById(id: String!): User!
    userMonitorings(cursorById: String, take: Int, skip: Int): [UserMonitoring!]!
    userMonitoringsByEmailAndDate(
      email: String!, startingDate: String!, endDate: String!, cursorById: String, take: Int, skip: Int): [UserMonitoring!]!
      
    topThreeUsersByMonitoring(startingDate: String!, endDate: String!): [User!]!
    topThreeUsersByMonitoringDescriptionAndCountry(
      description: String!, countryId: String!, startingDate: String!, endDate: String!): [User!]!
  }

  type Mutation {
    createUser (id: String, email: String, createdAt: String, updatedAt: String, roleId: String, ): User!
  }

`;
