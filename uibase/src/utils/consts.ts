
const diagramAnchorMap = {
    "TopLeft":"top-left",
    "Top": "top",
    "TopRight": "top-right",
    "Left": "left",
    "Center": "center",
    "Right": "right",
    "BottomLeft": "bottom-left",
    "Bottom": "bottom",
    "BottomRight": "bottom-right",
};

const positionMap = {
    "Top":"top",
    "Left": "left",
    "Right": "right",
    "Bottom": "bottom",
};

const textAlignMap = {
    "Undefined":undefined,
    "Left":"left",
    "Right":"right",
    "Center":"center"
};

enum positionEnum {
    Top = "top",
    Left = "left",
    Right = "right",
    Bottom = "bottom",
}

const colorScheme = [
    // "#8056CD",
    // "#5680cd",
    // "#56cd80",
    // "#80cd56",
    // "#cd8056",
    // "#cd5680",
    //
    //
    // "#57DAFF",
    // "#57ffda",
    // "#daff57",
    // "#ffda57",
    // "#ff57da",
    // "#da57ff",

    "rgb(61,197,255)",
    "rgb(66,189,251)",
    "rgb(69,183,249)",
    "rgb(73,177,246)",
    "rgb(77,171,273)",
    "rgb(80,166,241)",
    "rgb(83,161,239)",
    "rgb(87,155,236)",
    "rgb(90,149,233)",
    "rgb(94,143,230)",
    "rgb(98,136,227)",
    "rgb(101,130,225)",
    "rgb(107,121,221)",
    "rgb(110,115,218)",
    "rgb(114,110,215)",
    "rgb(117,104,213)",
    "rgb(121,98,210)",
    "rgb(124,93,208)",
    "rgb(128,86,205)",
    "rgb(132,80,202)",
    "rgb(135,75,199)",
    "rgb(138,69,198)"
];

enum actionType {
    execute="execute",
    show="show",
    hide="hide",
    enable="enable",
    disable="disable",
    clear="clear",
    setValue="setValue",
    showMessage="showMessage",
    redirect="redirect",
    backToLastPage="backToLastPage"
}

enum eventType {
    click="click",
    change="change",
    componentLoad="componentLoad",
}

enum grantType {
    read="Read",
    write="Write",
    denied="Denied",
}

const calculatorFunctionTranslator = [
    {key:"ВерхнийРегистр",value:"upper"},
    {key:"СжСимволСправа",value:"rtrim"},
    {key:"НижнийРегистр",value:"lower"},
    {key:"СжСимволСлева",value:"ltrim"},
    {key:"ДлинаСтроки",value:"length"},
    {key:"ТекущВремя",value:"curtime"},
    {key:"Подстрока",value:"substring"},
    {key:"ТекущДата",value:"curdate"},
    {key:"Заменить",value:"replace"},
    {key:"ОкрВверх",value:"ceiling"},
    {key:"К_строке",value:"to_char"},
    {key:"Степень",value:"power"},
    {key:"Секунда",value:"second"},
    {key:"Условие",value:"case"},
    {key:"К_числу",value:"to_number"},
    {key:"ОкрВниз",value:"floor"},
    {key:"Сцепить",value:"concat"},
    {key:"Корень",value:"sqrt"},
    {key:"Минута",value:"minute"},
    {key:"К_дате",value:"to_date"},
    {key:"Месяц",value:"month"},
    {key:"Тогда",value:"then"},
    {key:"Конец",value:"end"},
    {key:"Остат",value:"mod"},
    {key:"Знак",value:"sign"},
    {key:"Если",value:"when"},
    {key:"День",value:"day"},
    {key:"Год",value:"year"},
    {key:"Час",value:"hour"},
    {key:"Или",value:"or"},
    {key:"Пи",value:"pi"},
    {key:"И",value:"and"},

    {key:"确定起来",value:"pi"},
    {key:"确定下来",value:"floor"},
    {key:"余数",value:"mod"},
    {key:"度数",value:"power"},
    {key:"符号",value:"sign"},
    {key:"串联",value:"concat"},
    {key:"年份",value:"year"},
    {key:"月份",value:"month"},
    {key:"小时",value:"hour"},
    {key:"分钟",value:"minute"},
    {key:"第二",value:"second"},
    {key:"替换",value:"replace"},
    {key:"子串",value:"substring"},
    {key:"长度",value:"length"},
    {key:"条件",value:"case"},
    {key:"如果",value:"when"},
    {key:"然后",value:"then"},
    {key:"结束",value:"end"},
    {key:"根",value:"sqrt"},
    {key:"天",value:"day"},
    {key:"下",value:"lower"},
    {key:"上",value:"upper"},
    {key:"和",value:"and"},
    {key:"或",value:"or"},

    {key:"Substring",value:"substring"},
    {key:"To_number",value:"to_number"},
    {key:"Coalesce",value:"coalesce"},
    {key:"Ceiling",value:"ceiling"},
    {key:"Curdate",value:"curdate"},
    {key:"Curtime",value:"curtime"},
    {key:"Replace",value:"replace"},
    {key:"To_date",value:"to_date"},
    {key:"To_char",value:"to_char"},
    {key:"Concat",value:"concat"},
    {key:"Minute",value:"minute"},
    {key:"Second",value:"second"},
    {key:"Nullif",value:"nullif"},
    {key:"Length",value:"length"},
    {key:"Log10",value:"log10"},
    {key:"Floor",value:"floor"},
    {key:"Month",value:"month"},
    {key:"Lower",value:"lower"},
    {key:"Upper",value:"upper"},
    {key:"Ltrim",value:"ltrim"},
    {key:"Rtrim",value:"rtrim"},
    {key:"Ascii",value:"ascii"},
    {key:"Power",value:"power"},
    {key:"Sqrt",value:"sqrt"},
    {key:"Sign",value:"sign"},
    {key:"Acos",value:"acos"},
    {key:"Asin",value:"asin"},
    {key:"Atan",value:"atan"},
    {key:"Year",value:"year"},
    {key:"Hour",value:"hour"},
    {key:"Case",value:"case"},
    {key:"When",value:"when"},
    {key:"Then",value:"then"},
    {key:"Abs",value:"abs"},
    {key:"Mod",value:"mod"},
    {key:"Exp",value:"exp"},
    {key:"Cos",value:"cos"},
    {key:"Sin",value:"sin"},
    {key:"Tan",value:"tan"},
    {key:"Day",value:"day"},
    {key:"End",value:"end"},
    {key:"And",value:"and"},
    {key:"Pi",value:"pi"},
    {key:"Or",value:"or"},
];

enum dmlOperation {
    insert="executeInsert",
    update="executeUpdate",
    delete="executeDelete"
}

const agGridColumnTypes = {
    'Integer':{},
    'Decimal':{},
    'String':{},
    'Date':{},
    'Boolean':{},
    'Timestamp':{},
    'Undefined':{}
};

enum appTypes {
    Integer='Integer',
    Decimal='Decimal',
    String='String',
    Date='Date',
    Boolean='Boolean',
    Timestamp='Timestamp'
}

const defaultIntegerFormat = '### ##0.';
const defaultDecimalFormat = '### ##0.00';
const defaultDateFormat = 'YYYY-MM-DD';
const defaultTimestampFormat = 'YYYY-MM-DD HH:mm:ss' ;

const contextStringSeparator = ",";

export {
    positionMap,
    positionEnum,
    colorScheme,
    diagramAnchorMap,
    actionType,
    eventType,
    grantType,
    calculatorFunctionTranslator,
    dmlOperation,
    agGridColumnTypes,
    defaultDateFormat,
    defaultTimestampFormat,
    defaultDecimalFormat,
    defaultIntegerFormat,
    appTypes,
    textAlignMap,
    contextStringSeparator
}
