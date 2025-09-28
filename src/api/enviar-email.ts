// src/api/enviar-email.ts
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { supabase } from "./supabaseClient";

export const enviarEmail = async (req: Request, res: Response) => {
  try {
    const { denunciaId, secretariaEmail } = req.body;

    if (!denunciaId || !secretariaEmail) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const { data: denuncia, error } = await supabase
      .from("denuncias_expandida")
      .select("*")
      .eq("id", denunciaId)
      .single();

    if (error || !denuncia) {
      return res.status(404).json({ error: "Denúncia não encontrada" });
    }

    // Cria PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    page.drawText(`Denúncia ID: ${denuncia.id}`, { x: 50, y: height - 50, size: 14, font });
    page.drawText(`Título: ${denuncia.titulo}`, { x: 50, y: height - 70, size: 12, font });
    page.drawText(`Categoria: ${denuncia.categoria}`, { x: 50, y: height - 90, size: 12, font });
    page.drawText(`Descrição: ${denuncia.descricao}`, { x: 50, y: height - 110, size: 12, font });
    page.drawText(`Endereço: ${denuncia.endereco}`, { x: 50, y: height - 130, size: 12, font });
    page.drawText(`Autor: ${denuncia.autor_nome} (${denuncia.autor_email})`, { x: 50, y: height - 150, size: 12, font });

    const pdfBytes = await pdfDoc.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: secretariaEmail,
      subject: `Nova denúncia #${denunciaId}`,
      text: `Você recebeu uma nova denúncia com ID: ${denunciaId}`,
      attachments: [
        { filename: `denuncia_${denunciaId}.pdf`, content: Buffer.from(pdfBytes) },
      ],
    });

    // Log de sucesso
    await supabase.from("emails_enviados").insert([
      { denuncia_id: denunciaId, status: "sucesso" },
    ]);

    res.status(200).json({ message: "E-mail enviado com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);

    if (req.body.denunciaId) {
      await supabase.from("emails_enviados").insert([
        { denuncia_id: req.body.denunciaId, status: "falha" },
      ]);
    }

    res.status(500).json({ error: "Falha ao enviar e-mail" });
  }
};
