import * as Yup from 'yup';
import Student from '../models/Student';
import Order from '../schemas/Order';

class StudentHelpOrderController {
  async index(req, res) {
    const student = await Student.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!student) {
      return res.json({ error: 'Student does not exists' });
    }

    const questions = await Order.find({
      student_id: student.id,
    });

    if (questions.length === 0) {
      return res.json({
        error: `Student ${student.name} has no questions registered`,
      });
    }

    return res.json(questions);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!student) {
      return res.json({ error: 'Student does not exists' });
    }

    const { question } = req.body;

    const newQuestion = await Order.create({
      student_id: student.id,
      question,
    });

    return res.json(newQuestion);
  }
}

export default new StudentHelpOrderController();
