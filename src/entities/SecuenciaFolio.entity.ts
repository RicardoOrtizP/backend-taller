import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("secuencias_folios")
export class SecuenciaFolio {
  @PrimaryColumn({ type: "varchar", length: 50 })
  clave!: string; // Ejemplo PED-2026

  @Column({ type: "int", default: 0 })
  ultimo_valor!: number;
}
