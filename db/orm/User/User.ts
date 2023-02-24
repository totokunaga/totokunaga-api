import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OAuthProvider } from "../../../utils/types";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  oauthProvider: OAuthProvider;

  @Column()
  oauthUserId: string;

  @Column()
  avatorImagePath: string;
}

export const initUser = (data: {
  name: string;
  oauthProvider?: OAuthProvider;
  oauthUserId?: string;
  avatorImagePath?: string;
}) => {
  const user = new User();
  user.name = data.name;
  user.oauthUserId = data.oauthUserId || "";
  user.avatorImagePath = data.avatorImagePath || "";
  if (data.oauthProvider) {
    user.oauthProvider = data.oauthProvider;
  }

  return user;
};
