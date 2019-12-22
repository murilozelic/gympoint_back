import * as Yup from 'yup';
import Order from '../schemas/Order';
import Queue from '../../lib/Queue';
import OrderMail from '../jobs/OrderMail';
import Student from '../models/Student';

class GymHelpOrderController {
  async index(req, res) {
    const helpOrders = await Order.find({
      answer: null,
    })
      .sort({ createdAt: 'desc' })
      .select(['question', 'answer', 'id', 'answer_at', 'student_id']);

    if (helpOrders.length === 0) {
      return res.json({
        error: `There are no unanswered questions.`,
      });
    }

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { answer } = req.body;

    // Adicionar verificacao se a pergunta ja foi respondida

    const order = await Order.findById(req.params.id);

    if (order.answer) {
      return res.json({ error: 'This question was already answered.' });
    }

    order.answer = answer;
    order.answer_at = new Date();

    await order.save();

    const student = await Student.findByPk(order.student_id);

    await Queue.add(OrderMail.key, {
      order,
      student,
    });

    return res.json(order);
  }
}

export default new GymHelpOrderController();
