import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class PetController {
  async createPet(req: Request, res: Response) {
    try {
      const { nome, especie, raca, tutorId } = req.body;
      const pet = await prisma.pet.create({
        data: { nome, especie, raca, tutorId: Number(tutorId) }
      });
      return res.status(201).json(pet);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao cadastrar pet. Verifique se o tutorId existe.' });
    }
  }

  async createAgendamento(req: Request, res: Response) {
    try {
      const { dataHora, servico, petId } = req.body;
      const conflito = await prisma.agendamento.findFirst({
        where: {
          petId: Number(petId),
          dataHora: new Date(dataHora),
          status: 'Agendado'
        }
      });
      if (conflito) {
        return res.status(400).json({ error: 'Este pet já possui um agendamento neste horário.' });
      }
      const agendamento = await prisma.agendamento.create({
        data: {
          dataHora: new Date(dataHora),
          servico,
          petId: Number(petId)
        }
      });
      return res.status(201).json(agendamento);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao realizar agendamento.' });
    }
  }

  async getHistorico(req: Request, res: Response) {
    try {
      const { petId } = req.params;
      const historico = await prisma.agendamento.findMany({
        where: { petId: Number(petId) },
        orderBy: { dataHora: 'desc' }
      });
      return res.json(historico);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao buscar histórico do pet.' });
    }
  }
}
