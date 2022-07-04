import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/user/entities/user.entity';

export const databaseTestConnectionModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5434,
  username: 'postgres',
  password: 'root',
  database: 'postgres',
  schema: 'libraryTest',
  entities: [User],
  synchronize: true,
})