import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { enrollment } = data;

    await Mail.sendMail({
      to: `${enrollment.Student.name} <${enrollment.Student.email}>`,
      subject: 'Novo Plano GymPoint',
      template: 'enrollment',
      context: {
        student: enrollment.Student.name,
        gymPlan: enrollment.GymPlan.title,
        price: `R$ ${Number(enrollment.price / 100)
          .toFixed(2)
          .toLocaleString(pt)}`,
        date: format(parseISO(enrollment.end_date), "dd 'de' MMMM' de 'yyyy'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new EnrollmentMail();
