import { differenceInDays } from 'date-fns';
import Student from '../models/Student';
import Checkin from '../schemas/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const student = await Student.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Check if student exists.

    if (!student) {
      return res.json({ error: 'Student does not exists.' });
    }

    // Check if student has an active plan

    if (Enrollment.is_active) {
      return res.json({ error: 'Student is not enrolled in any plan.' });
    }

    const findCheckin = await Checkin.find({
      student_id: student.id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    const checkin = findCheckin.map(check_in => {
      return { student: check_in.student_id, checkin_date: check_in.createdAt };
    });

    return res.json(checkin);
  }

  async store(req, res) {
    const student = await Student.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Check if student exists.

    if (!student) {
      return res.json({ error: 'Student does not exists.' });
    }

    // Check if student has an active plan

    if (Enrollment.is_active) {
      return res.json({ error: 'Student is not enrolled in any plan.' });
    }

    const checkins = await Checkin.find({
      student_id: student.id,
    })
      .sort({ createdAt: 'desc' })
      .limit(5);

    /**  Verifica se a quantidade de checkins de determinado aluno é maior do que 5
     * e se a diferença da data do quinto checkin e da data atual é menor do que 7 */

    if (
      checkins.length >= 5 &&
      differenceInDays(new Date(), checkins[4].createdAt) < 7
    ) {
      return res.json({
        checkins,
        error:
          'You have reached the maximum allowed checkins for the past 7 days',
      });
    }

    const checkin = await Checkin.create({
      student_id: student.id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
