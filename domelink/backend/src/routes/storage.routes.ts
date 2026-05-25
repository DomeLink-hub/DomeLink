import { Router } from "express";
import multer from "multer";
import { deleteAsset, listAssets, uploadAsset } from "../controllers/storage.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { MAX_UPLOAD_SIZE_BYTES, isSupportedUploadType } from "../services/storage/optimize.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!isSupportedUploadType(file.mimetype)) {
      cb(new Error("Unsupported file type"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.use(requireAuth);
router.post("/upload", upload.single("file"), uploadAsset);
router.get("/assets", listAssets);
router.delete("/assets/:assetId", deleteAsset);
router.post("/admin/approve", requireRole(["admin"]), (_req, res) => {
  res.status(200).json({ ok: true });
});

export default router;
