import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class OrderMail {
  get key() {
    return 'OrderMail';
  }

  async handle({ data }) {
    const { order, student } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Sua pergunta foi respondida',
      template: 'order',
      context: {
        student: student.name,
        question: order.question,
        questionDate: format(
          parseISO(order.createdAt),
          "dd 'de' MMMM' de 'yyyy', às 'HH:mm:ss'",
          {
            locale: pt,
          }
        ),
        answer: order.answer,
        answerDate: format(
          parseISO(order.answer_at),
          "dd 'de' MMMM' de 'yyyy', às 'HH:mm:ss'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new OrderMail();
