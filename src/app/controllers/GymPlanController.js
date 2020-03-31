import * as Yup from 'yup';
import GymPlan from '../models/GymPlan';

class GymPlanController {
  async index(req, res) {
    const plans = await GymPlan.findAll({
      attributes: ['id', 'title', 'duration', 'price', 'total_price'],
      order: [['duration', 'ASC']],
    });

    if (!plans) {
      return res.json({ status: 'There are no plans registered' });
    }

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(3),
      duration: Yup.number()
        .required()
        .positive(),
      price: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Validation is OK

    const { title } = req.body;

    const planExists = await GymPlan.findOne({ where: { title } });

    if (planExists) {
      return res.status(401).json({ error: 'Gym Plan already exists' });
    }

    const newPlan = await GymPlan.create(req.body);

    return res.json({
      message: `Gym Plan '${title}' created succesfully`,
      newPlan,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().min(3),
      duration: Yup.number().positive(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const gymPlan = await GymPlan.findByPk(req.params.id);

    if (!gymPlan) {
      return res.status(400).json({
        error: 'This plan does not exists.',
      });
    }

    const { title } = req.body;

    const findDuplicateGymPlanTitle = await GymPlan.findAll({
      where: { title },
    });

    if (findDuplicateGymPlanTitle.length > 1) {
      return res.status(400).json({
        error: 'This name is already being used.',
      });
    }

    await gymPlan.update(req.body);

    return res.json({
      message: `Plan updated successfully.`,
      gymPlan,
    });
  }

  async delete(req, res) {
    const gymPlan = await GymPlan.findByPk(req.params.id);

    if (!gymPlan) {
      return res.status(400).json({
        error: 'This plan does not exists.',
      });
    }

    try {
      await gymPlan.destroy();
      return res.status(200).json({
        status: `Gym Plan '${gymPlan.title}' deleted`,
      });
    } catch (err) {
      return res.json({ error: 'Error deleting plan.', err });
    }
  }
}

export default new GymPlanController();
