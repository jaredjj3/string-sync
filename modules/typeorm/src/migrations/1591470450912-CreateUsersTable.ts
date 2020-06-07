import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1591470450912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
CREATE TYPE roles AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmation_token TEXT UNIQUE,
    confirmed_at TIMESTAMP,
    reset_password_token TEXT UNIQUE,
    reset_password_token_sent_at TIMESTAMP,
    avatar_url TEXT,
    role roles DEFAULT 'student'
);

CREATE TRIGGER trigger_generate_id BEFORE INSERT ON users FOR EACH ROW EXECUTE PROCEDURE unique_short_id();
CREATE INDEX index_users_on_confirmation_token ON users(confirmation_token);
CREATE INDEX index_users_on_reset_password_token ON users(reset_password_token);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
DROP TABLE users;
DROP TYPE roles;

DROP TRIGGER trigger_generate_id ON users;
DROP INDEX index_users_on_confirmation_token;
DROP INDEX index_users_on_reset_password_token;
    `);
  }
}