import * as Yup from 'yup';
import Order from '../schemas/Order';

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

    const question = await Order.findByIdAndUpdate(
      req.params.id,
      {
        answer,
        answer_at: new Date(),
      },
      { new: true }
    );

    return res.json(question);
  }
}

export default new GymHelpOrderController();
