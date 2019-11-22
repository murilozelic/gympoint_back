import Sequelize, { Model } from 'sequelize';

class GymPlan extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        duration: Sequelize.INTEGER,
        price: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default GymPlan;
