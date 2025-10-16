import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configuração das contas Zoho
const contasZoho = {
  presidencia: { user: process.env.ZOHO_PRESIDENCIA, pass: process.env.ZOHO_PASS_PRESIDENCIA },
  secretaria: { user: process.env.ZOHO_SECRETARIA, pass: process.env.ZOHO_PASS_SECRETARIA },
  financeiro: { user: process.env.ZOHO_FINANCEIRO, pass: process.env.ZOHO_PASS_FINANCEIRO },
  comunicacao: { user: process.env.ZOHO_COMUNICACAO, pass: process.env.ZOHO_PASS_COMUNICACAO },
  contato: { user: process.env.ZOHO_CONTATO, pass: process.env.ZOHO_PASS_CONTATO },
};

// Cria transporter para a conta escolhida
const criarTransporter = (usuario: keyof typeof contasZoho) => {
  const conta = contasZoho[usuario];
  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: conta.user,
      pass: conta.pass,
    },
  });
};

// Rota de envio de e-mail
router.post('/enviar', async (req, res) => {
  const { remetente, to, subject, body } = req.body;

  if (!remetente || !contasZoho[remetente as keyof typeof contasZoho]) {
    return res.status(400).json({ error: 'Remetente inválido' });
  }
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  try {
    const transporter = criarTransporter(remetente as keyof typeof contasZoho);

    await transporter.sendMail({
      from: contasZoho[remetente as keyof typeof contasZoho].user,
      to,
      subject,
      text: body,
    });

    res.json({ message: 'E-mail enviado com sucesso!' });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    res.status(500).json({ error: 'Falha ao enviar e-mail' });
  }
});

export default router;
