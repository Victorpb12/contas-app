import { contasService } from "../services/contasService";
import { Conta } from "../types";

export const storageService = {
  async getContas(): Promise<Conta[]> {
    return await contasService.getContas();
  },

  async addConta(conta: Conta): Promise<void> {
    await contasService.addConta(conta);
  },

  async updateConta(contaAtualizada: Conta): Promise<void> {
    await contasService.updateConta(contaAtualizada);
  },

  async deleteConta(id: string): Promise<void> {
    await contasService.deleteConta(id);
  },
};
