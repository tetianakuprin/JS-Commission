let api = require("./api");
let fs = require("fs");
const fileContent = fs.readFileSync("inputData.json");
const placesData = JSON.parse(fileContent);
const userTypeJuridical = "juridical";
const userTypeNatural = "natural";
const typeCashOut = "cash_out";
const typeCashIn = "cash_in";

async function countCommission() {
  const casIn = await api.getApiDta(api.urlCasIn);
  const cashOutNaturalPersons = await api.getApiDta(
    api.urlCashOutNaturalPersons
  );
  const cashOutLegalPersons = await api.getApiDta(api.urlCashOutLegalPersons);
  const results = [];
  const userList = Object.groupBy(placesData, ({ user_id }) => user_id);
  placesData.map((el) => {
    if (el.type === typeCashOut) {
      if (el.user_type === userTypeJuridical) {
        let comCashOutL =
          (el.operation.amount * cashOutLegalPersons.percents) / 100 <
          cashOutLegalPersons.min.amount
            ? cashOutLegalPersons.min.amount
            : (el.operation.amount * cashOutLegalPersons.percents) / 100;
        results.push({
          commission: comCashOutL.toFixed(2),
          amound: el.operation.amount,
        });
      }
      if (el.user_type === userTypeNatural) {
        let sum = 0;
        let currentDate = new Date(el.date);
        let weekDay = currentDate.getDay();
        let endWeek = new Date(el.date);
        endWeek.setDate(currentDate.getDate() - (0 - weekDay));
        let startWeek = new Date(el.date);
        startWeek.setDate(currentDate.getDate() - (6 - weekDay));
        weekDay = currentDate.getDate();
        userList[el.user_id].map((userEl) => {
          if (userEl.type === typeCashOut) {
            let userElDate = new Date(userEl.date);
            if (startWeek <= userElDate && userElDate <= endWeek) {
              sum += userEl.operation.amount;
              comCashOutL =
                sum <= cashOutNaturalPersons.week_limit.amount
                  ? 0
                  : el.operation.amount >
                    cashOutNaturalPersons.week_limit.amount
                  ? ((el.operation.amount -
                      cashOutNaturalPersons.week_limit.amount) *
                      cashOutNaturalPersons.percents) /
                    100
                  : (el.operation.amount * cashOutNaturalPersons.percents) /
                    100;
            }
          }
        });
        results.push({
          commission: comCashOutL.toFixed(2),
          amound: el.operation.amount,
        });
      }
    }
    if (el.type === typeCashIn) {
      let comCashIn =
        (el.operation.amount * casIn.percents) / 100 > casIn.max.amount
          ? casIn.max.amount
          : (el.operation.amount * casIn.percents) / 100;
      results.push({
        commission: comCashIn.toFixed(2),
        amound: el.operation.amount,
      });
    }
  });
  results.map((el) => {
    console.log(
      "Commission ",
      el.commission,
      casIn.max.currency,
      "from amount ",
      el.amound,
      el.commission,
      casIn.max.currency
    );
  });
  return results;
}

countCommission();
