import { Request, Response, NextFunction } from "express";

import { SurveyInfo } from "../models/surveyData.js";

import AutoSurvey from "../util/scraper/AutoSurvey.js";
import scanReceipt from "../util/ocr/ReceiptScanner.js";

const postSubmitSurveyCode = async (req: Request, res: Response) => {
  const surveyParams: SurveyInfo = req.body;

  console.log(surveyParams); //user email and code information

  let survey;

  try {
    survey = new AutoSurvey(
      surveyParams.email,
      surveyParams.code,
      surveyParams.website //"https://www.mcdvoice.com/" https://www.pandaguestexperience.com/
    );
    await survey.startBrowser();
    await survey.startSurvey();
    const result = await survey.fillSurvey();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An error occurred with the survey",
    });
  } finally {
    if (survey) {
      await survey.endBrowser();
    }
  }
};

const postScanReceipt = async (req: Request, res: Response) => {
  try {
    const scannedCode = await scanReceipt("test/mcdonalds.jpg");
    res.send(`receipt code: ${scannedCode}`);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An error occurred with the receipt",
    });
  }
};

export const mainController = {
  postSubmitSurveyCode,
  postScanReceipt,
};
