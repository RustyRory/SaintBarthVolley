import express from 'express';
import Member from '../../models/Member.js';
import { authMiddleware, requireRole } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const members = await Member.aggregate([
      // 🔗 join MemberSeason
      {
        $lookup: {
          from: 'memberseasons',
          localField: '_id',
          foreignField: 'memberId',
          as: 'seasons',
        },
      },

      // 🔹 unwind seasons
      {
        $unwind: {
          path: '$seasons',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔗 join Season (IMPORTANT pour tri réel)
      {
        $lookup: {
          from: 'seasons',
          localField: 'seasons.seasonId',
          foreignField: '_id',
          as: 'seasonData',
        },
      },

      {
        $unwind: {
          path: '$seasonData',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔥 TRI PAR VRAIE SAISON (et pas createdAt)
      {
        $sort: {
          'seasonData.startDate': -1,
        },
      },

      // 🔹 garder la dernière saison
      {
        $group: {
          _id: '$_id',
          member: { $first: '$$ROOT' },
          latestSeason: { $first: '$seasons' },
          seasonData: { $first: '$seasonData' },
        },
      },

      // 🔗 populate teams
      {
        $lookup: {
          from: 'teams',
          localField: 'latestSeason.teams',
          foreignField: '_id',
          as: 'teamsData',
        },
      },

      // 🎯 FORMAT FINAL
      {
        $project: {
          _id: '$member._id',
          firstName: '$member.firstName',
          lastName: '$member.lastName',
          birthDate: '$member.birthDate',
          bio: '$member.bio',
          photo: '$member.photo',
          isActive: '$member.isActive',
          createdAt: '$member.createdAt',

          latestSeason: {
            _id: '$latestSeason._id',
            seasonId: '$latestSeason.seasonId',
            seasonName: '$seasonData.name',

            roles: '$latestSeason.roles',
            position: '$latestSeason.position',
            height: '$latestSeason.height',
            weight: '$latestSeason.weight',

            teams: '$teamsData',
          },
        },
      },
    ]);

    res.json(members);
  } catch (err) {
    console.error('members-with-season error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
