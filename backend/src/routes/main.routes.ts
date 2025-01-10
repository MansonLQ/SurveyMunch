import { Router } from "express";

import { mainController } from "../controllers/main.controller.js";

const router = Router();

router.post("/", mainController.postSubmitSurveyCode);

router.post("/scan-receipt", mainController.postScanReceipt);

export default router;
