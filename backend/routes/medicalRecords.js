const express = require('express');
const {
  getMedicalRecords,
  getMedicalRecord,
  getMedicalSummary,
  downloadAttachment,
  getTreatmentTimeline
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getMedicalRecords);
router.get('/summary', getMedicalSummary);
router.get('/timeline', getTreatmentTimeline);
router.get('/:id', getMedicalRecord);
router.get('/:id/attachments/:attachmentId', downloadAttachment);

module.exports = router;
