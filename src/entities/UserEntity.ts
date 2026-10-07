import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "../constants/enum";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "text", select: false })
  password_hash!: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  refresh_token!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  reset_password_token!: string | null;

  @Column({ type: "timestamp", nullable: true })
  reset_password_expires!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at!: Date | null; // marca la fecha de borrado lógico

  // @Column({ type: "uuid" })
  // rol_id!: string;

  // // Relación: Muchos usuarios pertenecen a un rol
  // @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: "RESTRICT" })
  // @JoinColumn({ name: "rol_id" }) // Especifica explicitamente la columna FK
  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USUARIO, // Rol por defecto de un usuario
  })
  role!: UserRole;
}
