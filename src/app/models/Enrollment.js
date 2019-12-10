import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.INTEGER,
        is_active: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), this.end_date);
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id' });
    this.belongsTo(models.GymPlan, { foreignKey: 'plan_id' });
  }
}

export default Enrollment;
