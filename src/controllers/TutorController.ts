import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class TutorController {
  async create(req: Request, res: Response) {
    try {
      const { nome, email, telefone } = req.body;
      const tutorExiste = await prisma.tutor.findUnique({ where: { email } });
      if (tutorExiste) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }
      const novoTutor = await prisma.tutor.create({
        data: { nome, email, telefone }
      });
      return res.status(201).json(novoTutor);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao criar tutor.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const tutores = await prisma.tutor.findMany({
        include: { pets: true }
      });
      return res.json(tutores);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tutores.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, telefone } = req.body;
      const tutorAtualizado = await prisma.tutor.update({
        where: { id: Number(id) },
        data: { nome, email, telefone }
      });
      return res.json(tutorAtualizado);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao atualizar tutor ou ID não encontrado.' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.tutor.delete({
        where: { id: Number(id) }
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao deletar tutor ou ID não encontrado.' });
    }
  }
}
