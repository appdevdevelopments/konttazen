export const sendInvitationEmail = async ({ name, email, inviterName }: { name: string; email: string; inviterName: string; }): Promise<{ success: boolean }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would use an email service (e.g., SendGrid, Mailgun)
    // to send a transactional HTML email. This simulation reflects a well-structured email content.
    console.log(`
        ==================================================
        📧 SIMULANDO E-MAIL DE CONVITE APRIMORADO 📧
        ==================================================
        TO: ${email}
        FROM: no-reply@konttazen.com
        SUBJECT: ${inviterName} convidou você para a conta da família no KonttaZen!

        Olá ${name},

        Você recebeu um convite de **${inviterName}** para participar da conta da família no **KonttaZen**, nosso app de gestão financeira.

        Para começar, siga os passos abaixo:

        **Passo 1: Aceite o Convite**
        Clique no botão abaixo para aceitar o convite. Se você já tem o app, ele será aberto. Se não, você será direcionado para baixá-lo.

        [ ACEITAR CONVITE ]
        (Link: https://konttazen.app/accept-invite?token=mock_invitation_token_${Date.now()})

        **Passo 2: Crie sua Conta (se for novo)**
        Caso ainda não tenha uma conta no KonttaZen, o processo de cadastro é rápido. Use o mesmo e-mail deste convite (${email}) para garantir o acesso à conta da família.

        **Passo 3: Acesse a Área da Família**
        Após o login, a conta da família de ${inviterName} estará disponível para você, com as permissões que foram definidas.

        Se você não esperava este convite, pode ignorar este e-mail com segurança.

        Atenciosamente,
        Equipe KonttaZen
        ==================================================
    `);

    return Promise.resolve({ success: true });
};
