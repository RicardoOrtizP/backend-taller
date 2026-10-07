import { EntityManager } from "typeorm";
import { SecuenciaFolio } from "../entities/SecuenciaFolio.entity";

export class FolioGenerator {
  static async generarFolio(
    transactionalEntityManager: EntityManager,
    prefijo: string = "PED",
  ): Promise<string> {
    const anioActual = new Date().getFullYear();
    const claveSecuencia = `${prefijo}_${anioActual}`;

    // Buscar la secuencia actual con bloqueo pesimista de escritura
    // Esto hace que otras peticiones simultaneas esperen hasta que esta transacción termine
    let secuencia = await transactionalEntityManager
      .getRepository(SecuenciaFolio)
      .createQueryBuilder("secuencia")
      .setLock("pessimistic_write")
      .where("secuencia.clave = :clave", { clave: claveSecuencia })
      .getOne();

    // 2. Si es el primer folio del año/serie, inicializamos el registro
    if (!secuencia) {
      secuencia = transactionalEntityManager.create(SecuenciaFolio, {
        clave: claveSecuencia,
        ultimo_valor: 0,
      });
    }

    // 3. Incrementar el contador consecutivo
    secuencia!.ultimo_valor += 1;
    await transactionalEntityManager.save(secuencia);

    // 4. Formatear el consecutivo a 6 digitos con ceros a la izquierda (0000001, 0000002, ...)
    const numeroFormateado = String(secuencia!.ultimo_valor).padStart(6, "0");
    return `${prefijo}-${anioActual}-${numeroFormateado}`;
  }
}
