import puppeteer, { Browser, Page } from "puppeteer";
import checkValidEmail from "../sanitization/Email.js";

class AutoSurvey {
  private browser: Browser | null = null;
  private scrapper: Page | null = null;
  private website;
  private email;
  private code;

  constructor(email: string, code: string, website: string) {
    checkValidEmail(email);
    this.website = website;
    this.email = email;
    this.code = code;
  }

  async startBrowser() {
    this.browser = await puppeteer.launch({ headless: false }); //{ headless: false }
    this.scrapper = await this.browser.newPage();
    await this.scrapper.goto(this.website);
  }

  async startSurvey() {
    if (!this.scrapper) {
      throw new Error("Attempting to start survey without starting browser!");
    }

    const inputFields = await this.scrapper.$$eval("input", (inputs) => {
      return inputs
        .filter((input) => input.id.startsWith("CN"))
        .map((input) => {
          return {
            name: input.name,
            maxLength: input.maxLength,
            value: input.value,
          };
        });
    });

    let currentSliceStart = 0;
    for (const input of inputFields) {
      const currentSliceEnd = currentSliceStart + input.maxLength;
      await this.scrapper.type(
        `input[id="${input.name}"]`,
        `${this.code.slice(currentSliceStart, currentSliceEnd)}`
      );
      currentSliceStart = currentSliceEnd;
    }

    console.log(inputFields); //all the relevant input fields

    await this.scrapper.click('input[id="NextButton"]');
    await this.scrapper.waitForNavigation();

    const errorElement = await this.scrapper.$(
      'span[name="ErrorMessageOnTopOfThePage"]'
    );
    // if (errorElement) {
    //   throw new Error("Invalid Survey Code!");
    // }
  }

  async fillSurvey() {
    if (!this.scrapper) {
      throw new Error("Attempting to fill survey without starting browser!");
    }

    let result: string;
    while (true) {
      const loadedSurvey = await this.scrapper.waitForSelector(
        "div#Content, div#content"
      );
      if (loadedSurvey) {
        console.log("question loaded");
      }
      const nextButton = await this.scrapper.$('input[id="NextButton"]');
      const emailInputElement = await this.scrapper.$('input[id="S000057"]');
      const blockedPage = await this.scrapper.$('div[id="BlockPage"]');

      if (blockedPage) {
        throw new Error("Coupon has already been used or is expired!");
      }

      if (!emailInputElement && nextButton) {
        await this.scrapper.click('input[id="NextButton"]');
        console.log("next clicked");
        await this.scrapper.waitForResponse(
          (response) => response.status() === 200
        );
      } else if (!emailInputElement && !nextButton) {
        //mcdonalds case
        console.log("final page reached mcdonalds");
        result = await this.getCouponCode();
        break;
      } else {
        //panda express case
        await this.scrapper.type('input[id="S000057"]', `${this.email}`);
        await this.scrapper.type('input[id="S000064"]', `${this.email}`);
        console.log("entered email"); //logging
        await this.scrapper.click('input[id="NextButton"]');
        console.log("final page reached panda"); //logging
        result = "Coupon code was sent to Email";
        break;
      }
    }
    return result;
  }

  private async getCouponCode() {
    //for mcdonalds
    if (!this.scrapper) {
      throw new Error("Attempting to submit survey without starting browser!");
    }

    await this.scrapper.waitForSelector("div#Content, div#content");

    const couponCodeElement = await this.scrapper.$('p[class="ValCode"]');

    if (couponCodeElement) {
      const couponCodeString = await this.scrapper.evaluate(
        (element) => element.textContent,
        couponCodeElement
      );

      // const couponCode = couponCodeString?.match(/\d+/)?.[0];
      // if (!couponCode) {
      //   throw new Error("Coupon code not found in the element text.");
      // }
      if (!couponCodeString) {
        throw new Error("Coupon code not found in the element text.");
      }

      // console.log(couponCode); //logging
      // return couponCode;
      console.log(couponCodeString); //logging
      return couponCodeString;
    } else {
      throw new Error("No Coupon Code found...");
    }
  }

  async endBrowser() {
    if (!this.browser) {
      throw new Error("Attempting to end browser before starting!");
    }
    await this.browser.close();
  }
}

export default AutoSurvey;
