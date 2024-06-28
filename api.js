const urlCasIn = "https://developers.paysera.com/tasks/api/cash-in";
const urlCashOutNaturalPersons =
  "https://developers.paysera.com/tasks/api/cash-out-natural";
const urlCashOutLegalPersons =
  "https://developers.paysera.com/tasks/api/cash-out-juridical";

let getApiDta = async function (url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  getApiDta,
  urlCasIn,
  urlCashOutNaturalPersons,
  urlCashOutLegalPersons,
};
