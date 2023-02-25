export type RemoteHost = {
  host: string;
  port: number;
};

export type DatabaseConfig = RemoteHost & {
  username: string;
  password: string;
  database: string;
};
