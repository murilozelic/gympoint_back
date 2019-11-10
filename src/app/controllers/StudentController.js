import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .required()
        .moreThan(16), // idade minima para fazer academia!
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    schema.validate(req.body).catch(err => {
      return res.status(400).json({ msg: `Error : ${err.errors}` });
    });

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { name } = await Student.create(req.body);

    return res.json({ message: `Student ${name} created succesfully` });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .moreThan(16), // idade minima para fazer academia!
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    schema.validate(req.body).catch(err => {
      return res.status(400).json({ msg: `Error : ${err.errors}` });
    });

    const student = await Student.findOne({
      where: { email: req.body.email },
    });

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

  async index(req, res) {
    const students = await Student.findAll({
      attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
    });

    if (students.length === 0) {
      return res.json({ status: 'There are no users registered' });
    }

    return res.json(students);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
    });

    schema.validate(req.body).catch(err => {
      return res.status(400).json({ msg: `Error : ${err.errors}` });
    });

    const student = await Student.findOne({
      where: { email: req.body.email },
    });

    // const { name, email } = student;

    if (!student) {
      return res.status(200).json({ error: 'Student does not exists.' });
    }

    try {
      await student.destroy();
      return res.json({ status: `Student ${student.email} deleted` });
    } catch (err) {
      return res.json({ error: 'Error deleting user.', err });
    }
  }
}

export default new StudentController();
