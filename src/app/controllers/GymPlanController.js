import * as Yup from 'yup';
import GymPlan from '../models/GymPlan';

class GymPlanController {
  async index(req, res) {
    const { page = 1, resultsPerPage } = req.query;
    // Usando findAndCountAll é possível encontrar as entradas com os parametros passados
    // e ao mesmo tempo contar o numero total de entradas para fazer a paginação
    const { count, rows } = await GymPlan.findAndCountAll({
      attributes: ['id', 'title', 'duration', 'price', 'total_price'],
      order: ['duration', 'title'],
      offset: (page - 1) * (resultsPerPage || 0),
      limit: resultsPerPage || null,
    });

    /* if (!plans) {
      return res.json({ status: 'There are no plans registered' });
    } */

    return res.json({ plans: rows, totalPlans: count });
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
    const { id } = req.params;

    const gymPlan = await GymPlan.findByPk(id);

    if (!gymPlan) {
      return res.status(400).json({
        error: 'This plan does not exists.',
      });
    }

    const { title } = req.body;

    if (title) {
      const duplicateGymPlanTitle = await GymPlan.findOne({
        where: { title },
      });

      if (duplicateGymPlanTitle && duplicateGymPlanTitle.id !== Number(id)) {
        return res.status(400).json({
          error: 'This name is already being used.',
        });
      }
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
      return res.status(400).json({ /* error: 'Error deleting plan.', */ err });
    }
  }
}

export default new GymPlanController();
