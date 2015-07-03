function Matrix(matrix) {
    var self = this;

    self.data = ko.observableArray(matrix);
    self.rows = ko.computed(function () {
        return self.data().length;
    });

    self.columns = ko.computed(function () {
        return self.data()[0]().length;
    });

    self.addRow = function () {
        var row = ko.observableArray(Array(self.columns()).join('.').split('.'));
        self.data.push(row);
    };

    self.removeRow = function () {
        self.data.pop();
    };

    self.addColumn = function () {
        ko.utils.arrayForEach(self.data(), function(item) {
            item.push('');
        });
    };

    self.removeColumn = function () {
        ko.utils.arrayForEach(self.data(), function(item) {
            item.pop();
        });
    };
}

function MatrixViewModel() {
    var self = this;
    self.firstMatrix = ko.observable(new Matrix([
        ko.observableArray([1, 2]),
        ko.observableArray([4, 5]),
        ko.observableArray([7, 8]),
        ko.observableArray([0, 9])
    ]));

    self.secondMatrix = ko.observable(new Matrix([
        ko.observableArray([1, 2, 3, 4]),
        ko.observableArray([5, 6, 7, 8])
    ]));

    self.selectedMatrix = ko.observable();
    self.matrices = [
        {
            id: 0,
            item: self.firstMatrix,
            title: 'A'
        },
        {
            id: 1,
            item: self.secondMatrix,
            title: 'B'
        }
    ];
};

ko.applyBindings(new MatrixViewModel());
