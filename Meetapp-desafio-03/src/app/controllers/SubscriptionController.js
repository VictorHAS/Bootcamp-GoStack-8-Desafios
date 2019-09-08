import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscription from '../models/Subscription';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          attributes: ['title', 'description', 'date', 'location'],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });
    const user = await User.findByPk(req.userId);

    /**
     * check if user is already subscribed to meetup
     */

    const checkForSubscription = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });

    if (checkForSubscription) {
      return res.status(401).json({
        error: "You can't subscribe twice for the same meetup",
      });
    }

    if (user.id === req.userId) {
      return res.status(401).json({
        error: "You can't subscribe to your own meetup",
      });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'This meeting has already happened' });
    }

    const checkTime = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkTime) {
      return res.status(400).json({
        error:
          "You can't sign up for two meetups that happen at the same time.",
      });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });
    const emailInfo = {
      provider: meetup.User.name,
      provider_email: meetup.User.email,
      user: user.name,
      email: user.email,
      meetup: meetup.title,
      date: meetup.date,
    };

    await Queue.add(SubscriptionMail.key, {
      emailInfo,
    });
    return res.json(subscription);
  }
}

export default new SubscriptionController();
