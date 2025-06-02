import { FichaMedica } from "./ficha-medica";

export interface Mascota {
  mid: string;
  nombre: string;
  tipo: string;
  raza: string;
  fechaNacimiento: string;
  edad: string;
  peso: string;
  imagen: string;
  usuarioUid: string;
}
