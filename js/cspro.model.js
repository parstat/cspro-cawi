var Logic = {
    Model: function(logic) {
        this.text = logic;
    }
}
var Dictionary = {
    Model: function(dictionary) {
        this.text = dictionary;
        this.levels = [];
        this.name = DictionaryReader.getNextName(this.text);
        this.label = DictionaryReader.getNextTitle(this.text);
    }
};

var Level = {
    Model: function(level) {
        this.name = DictionaryReader.getNextName(level);
        this.label = DictionaryReader.getNextTitle(level);
        this.idItems = [];
        this.records = [];
    }
};

var IdItem = {
    Model: function(idItem) {
        this.name = DictionaryReader.getNextName(idItem);
        this.label = DictionaryReader.getNextTitle(idItem);
        this.start = DictionaryReader.getItemStart(idItem);
        this.len = DictionaryReader.getItemLen(idItem);
    }
};

var Record = {
    Model: function(record) {
        this.name = DictionaryReader.getNextName(record);
        this.label = DictionaryReader.getNextTitle(record);
        this.recordLen = DictionaryReader.getRecordLen(record);
        this.maxRecords = DictionaryReader.getMaxRecords(record);
        this.items = [];
    }
}

var Item = {
    Model: function(item) {
        this.name =  DictionaryReader.getNextName(item);
        this.label = DictionaryReader.getNextTitle(item);
        this.len = DictionaryReader.getItemLen(item);
        this.dataType = DictionaryReader.getItemDataType(item);
        this.askIf = "";
        //this.itemType = DictionaryReader.getItemType(item);
        this.valueSets = [];
    }
}

var ValueSet = {
    Model: function(valueSet) {
        this.name = DictionaryReader.getNextName(valueSet);
        this.label = DictionaryReader.getNextTitle(valueSet);
        this.values = [];
    }
}

var Value = {
    Model: function(value) {
        var keyValue = value.split(";");
        this.value = keyValue[0];
        this.text = keyValue[1];
    }
}