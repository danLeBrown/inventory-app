export const userStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type UserStatus = (typeof userStatus)[keyof typeof userStatus];
