import * as Yup from 'yup';
import { parseISO, isBefore, addMonths } from 'date-fns';
import Student from '../models/Student';
import GymPlan from '../models/GymPlan';
import Enrollment from '../models/Enrollment';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'price', 'start_date', 'end_date', 'is_active'],
      include: [
        {
          model: Student,
          attributes: ['name', 'email', 'age'],
        },
        {
          model: GymPlan,
          attributes: ['title', 'duration', 'price', 'total_price'],
        },
      ],
    });

    return res.json(enrollments);
  }

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

    /**
     * Student found! Check if has an ongoing plan
     */

    const enrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (enrollment && enrollment.is_active) {
      return res
        .status(400)
        .json({ error: 'This student has an active plan.' });
    }

    const price = plan.duration * plan.price;

    // Adicionar procura de enrollment caso o Aluno ja tenha um registro na academia

    const newEnrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(newEnrollment);
  }

  async update(req, res) {
    /**
     *
      The only thing that can be updated is the plan (plan_id)
      User has to pass the enrollment to update and the new plan id.
     */

    const schema = Yup.object().shape({
      plan_id: Yup.number()
        .integer()
        .required(),
    });

    schema.validate(req.body).catch(err => {
      return res.status(400).json({ msg: `Error : ${err.errors}` });
    });

    const enrollment = await Enrollment.findOne({
      where: { id: req.params.id },
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    const { plan_id } = req.body;

    const gymPlan = await GymPlan.findOne({
      where: { id: plan_id },
    });

    if (!gymPlan) {
      return res.status(401).json({ error: 'Plan does not exists.' });
    }

    /**
     * Check if student has active plan so it is possible to add duration to the end of active plan
     */

    const { end_date, price } = enrollment;

    const { duration } = gymPlan;

    const newEndDate = addMonths(end_date, duration);

    const newPrice = price + gymPlan.total_price;

    try {
      const updatedEnrollment = await enrollment.update({
        plan_id,
        end_date: newEndDate,
        price: newPrice,
      });
      return res.json(updatedEnrollment);
    } catch (err) {
      return res.json({ error: 'Error updating enrollment.', err });
    }
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(200).json({ error: 'Enrollment does not exists.' });
    }

    try {
      await enrollment.destroy();
      return res.json({
        status: `Enrollment ${enrollment.id} deleted`,
        id: enrollment.id,
        student: enrollment.student_id,
      });
    } catch (err) {
      return res.json({ error: 'Error deleting enrollment.', err });
    }
  }
}

export default new EnrollmentController();
