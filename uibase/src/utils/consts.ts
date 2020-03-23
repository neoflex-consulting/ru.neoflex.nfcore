const rowPerPageMapper = {
    "one": "1",
    "ten": "10",
    "twenty": "20",
    "fifty": "50",
    "oneHundred": "100",
    "fiveHundred": "500",
    "oneThousand": "1000",
    "all": "All"
};

const operationsMapper = {
    "EqualTo": "=",
    "NotEqual": "!=",
    "LessThan": "<",
    "LessThenOrEqualTo": "<=",
    "GreaterThan": ">",
    "GreaterThenOrEqualTo": ">=",
    "IncludeIn": "include",
    "NotIncludeIn": "not include",
    "IsNull": "= null",
    "IsNotNull": "!= null",
};

const diagramAnchorMap: any = {
    "TopLeft":"top-Left",
    "Top": "top",
    "TopRight": "top-right",
    "Left": "left",
    "Center": "center",
    "BottomLeft": "bottom-left",
    "Bottom": "bottom",
    "BottomRight": "bottom-right"
};

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

export {rowPerPageMapper};
export {operationsMapper};
export {colorScheme};
export {diagramAnchorMap};
