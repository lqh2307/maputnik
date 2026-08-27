/** Defines get profile option. */
export type GetProfileOption = {
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Defines get user option. */
export type GetUserOption = {
  /** User identifier. */
  id: string;
  /** Controller used to cancel the request. */
  controller?: AbortController;
  /** Maximum request duration in milliseconds. */
  timeout?: number;
};

/** Describes user profile returned from security service. */
export interface UserProfile {
  /** Unique identifier of the user. */
  id?: string;
  /** Alternative user ID field. */
  userId?: string;
  /** Username for authentication. */
  username?: string;
  /** Full name of the user. */
  fullName?: string;
  /** Rank in military or organizational structure. */
  rank?: string;
  /** Position or title. */
  position?: string;
  /** Unit or organization identifier. */
  unitId?: string;
  /** Unit or organization display name. */
  unitName?: string;
  /** Contact email. */
  email?: string;
  /** Contact phone number. */
  phone?: string;
  /** Avatar background color. */
  avatarColor?: string;
  /** Avatar image URL. */
  avatar?: string;
  /** User authorities or permissions. */
  authorities?: string;
  /** User special privileges. */
  specialPrivileges?: string;
  /** Additional flexible fields. */
  [key: string]: unknown;
}

/** Describes detailed user information returned from security service. */
export interface UserDetail {
  /** Unique identifier of the user. */
  id?: string;
  /** Alternative user ID field. */
  userId?: string;
  /** Username for authentication. */
  username?: string;
  /** Full name of the user. */
  fullName?: string;
  /** Alternative name field. */
  name?: string;
  /** Rank in military or organizational structure. */
  rank?: string;
  /** Position or title. */
  position?: string;
  /** Unit or organization identifier. */
  unitId?: string;
  /** Unit or organization display name. */
  unitName?: string;
  /** Contact email. */
  email?: string;
  /** Contact phone number. */
  phone?: string;
  /** Avatar background color. */
  avatarColor?: string;
  /** Avatar image URL. */
  avatar?: string;
  /** Account status. */
  status?: string | number;
  /** Description or notes. */
  description?: string;
  /** Creation timestamp. */
  createdAt?: string | number;
  /** Last update timestamp. */
  updatedAt?: string | number;
  /** Additional flexible fields. */
  [key: string]: unknown;
}
