import * as Yup from 'yup';
import { parseISO, isBefore, addMonths } from 'date-fns';
import Student from '../models/Student';
import GymPlan from '../models/GymPlan';
import Enrollment from '../models/Enrollment';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check if student and plan exists
     */

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(401).json({ error: 'User does not exists.' });
    }

    const plan = await GymPlan.findOne({
      where: { id: plan_id },
    });

    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists.' });
    }

    /**
     * Check for past dates
     */

    if (isBefore(parseISO(start_date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot start an enrollment with a past date' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);

    const price = (plan.duration * plan.price) / 100;

    // Adicionar procura de enrollment caso o Aluno ja tenha um registro na academia

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
