import { IConfig, ILinks, IHelpers, ISaveFile } from "./interfaces/base";
import { IPuppeteerLink, IPuppeteerFunc } from "./interfaces/puppeteer";
import { ICheerioFunc } from "./interfaces/cheerio";
import { ITast } from "./interfaces/tasks";
import * as moment from "moment";
const config: IConfig = require("dotenv").config().parsed;
const puppeteerFunc: IPuppeteerFunc = require("./services/puppeteer");
const cheerioFunc: ICheerioFunc = require("./services/cheerio");
const helpers: IHelpers = require("./services/helpers");
const createReport: ISaveFile = require("./services/saveFile");
const prompt = require("./services/date");
const chalk = require("chalk");
const Spinner = require("cli-spinner").Spinner;
const sp = new Spinner();
sp.setSpinnerString(18);
moment.locale("ru");

let dateMonthSelect = '';
prompt
  .run()
  .then(
    async (answer: string): Promise<void> => {
      try {
        sp.start();
        const dateMonth: string = moment()
          .month(answer)
          .format("YYYY-MM");
        dateMonthSelect = dateMonth;
        const html: IPuppeteerLink = await puppeteerFunc.getLinkHtml();
        const links: ILinks = await cheerioFunc.parseLink(html, dateMonth);
        helpers.showError(links);
        const content: Array<string> = await puppeteerFunc.getContent(links);
        const implemented: Array<ITast> = await cheerioFunc.parsingData(
          html.name,
          content[0],
          true
        );
        const workedOut: Array<ITast> = await cheerioFunc.parsingData(
          html.name,
          content[1]
        );
        const implementedTasks: Array<ITast> = helpers.preparationData(
          implemented,
          true
        );
        const workedOutTasks: Array<ITast> = helpers.preparationData(workedOut);
        createReport.createReport(workedOutTasks, implementedTasks, dateMonth);
        sp.stop();
      } catch (error) {
        sp.stop();
        console.log(chalk.red(error));
        console.log(chalk.bgRed("Попробуйте запустить снова!"));
      }
    }
  )
  .catch(console.error);

export { dateMonthSelect };