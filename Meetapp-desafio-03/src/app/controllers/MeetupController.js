import * as Yup from 'yup';
import { isBefore, parseISO, endOfDay, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.page) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'avatar_id'],
        },
        {
          model: File,
          attributes: ['name', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      date: Yup.date(),
      location: Yup.string(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to change this meetup",
      });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Date invalid' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "Can't change a meeting that happened" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      file_id: Yup.number().required(),
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * check for past dates
     */
    const { date } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past Dates are not permited' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.userId);

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Invalid permissions' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "Can't delete a meeting that happened" });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
