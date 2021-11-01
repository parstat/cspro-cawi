DictionaryReader = {};
LogicReader = {};

DictionaryReader.getNextName = function getNextName(dictionary) {
    dictionary = dictionary.slice(dictionary.search("Name=") + "Name=".length, dictionary.length);
    return dictionary.substring(0, dictionary.search("\n") + 1);
}

DictionaryReader.getNextTitle = function getNextTitle(dictionary) {
    dictionary = dictionary.slice(dictionary.search("Label=") + "Label=".length, dictionary.length);
    return dictionary.substring(0, dictionary.search("\n") + 1);
}


DictionaryReader.getLevels = function getLevels(dct) {
    var levels = dct.split("\[Level\]");
    return levels.slice(1, levels.length);
}

DictionaryReader.getIdItems = function getIdItems(level) {
    if(level.search("IdItem") !== -1) {
        var idItemsString = level.split("\[IdItems\]" )[1].split("\[Record\]")[0];
        var idItems = idItemsString.split("\[Item\]");
        idItems = idItems.slice(1, idItems.length);
        return idItems;
    }
}

DictionaryReader.getLevelRecords = function getLevelRecords(level) {
    var records =  level.split("\[Record\]");
    return records.slice(1, records.length);
}

DictionaryReader.getRecordItems = function getRecordItems(record) {
    var items = record.split("\[Item\]");
    return items.slice(1, items.length);
}

DictionaryReader.getItemValueSets = function getItemValueSets(item) {
    var valueSets = item.split("\[ValueSet\]");
    valueSets = valueSets.slice(1, valueSets.length);
    return valueSets;  
}

DictionaryReader.getValuesetValues = function getValuesetValues(valueSet) {
    if(typeof valueSet !== "undefined") {
        var values = valueSet.split("Value=");
        
        values = values.slice(1, values.length);
        if(typeof values !== "undefined") {
                    for(i = 0; i < values.length; i++) {
                        values[i] = values[i].replace(" ", "");
                    }
                }
        return values;
    }
}

DictionaryReader.getProperty = function getProperty(element, property) {

    var propIndex = element.search(property);
    if(propIndex != -1) {
        var prop = element.slice(propIndex);
        return prop.substring(property.length, prop.search("\n"));
    }
    return "";
}

DictionaryReader.getItemLen = function getLen(item) {
    return DictionaryReader.getProperty(item, "Len=")
}

DictionaryReader.getItemStart = function getStart(item) {
    return DictionaryReader.getProperty(item, "Start=")
}

DictionaryReader.getRecordLen = function getRecordLen(record) {
    return DictionaryReader.getProperty(record, "RecordLen=");
}

DictionaryReader.getMaxRecords = function getMaxRecords(record) {
    var maxRecords =  DictionaryReader.getProperty(record, "MaxRecords=")
    return maxRecords !== "" ? maxRecords : "1";
}

DictionaryReader.getItemDataType = function getDataType(item) {
    var dataTypeIndex = item.search("DataType=");
    if( dataTypeIndex != -1) {
        var datatype = item.slice(dataTypeIndex);
        return datatype.substring("DataType=".length, datatype.search("\n"));
    }
    return "Numeric";
}

DictionaryReader.getItemType = function getQuestionType(valueSet, dataType, len, size) {    
    if(typeof valueSet !== "undefined") {
        //[Item] in cspro includes a [ValueSet]
        //This means that it is a single select question type
        //or multi select question type 
        if(dataType === "Alpha" && len > 1) {
            //usually Item of datatype "Alpha" and Len > 1 are multi select in CSPro
            
            return "checkbox"; //survey js multi select is "checkbox"
            
        }
        if(size < 6) { //single select, radiobutton if items in valueset are less then 6
            return "radiogroup"; 
        }
        return "dropdown";
    }
    return "text"; //for all main types text can be used
}

LogicReader.getAskIf = function getAskIf(logic, itemName) {
    var  searchStart = new RegExp("PROC " + itemName, "i");
    var searchEnd = new RegExp("POSTPROC ", "i");
    console.log(searchStart);
    console.log(searchEnd);
    rule = logic.slice(logic.search(searchStart), logic.search(searchEnd));
    rule = rule.split("ask if")[1];
    if(!(typeof(rule) === 'undefined')) {
        rule = rule.split("\n")[0];
    }
    else {
        rule = "";
    }
    console.log(rule);
    return rule;
}
