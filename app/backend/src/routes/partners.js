import express from 'express';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  togglePartnerStatus,
  deletePartner,
} from '../controllers/partnersController.js';

const router = express.Router();

router.get('/', getPartners);
router.get('/:id', getPartnerById);
router.post('/', createPartner);
router.put('/:id', updatePartner);
router.patch('/:id/toggle', togglePartnerStatus);
router.delete('/:id', deletePartner);

export default router;
