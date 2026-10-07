import type { Repository } from "typeorm";
import { UserEntity } from "../entities/UserEntity";
import { AppDataSource } from "../config/data-source";
import type { FilterUserDto } from "../dtos/user/filterUser.dto";
import type { UpdateUserPutDto } from "../dtos/user/updateUserPut.dto";
import type { UpdateUserPatchDto } from "../dtos/user/updateUserPatch.dto";

export class UserService {
  private userRepository: Repository<UserEntity> =
    AppDataSource.getRepository(UserEntity);

  // obtener todos los usuarioes
  async getAll(query: FilterUserDto) {
    console.log("query", query);
    const { page, limit, name, email, is_active, role, sortBy, sortOrder } =
      query;
    const offset = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (name) {
      queryBuilder.andWhere("user.name ILIKE :name", { name: `%${name}%` });
    }
    if (email) {
      queryBuilder.andWhere("user.email ILIKE :email", { email: `%${email}%` });
    }
    if (is_active !== undefined) {
      queryBuilder.andWhere("user.is_active = :is_active", { is_active });
    }
    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    // Validar campo de ordenamiento seguro
    const camposPermitidos = ["name", "email", "created_at", "role"];
    const ordenCampo = camposPermitidos.includes(sortBy)
      ? `user.${sortBy}`
      : "user.created_at";
    const direccion = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    queryBuilder.orderBy(ordenCampo, direccion).skip(offset).take(limit);

    const [data, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async getById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }
    return user;
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.getById(id);

    await this.userRepository.update(id, { is_active: false });
    // TypeOrm asigna la fecha actual a deleted_at sin eliminar fisicamente
    await this.userRepository.softDelete(user.id);
  }

  async updatePut(id: string, dto: UpdateUserPutDto): Promise<UserEntity> {
    const user = await this.getById(id);
    // Validar duplicidad de email si cambio
    if (dto.email !== user.email) {
      const emailExists = await this.userRepository.findOneBy({
        email: dto.email,
      });
      if (emailExists) {
        throw new Error(
          "El correo electronico ya está en uso por otro usuario",
        );
      }
    }

    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;

    return await this.userRepository.save(user);
  }

  async updatedPatch(id: string, dto: UpdateUserPatchDto): Promise<UserEntity> {
    const user = await this.getById(id);

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.findOneBy({
        email: dto.email,
      });
      if (emailExists) {
        throw new Error(
          "El correo electronico ya está en uso por otro usuario.",
        );
      }
    }
    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }
}
