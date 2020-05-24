import Student from '../models/Student';

class StudentSessionController {
  async index(req, res) {
    const { id } = req.params;

    if (id) {
      const foundStudent = await Student.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      if (!foundStudent) {
        res.json({
          status: 'There are no students with this id.',
        });
      }

      return res.status(200).json(foundStudent);
    }

    return res.status(400).json({ error: 'No id provided' });
  }
}

export default new StudentSessionController();
