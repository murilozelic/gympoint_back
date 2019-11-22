import * as Yup from 'yup';
import GymPlan from '../models/GymPlan';

class GymPlanController {
  async index(req, res) {
    const plans = await GymPlan.findAll({
      attributes: ['title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(6),
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

    const { title } = req.body;

    const planExists = await GymPlan.findOne({ where: { title } });

    if (planExists) {
      return res.status(401).json({ error: 'Gym Plan already exists' });
    }

    const newPlan = await GymPlan.create(req.body);

    return res.json({
      message: `Gym Plan ${title} created succesfully`,
      newPlan,
    });
  }
}

export default new GymPlanController();
