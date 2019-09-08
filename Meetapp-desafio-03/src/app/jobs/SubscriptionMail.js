import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { emailInfo } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${emailInfo.provider} <${emailInfo.provider_email}`,
      subject: 'Nova inscrição em um Meetup',
      template: 'subscription',
      context: {
        provider: emailInfo.provider,
        user: emailInfo.user,
        email: emailInfo.email,
        meetup: emailInfo.meetup,
        date: format(
          parseISO(emailInfo.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
