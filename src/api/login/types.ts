export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  roles: string[];
  permissions: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expiresIn: number;
  user: UserProfile;
}
