import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para enviar e-mail
app.post("/enviar-email", async (req, res) => {
  const { denunciaId, secretaria } = req.body;

  if (!denunciaId || !secretaria) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "destinatario@teste.com", // substitua pelo destinatário real
      subject: `Denúncia #${denunciaId} enviada para ${secretaria}`,
      text: `A denúncia ${denunciaId} foi encaminhada para a secretaria ${secretaria}.`
    };

    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado:", mailOptions);

    res.json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    res.status(500).json({ error: "Falha ao enviar e-mail" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
