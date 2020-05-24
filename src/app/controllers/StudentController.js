import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { student } = req.query;

    // Foi passado valor de student no query

    if (student) {
      const foundStudents = await Student.findAll({
        where: { name: { [Op.iLike]: `${student}%` } },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      if (foundStudents.length === 0) {
        res.json({
          status: `There are no users that starts with the name ${student}`,
        });
      }

      return res.json(foundStudents);
    }

    // Nao foi passado valor de student no query, retorna todos students

    const students = await Student.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    if (students.length === 0) {
      return res.json({ status: 'There are no users registered' });
    }

    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .required()
        .moreThan(16, 'Idade minima: 16 anos'), // idade minima para fazer academia!
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    schema.validate(req.body).catch(err => {
      return res.status(400).json({ error: ` ${err.errors}` });
    });

    schema.validate(req.body).then(async newStudent => {
      const studentExists = await Student.findOne({
        where: { email: newStudent.email },
      });

      if (studentExists) {
        return res.status(200).json({ error: 'Student already exists.' });
      }

      const { id } = await Student.create(newStudent);

      return res.json({
        message: `Student ${newStudent.name} created succesfully`,
        newStudent: {
          ...newStudent,
          id,
        },
      });
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      age: Yup.number()
        .integer()
        .moreThan(16), // idade minima para fazer academia!
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    schema.validate(req.body).catch(err => {
      return res.status(400).json({ msg: `Error : ${err.errors}` });
    });

    const student = await Student.findByPk(req.params.id);

    // const { name, email } = student;

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    // const { age, weight, height } = await student.update(req.body);
    try {
      const updatedStudent = await student.update(req.body);
      return res.json(updatedStudent);
    } catch (err) {
      return res.json({ error: 'Error updating user.', err });
    }
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    try {
      await student.destroy();
      return res
        .status(200)
        .json({ status: `Student "${student.name}" deleted` });
    } catch (err) {
      return res.status(200).json({ error: 'Error deleting user.', err });
    }
  }
}

export default new StudentController();
