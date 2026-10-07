import "reflect-metadata";
import http from "http";
import app from "./app";
import { AppDataSource } from "./config/data-source";
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

async function startServer() {
  try {
    AppDataSource.initialize();
    console.log("Base de datos conectada correctamente");

    server.listen(PORT, () => {
      console.log(`Servidor ejecutandose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`Error durante la inicialización del servidor.`, error);
    process.exit(1);
  }
}

startServer();
