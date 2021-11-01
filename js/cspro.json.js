CSProJson2SurveyJson = {};

CSPro2Json = {};

TextLogic = {};

//add tagbox into matrix columns (run-time)
Survey.matrixDropdownColumnTypes.tagbox = {
    properties: [
        "choices", "choicesOrder", "choicesByUrl", "otherText"
    ],
    onCellQuestionUpdate: function (cellQuestion, column, question, data) {
        Survey
            .matrixDropdownColumnTypes
            .checkbox
            .onCellQuestionUpdate(cellQuestion, column, question, data);
    }
};

CSPro2Json.logic = function getLogic(logic) {
    TextLogic = new Logic.Model(logic);
}

CSPro2Json.transform = function transform(dictionary, logic) {
    var jsonDict = new Dictionary.Model(dictionary);
    var levels = DictionaryReader.getLevels(dictionary);
    CSPro2Json.logic(logic);
    CSPro2Json.addLevels(levels, jsonDict);
    return jsonDict;
}

CSPro2Json.addLevels = function addLevels(levels, jsonDict) {
    levels.forEach(level => {
        var jsonLevel = new Level.Model(level);
        var idItems = DictionaryReader.getIdItems(level);
        CSPro2Json.addIdItems(idItems, jsonLevel);
        var records = DictionaryReader.getLevelRecords(level);
        CSPro2Json.addRecords(records, jsonLevel);
        jsonDict.levels.push(jsonLevel);
    });
}

CSPro2Json.addIdItems = function addIdItems(idItems, jsonLevel) {
    idItems.forEach(idItem => {
        var jsonIdItem = new IdItem.Model(idItem);
        jsonLevel.idItems.push(jsonIdItem);
    })
}

CSPro2Json.addRecords = function addRecords(records, jsonLevel) {
    records.forEach(record => {
        var jsonRecord = new Record.Model(record);
        var items = DictionaryReader.getRecordItems(record);
        CSPro2Json.addItems(items, jsonRecord);
        jsonLevel.records.push(jsonRecord);
    });
}

CSPro2Json.addItems = function addItems(items, jsonRecord) {
    items.forEach(item => {
        var jsonItem = new Item.Model(item);
        jsonItem.askIf = LogicReader.getAskIf(TextLogic.text, jsonItem.name);
        var valueSets = DictionaryReader.getItemValueSets(item);
        CSPro2Json.addValueSets(valueSets, jsonItem);
        jsonRecord.items.push(jsonItem);
    })
}

CSPro2Json.addValueSets = function addValueSets(valueSets, jsonItem) {
    valueSets.forEach(valueSet => {
        var jsonValueSet = new ValueSet.Model(valueSet);
        var values = DictionaryReader.getValuesetValues(valueSet);
        CSPro2Json.addValues(values, jsonValueSet);
        jsonItem.valueSets.push(jsonValueSet);
    })
}

CSPro2Json.addValues = function addValues(values, jsonValueSet) {
    values.forEach(value => {
        var jsonValue = new Value.Model(value);
        jsonValueSet.values.push(jsonValue);
    })
}


CSProJson2SurveyJson.transform = function map(csproJson, surveyJson) {
    surveyJson.name = csproJson.name;
    surveyJson.title = csproJson.label;
    csproJson.levels.forEach(level => {
        level.records.forEach(record => {
           var page = CSProJson2SurveyJson.addPage(record, surveyJson);

        })
    });
}

CSProJson2SurveyJson.addPage = function addPage(csproRecord, surveyJson) {
    var surveyPage = surveyJson.addNewPage(csproRecord.name);
    surveyPage.title = csproRecord.label;
    if(csproRecord.maxRecords < 2) {
        csproRecord.items.forEach(csProRecordItem => {
            CSProJson2SurveyJson.addQuestionToPage(csProRecordItem, surveyPage)
        })
    }
    else {
        CSProJson2SurveyJson.addDynamicMatrix(csproRecord, surveyPage)
    }
}

CSProJson2SurveyJson.addDynamicMatrix = function addDynamicMatrix(csproRecord, surveyPage) {
    var dynamicMatrix = surveyPage.addNewQuestion("matrixdynamic", csproRecord.label);
    dynamicMatrix.horizontalScroll = true;
    dynamicMatrix.columns = [];
    dynamicMatrix.rowCount = 1;
    csproRecord.items.forEach(csProRecordItem => {
        CSProJson2SurveyJson.addNewMatrixColumn(csProRecordItem, dynamicMatrix)
    })
    dynamicMatrix.maxRowCount = csproRecord.maxRecords;
}

CSProJson2SurveyJson.addNewMatrixColumn = function addNewMatrixColumn(csproItem, dynamicMatrix) {
    var column = new Survey.MatrixDropdownColumn();
    column.cellType = CSProJson2SurveyJson.getQuestionType(csproItem, true);
    column.name = csproItem.name;
    column.title = csproItem.label;
    column.maxLength = csproItem.len;
    console.log(csproItem);
    if(csproItem.dataType === "Numeric") {
        if(csproItem.len == 8) {
            column.inputType = "date";
        }
        else {
            column.inputType = "number";
        }
    }
    if(csproItem.valueSets.length > 0) {
        column.choices = csproItem.valueSets[0].values;
    }
    console.log(column);
    //dynamicMatrix.columns = [];
    dynamicMatrix.columns.push(column);
}


CSProJson2SurveyJson.addDynamicPanel = function addDynamicPanel(csproRecord, surveyPage) {
    var dynamicPanel = surveyPage.addNewQuestion("paneldynamic", csproRecord.label);
    var panel = new Survey.PanelModel();
    csproRecord.items.forEach(csProRecordItem => {
        CSProJson2SurveyJson.addTemplateQuestion(csProRecordItem, panel)
    })
    panel.elements.forEach(el => dynamicPanel.templateElements.push(el));
    dynamicPanel.maxPanelCount = csproRecord.maxRecords;
}

CSProJson2SurveyJson.addTemplateQuestion = function addTemplateQuestion(csProItem, dynamicPanel) {
    var templateQuestion = dynamicPanel.addNewQuestion(CSProJson2SurveyJson.getQuestionType(csProItem, false), csProItem.name);
    templateQuestion.title = csProItem.label;
    templateQuestion.maxLength = csProItem.len;
    templateQuestion.enableIf = csProItem.askIf;
    if(csProItem.valueSets.length > 0) {
        templateQuestion.choices = csProItem.valueSets[0].values;
    }
}

CSProJson2SurveyJson.addQuestionToPage = function addQuestionToPage(csProItem, surveyPage) {

    var surveyPageQuestion = surveyPage.addNewQuestion(CSProJson2SurveyJson.getQuestionType(csProItem, false), csProItem.name);
    surveyPageQuestion.title = csProItem.label;
    surveyPageQuestion.maxLength = csProItem.len;
    if(!(csProItem.askIf === "")) {
        surveyPageQuestion.enableIf = "{" + csProItem.askIf.trim()
        .replaceAll(" ", "")
        .replace("=", "}==")
        .replace(";", "");
    }
    if(csProItem.valueSets.length > 0) {
        surveyPageQuestion.choices = csProItem.valueSets[0].values;
    }
}

CSProJson2SurveyJson.getQuestionType = function(csProItem, isMatrix) {
    if(csProItem.valueSets.length > 0 && csProItem.valueSets[0].values.length > 1) {
        if(csProItem.dataType === "Alpha" && csProItem.valueSets[0].values[0].value.length > 1 && csProItem.valueSets[0].values[0].value.slice(1, -1).trim().length < csProItem.len) {
            if(isMatrix) {
                return "tagbox";
            }
            return "checkbox";
        }
        if(isMatrix) {
            return "dropdown";
        }
        if(csProItem.valueSets[0].values.length < 6) {
            return "radiogroup";
        } 
        return "dropdown";
    }
    return "text";
} 