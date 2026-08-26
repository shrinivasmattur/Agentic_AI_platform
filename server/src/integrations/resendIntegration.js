const { Resend } = require('resend');

class ResendIntegration {
  constructor() {
    this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }

  getResendClient() {
    if (!this.resend && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resend;
  }

  async sendEmail({ to, subject, html, text }) {
    const client = this.getResendClient();

    if (!client) {
      console.log(`ℹ️ [Resend Email Simulation] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true, id: `sim_${Date.now()}` };
    }

    try {
      const data = await client.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Agentflow AI <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || `<p>${text}</p>`,
      });
      return { success: true, data };
    } catch (error) {
      console.error('❌ Resend Email Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ResendIntegration();
