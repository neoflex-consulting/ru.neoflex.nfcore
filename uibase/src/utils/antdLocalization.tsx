import ruRU from "antd/es/locale/ru_RU";
import enUS from "antd/es/locale/en_US";
import moment from 'moment';

export function switchAntdLocale(locale:string, t: any) {
    //В русской локали английские подписи + перенос пн на первое место
    changeLocale(t);
    //Для перевода кнопок
    switch (locale) {
        case "ru":
            return ruRU;
        case "us":
            return enUS;
        default:
            return ruRU
    }
}

function changeLocale(t:any) {
    moment.updateLocale('en', {
        weekdaysMin : [ t("mon"), t("tue"), t("wed"), t("thu")
            , t("fri"), t("sat"), t("sun")],
        monthsShort : [ t("jan"), t("feb"), t("mar"), t("apr")
            , t("may"), t("jun"), t("jul"), t("aug"), t("sep")
            , t("oct"), t("nov"), t("dec")]
    });
}